# Deployment & Edge Security Architecture for PrivateSector.ch

## 1. Cloudflare Edge & Traefik Reverse Proxy Dynamics

PrivateSector.ch (`privatesector.ch`) is actively fronted by **Cloudflare** (resolved to Anycast IPs `104.21.85.96` / `172.67.204.109`, returning `server: cloudflare`).

In Coolify deployments on Linux servers, Traefik serves as the primary ingress edge reverse proxy, forwarding incoming traffic to the Astro / EmDash standalone Node.js container.

### Traefik Forwarded Header Mechanics (Verified via Traefik v3.2.0 Test)
- **Official Documentation:** [Traefik EntryPoints Reference](https://doc.traefik.io/traefik/reference/install-configuration/entrypoints/#forwarded-headers)
- **Default Untrusted Behavior:**
  When `forwardedHeaders.trustedIPs` is not configured, Traefik removes incoming `X-Forwarded-For` and `X-Real-IP` from untrusted clients and sets them strictly to the TCP remote socket address of the immediate connecting entity.
- **When Fronted by Cloudflare:**
  Because the TCP connection to Traefik originates from Cloudflare's Anycast proxy servers, Traefik sees Cloudflare's IP as the client address. Without configuring Cloudflare's IP ranges in Traefik's `trustedIPs`, Traefik sets `X-Forwarded-For` to Cloudflare's proxy IP rather than the end visitor.
- **Custom Headers (`CF-Connecting-IP`):**
  Traefik transparently passes non-standard headers through to the backend service without sanitization.
- **Application Security Rule (`client-ip.ts`):**
  `emdash-site/src/lib/client-ip.ts` reads `CF-Connecting-IP` **strictly** when `BEHIND_CLOUDFLARE=true` is set. If this flag is absent or `false`, `CF-Connecting-IP` is ignored to eliminate spoofing risks.

---

## 2. Origin Lockdown: The Threat and Defense Options

If the origin server's public IP address is reachable directly on ports 80/443, an attacker can bypass Cloudflare WAF, rate limits, and caching by sending forged requests directly to the origin host with custom headers (`CF-Connecting-IP: <fake-ip>`).

To guarantee security, the origin host **must be strictly locked down** so that only Cloudflare can deliver traffic to Traefik.

### Critical Warning: Docker Port Publishing Bypasses `ufw`
Docker by default manipulates `iptables` rules directly (inserting rules into the `PREROUTING` and `DOCKER` chains). When a port is published (e.g. `-p 80:80` or `-p 443:443`), Docker directs traffic to the container **before** `ufw` rules are evaluated. 
- Relying solely on `ufw allow` or `ufw deny` will **NOT** block direct traffic to Docker-published ports.
- **Resolution:** Lockdown MUST be enforced at the **provider firewall** (upstream before packets hit the server interface) or explicitly configured within the `DOCKER-USER` chain in `iptables`.

### Architecture Options & Tradeoff Comparison

| Lockdown Option | Architecture & Mechanism | Pros | Cons & Operational Overhead |
| :--- | :--- | :--- | :--- |
| **Option 1: Cloudflare Tunnel (`cloudflared`)** *(Recommended)* | A lightweight daemon (`cloudflared`) runs inside Docker or host, creating outbound-only QUIC/HTTP2 tunnels to Cloudflare edge. | • **Zero open inbound ports** on the server (no port 80/443 needed).<br>• Origin IP address is never revealed in DNS or network scans.<br>• Completely immune to direct-to-origin port scans and bypasses.<br>• Automated SSL and edge routing. | • Adds a small memory overhead (~30MB) for the tunnel container.<br>• In Coolify, requires routing via Traefik or directing tunnel directly to the container service. |
| **Option 2: Cloudflare Authenticated Origin Pulls (AOP)** | Cloudflare presents a client TLS certificate when connecting to the origin over HTTPS (port 443). Traefik validates this certificate against Cloudflare's CA. | • Cryptographic guarantee at TLS handshake level that traffic originates from Cloudflare.<br>• Standard HTTPS on port 443. | • Requires configuring Traefik static configuration with mTLS client auth in Coolify (`entryPoints.websecure.transport.tls.clientAuth`).<br>• Coolify's default UI overrides custom Traefik configs unless managed via file mounts. |
| **Option 3: Provider Firewall Allowlist of Cloudflare IP Ranges** | Upstream provider firewall restricts inbound TCP ports 80/443 strictly to [Cloudflare's published CIDRs](https://www.cloudflare.com/ips/). | • **Zero application or container overhead**.<br>• Defense-in-depth at Layer 3/4 before packets hit the host or container runtime.<br>• Bypasses Docker `ufw` pitfalls. | • Cloudflare IP ranges must be maintained.<br>• **Breaks Let's Encrypt HTTP-01 challenges** (see Section 3). |

---

## 3. SSL/TLS Architecture & The Let's Encrypt HTTP-01 Challenge Issue

### The Issue: Why Restricting Ports 80/443 Breaks Let's Encrypt HTTP-01
The standard ACME HTTP-01 challenge requires Let's Encrypt validation servers to make inbound HTTP requests to `http://<domain>/.well-known/acme-challenge/<token>` on port 80.
- Let's Encrypt validates from multiple ephemeral, globally distributed IP addresses that are **not** part of Cloudflare's IP network.
- If inbound port 80/443 access is restricted strictly to Cloudflare IP ranges in the provider firewall, Let's Encrypt challenge requests will be dropped, causing automated certificate issuance and renewals to fail.

### The Solutions on Coolify

#### Fix Option A (Recommended): Cloudflare Origin CA Certificate + Full (Strict)
Because all visitors connect to Cloudflare, the certificate on the origin host only needs to be trusted by Cloudflare, not by general web browsers.
1. In Cloudflare Dashboard, navigate to **SSL/TLS -> Origin Server** and click **Create Certificate**.
2. Select RSA (2048) or ECDSA, set hostnames (`privatesector.ch`, `*.privatesector.ch`), and choose a validity period (e.g. 15 years).
3. Copy the generated Origin Certificate (`cert.pem`) and Private Key (`key.pem`).
4. In Coolify:
   - For Traefik proxy: Mount the certificate and key into Traefik or paste them under the Custom SSL Certificates configuration for the proxy/service.
   - Configure Traefik dynamic TLS configuration (`/data/coolify/proxy/dynamic/certs.yaml`):
     ```yaml
     tls:
       certificates:
         - certFile: /traefik/certs/privatesector_origin.crt
           keyFile: /traefik/certs/privatesector_origin.key
     ```
5. In Cloudflare Dashboard, set **SSL/TLS encryption mode** to **Full (strict)**.
- **Benefit:** Completely eliminates external ACME challenges, immune to HTTP-01 breakage, valid for up to 15 years with zero renewal maintenance.

#### Fix Option B: ACME DNS-01 Challenge via Cloudflare API
If public Let's Encrypt certificates are required on the origin:
1. In Coolify's Traefik configuration (`/data/coolify/proxy/traefik.yaml`), configure Traefik's `certificatesResolvers` to use `dnsChallenge` with the `cloudflare` provider.
2. Provide the Cloudflare API token via environment variable (`CF_DNS_API_TOKEN`).
3. Let's Encrypt validation occurs via DNS TXT records (`_acme-challenge.privatesector.ch`) through the Cloudflare API, requiring no open inbound port 80 for challenges.

---

## 4. Coolify Dashboard & Server Hardening

1. **Secure the Coolify Dashboard with HTTPS:**
   - In Coolify Settings, configure a fully qualified domain for the dashboard (e.g. `coolify.privatesector.ch`).
   - Route dashboard traffic through Traefik with automated SSL.
2. **Close Public Access to Port 8000:**
   - Once HTTPS is active on the dashboard domain, close inbound TCP port 8000 in the **provider firewall**.
   - Coolify's web UI should only be accessible over HTTPS (port 443) via the domain, or bound strictly to localhost (`127.0.0.1:8000`) accessible via SSH tunnel or WireGuard/Tailscale VPN.
3. **SSH Access:**
   - Restrict port 22 in the provider firewall to administrator static IPs or VPN.

---

## 5. Coolify Traefik Configuration Checklist

In `/data/coolify/proxy/traefik.yaml`:
```yaml
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"
    forwardedHeaders:
      trustedIPs:
        # Cloudflare IPv4 CIDRs
        - "173.245.48.0/20"
        - "103.21.244.0/22"
        - "103.22.200.0/22"
        - "103.31.4.0/22"
        - "141.101.64.0/18"
        - "108.162.192.0/18"
        - "190.93.240.0/20"
        - "188.114.96.0/20"
        - "197.234.240.0/22"
        - "198.41.128.0/17"
        - "162.158.0.0/15"
        - "104.16.0.0/13"
        - "104.24.0.0/14"
        - "172.64.0.0/13"
        - "131.0.72.0/22"
        # Cloudflare IPv6 CIDRs
        - "2400:cb00::/32"
        - "2606:4700::/32"
        - "2803:f800::/32"
        - "2405:b500::/32"
        - "2405:8100::/32"
        - "2a06:98c0::/29"
        - "2c0f:f248::/32"
```

In the Coolify application environment:
```env
BEHIND_CLOUDFLARE=true
NODE_ENV=production
PORT=4321
HOST=0.0.0.0
```

---

## 6. Pre-Launch Verification Checklist

- [ ] `curl -I https://privatesector.ch` returns `Server: cloudflare`.
- [ ] Attempting direct HTTP connection to the origin IP (`curl -I http://<ORIGIN_IP>`) times out or drops connection via provider firewall.
- [ ] Direct connection to port 8000 drops or rejects from untrusted IPs.
- [ ] `process.env.BEHIND_CLOUDFLARE === 'true'` is confirmed in container logs.
- [ ] Client IP resolution in `client-ip.ts` correctly extracts visitor IP via `CF-Connecting-IP`.

---

## 7. Multi-Tier Rate Limiting & Forced-Reset Tradeoff Analysis

The portal authentication system employs a 3-tier defense model to mitigate credential stuffing and password-guessing attacks:

1. **Tier 1 (IP + Account Lockout):**
   - **Threshold:** 5 failed login attempts for a specific `(IP, Account)` pair within a 15-minute window.
   - **Action:** Temporary hard lockout (`HTTP 429`) for that specific IP against that account.
   - **Purpose:** Stops basic brute-force attacks originating from a single address without affecting other users.

2. **Tier 2 (Per-IP Global Cap Across Accounts):**
   - **Threshold:** 25 failed login attempts from a single IP across all accounts within 15 minutes.
   - **Action:** Temporary hard lockout (`HTTP 429`) for the attacking IP address.
   - **Purpose:** Protects the platform from horizontal password spraying (trying one common password across hundreds of different student/company emails from a single source).

3. **Tier 3 (Per-Account Global Cap Across Distributed IPs):**
   - **Threshold:** 15 cumulative failed login attempts on a single target account across distributed or rotating IP addresses within 15 minutes.
   - **Action:** Forces account password reset (`action_required = 'force_reset'`) rather than an indefinite hard IP block.
   - **Tradeoff Analysis & Mitigation:**
     - **The Denial-of-Service Risk (Tradeoff):** An attacker with a rotating proxy pool (e.g. residential proxies, botnet) could deliberately fail 15 login attempts against a known victim's email address, causing legitimate users to encounter a password-reset prompt upon their next login.
     - **Why Forced-Reset is Preferable to Hard Account Lockout:** If Tier 3 applied a hard account lockout (e.g., blocking the account from logging in for 24 hours), the attacker could achieve a 100% sustained Denial-of-Service against key executive or student accounts indefinitely by pinging the endpoint 15 times every window.
     - **Recovery Path:** Under `force_reset`, the legitimate account owner is never locked out indefinitely. The legitimate owner can immediately regain access by requesting a password reset email via the `/api/portal/forgot-password` flow and clicking the cryptographically secure, single-use reset link. Furthermore, once the reset token is consumed, the global failure counter for that account is instantly cleared in `portal_login_attempts`.
     - **Complementary Layer:** Cloudflare WAF Managed Challenge / Turnstile and Bot Management provide upstream mitigation against high-volume automated distributed attacks before they reach the origin.
