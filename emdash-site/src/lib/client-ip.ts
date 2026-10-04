/**
 * Client IP Resolution Utility for Traefik, Cloudflare, and Coolify Deployments
 *
 * Traefik Default Behavior & Documentation:
 * Official Documentation: https://doc.traefik.io/traefik/routing/entrypoints/#forwarded-headers
 *
 * Verified Live Findings:
 * 1. By default, Traefik removes incoming `X-Forwarded-For` from untrusted sources and
 *    sets it to the client's actual TCP remote address.
 * 2. When `trustedIPs` is configured on an entryPoint, Traefik trusts that upstream proxy
 *    and appends the remote address to the incoming `X-Forwarded-For` chain.
 *    CRITICAL: Never put private network ranges (e.g. 10.0.0.0/8, 172.16.0.0/12) into `trustedIPs`
 *    because doing so instructs Traefik to trust any container or client on those networks,
 *    allowing them to spoof `X-Forwarded-For`.
 * 3. Traefik passes custom HTTP headers (such as `CF-Connecting-IP`) straight through to the backend.
 *    Therefore, NEVER trust `CF-Connecting-IP` blindly unless:
 *      a) An explicit environment flag `BEHIND_CLOUDFLARE=true` is set.
 *      b) The origin server/firewall strictly restricts port 80/443 to Cloudflare's published IP ranges.
 *    If `BEHIND_CLOUDFLARE` is not 'true', `CF-Connecting-IP` is strictly IGNORED to prevent header spoofing.
 */

// CIDR / Private IP check patterns
const PRIVATE_IP_PATTERNS = [
  /^127\./,                         // Loopback IPv4
  /^::1$/,                          // Loopback IPv6
  /^10\./,                          // RFC1918 class A
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // RFC1918 class B
  /^192\.168\./,                    // RFC1918 class C
  /^fc00:/i,                        // IPv6 Unique Local Address
  /^fe80:/i,                        // IPv6 Link-Local
];

export function isPrivateOrInternalIp(ip: string): boolean {
  const cleanIp = ip.trim().toLowerCase();
  if (!cleanIp) return true;
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(cleanIp));
}

export function extractClientIp(headers: Headers): string {
  // 1. Cloudflare Connecting IP: ONLY honored if BEHIND_CLOUDFLARE=true is explicitly set
  // When active, the origin firewall MUST restrict incoming traffic strictly to Cloudflare CIDRs.
  const isBehindCloudflare = process.env.BEHIND_CLOUDFLARE === 'true';
  if (isBehindCloudflare) {
    const cfConnectingIp = headers.get('cf-connecting-ip');
    if (cfConnectingIp && cfConnectingIp.trim() !== '') {
      return cfConnectingIp.trim();
    }
  }

  // 2. Traefik / Standard Reverse Proxy (X-Forwarded-For)
  // By default, Traefik removes untrusted forwarded headers and sets X-Forwarded-For to the client IP.
  // When an upstream proxy is trusted, Traefik appends to the chain.
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map((s) => s.trim()).filter(Boolean);
    // Walk from rightmost (appended by closest proxy) towards client
    for (let i = ips.length - 1; i >= 0; i--) {
      const candidate = ips[i];
      if (!isPrivateOrInternalIp(candidate)) {
        return candidate;
      }
    }
    // If all IPs are internal/private (e.g. in test or internal VPC), take the rightmost
    if (ips.length > 0) {
      return ips[ips.length - 1];
    }
  }

  // 3. Fallback to X-Real-IP
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp && xRealIp.trim() !== '') {
    return xRealIp.trim();
  }

  return '127.0.0.1';
}
