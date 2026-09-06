import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\1b90510b-200a-4ef7-a4d4-e30610d1becb\\.user_uploaded';
const localUploadsDir = path.resolve(__dirname, 'server', 'uploads');
const publicUploadsDir = path.resolve(__dirname, 'public', 'uploads');
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

if (!fs.existsSync(localUploadsDir)) fs.mkdirSync(localUploadsDir, { recursive: true });
if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });

async function uploadImage(srcFilename, baseName) {
  const filePath = path.join(uploadDir, srcFilename);
  const fileBuf = fs.readFileSync(filePath);
  const b64 = 'data:image/jpeg;base64,' + fileBuf.toString('base64');
  
  // Save local copy in server/uploads & public/uploads
  fs.writeFileSync(path.join(localUploadsDir, `${baseName}.jpg`), fileBuf);
  fs.writeFileSync(path.join(publicUploadsDir, `${baseName}.jpg`), fileBuf);

  // Upload to live site
  console.log(`[Upload] Uploading ${baseName} to live API (https://privatesector.ch/api/upload)...`);
  const res = await fetch('https://privatesector.ch/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: b64, filename: baseName })
  });
  const data = await res.json();
  console.log(`[Upload] Result for ${baseName}:`, data);
  return data.url;
}

const articlesData = [
  {
    srcImage: 'media_1786879705921.jpg',
    baseName: 'mastercard_bvnk_digital_bridge',
    title: "Mastercard Wants to Buy a Bridge Between Traditional Money and Digital Money",
    subtitle: "Mastercard's planned acquisition of BVNK highlights how traditional finance and blockchain settlement rails are converging — with major strategic implications for Swiss banking and digital-asset infrastructure.",
    category: "Fintech & Banking",
    author_name: "PrivateSector Intelligence",
    author_avatar: "https://i.pravatar.cc/100?img=33",
    date_published: "2026-08-16",
    read_time_mins: 3,
    pull_quote: "Trillions of dollars move through ordinary financial activities. And infrastructure sitting underneath ordinary activity can become extraordinarily valuable.",
    tags: ["Mastercard", "BVNK", "Fintech", "Stablecoins", "Digital Assets", "Payments", "UBS", "SIX", "Sygnum", "PostFinance", "Swissquote", "Switzerland"],
    focus_keyword: "Mastercard BVNK acquisition digital assets Switzerland banking",
    meta_title: "Mastercard BVNK Acquisition: Bridge Between Traditional & Digital Money — PrivateSector",
    meta_description: "Mastercard agrees to acquire BVNK for up to $1.8B to connect traditional fiat and blockchain rails. Analysis of what this means for Swiss institutions like UBS, SIX, and Sygnum.",
    slug: "mastercard-bvnk-acquisition-traditional-digital-money-bridge-switzerland",
    content_body: `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 16 AUGUST 2026 ◆ 3 MIN READ ◆ FINTECH ◆ DIGITAL ASSETS ◆ BANKING INFRASTRUCTURE

Forget cryptocurrency prices for a moment. Forget Bitcoin speculation and imagine something far more ordinary: a Swiss company needs to pay an American supplier.

Today, that payment may travel through different banks, currencies and financial systems before reaching the other side. The system works remarkably well, but international money movement can still take time, cost money and depend on traditional settlement processes.

That is what makes Mastercard's planned acquisition of BVNK, valued at up to $1.8 billion, so interesting.

BVNK builds infrastructure connecting traditional currencies with blockchain-based payment rails. Mastercard isn't simply looking at people buying and selling cryptocurrency. The much bigger potential lies in everyday financial activities such as business payments, international money movement, corporate treasury, payouts and settlement.

Suddenly, a story that appears to be about crypto becomes a story about something much larger: how companies may move money in the future.

---

## DIGITAL MONEY COULD BECOME MORE INTERESTING BY BECOMING LESS EXCITING

**NEW TECH — HIGH ATTENTION ◆ MATURING TECH — LESS EXCITING ◆ SETTLEMENT RAILS — MAINSTREAM**

New financial technologies often begin with enormous attention. People talk about the technology itself, prices move dramatically and predictions become increasingly ambitious.

If the technology survives, something different eventually happens.

It becomes ordinary.

Most people don't think about the enormous financial infrastructure operating behind a card payment. They tap their card or phone, the payment works and they continue with their day.

Some blockchain-based financial infrastructure could eventually move in a similar direction. A company may not care that a blockchain is involved. It may simply care that money can move faster, settle efficiently or become available outside traditional banking hours.

That appears to be part of the opportunity Mastercard is preparing for.

---

## AND THIS IS WHERE SWITZERLAND BECOMES INTERESTING

Switzerland already combines two worlds that are often discussed separately: one of the world's most established financial centers and a serious digital-asset ecosystem.

Several Swiss institutions sit particularly close to this development:

- **UBS** — An obvious company to watch. The bank has already explored tokenization and institutional digital-finance infrastructure. If blockchain-based settlement moves further into mainstream corporate and institutional finance, UBS operates directly in markets that could be affected.
- **SIX** — May be even more interesting from an infrastructure perspective. It sits at the heart of Swiss financial-market infrastructure and has developed capabilities around digital securities and tokenized markets. The connection between traditional settlement systems and new digital rails goes directly to the question Mastercard is now exploring.
- **Sygnum** — Operates at the intersection of traditional regulated banking and digital assets. If stablecoins and tokenized money become increasingly useful to institutions and businesses, companies already operating comfortably between those two worlds could become important.
- **PostFinance** — Also worth watching because of its role in Swiss payments and its increasing exposure to digital-asset services.
- **Swissquote** — With its combination of traditional banking and digital-asset capabilities, provides another Swiss example of how previously separate financial worlds are beginning to overlap.

None of these institutions is being presented as part of Mastercard's planned acquisition of BVNK. Their relevance comes from something broader: payments, banking, tokenization and digital assets are beginning to move closer together.

---

## THINK ABOUT THE CORPORATE TREASURER

This becomes much easier to understand when we look at an ordinary multinational company.

Imagine a Swiss business operating across Europe, the United States and Asia. Every day, money moves between customers, suppliers, subsidiaries and banks.

The treasury team doesn't necessarily care whether a payment system sounds technologically exciting. It cares about practical questions: Where is our money? When will it arrive? What currency is it in? How much does moving it cost? Can we access it when we need it? Can we prove where it came from? And can everything remain compliant?

If new payment infrastructure can improve some of those answers safely, businesses may eventually use it.

Not because blockchain is fashionable.

Because it solves a problem.

---

## WHO IN SWITZERLAND SHOULD WATCH THIS?

**UBS — INSTITUTIONAL BANKING & TOKENIZATION ◆ SIX — DIGITAL SETTLEMENT ◆ SYGNUM — REGULATED DIGITAL BANKING ◆ POSTFINANCE — PAYMENTS ◆ SWISSQUOTE — BANKING & DIGITAL ASSETS**

- **UBS** — Institutional banking, tokenization and global payments
- **SIX** — Financial-market and digital-settlement infrastructure
- **Sygnum** — Regulated digital-asset banking
- **PostFinance** — Payments and emerging digital-asset services
- **Swissquote** — Banking and digital-asset infrastructure

The opportunity could extend much further to Swiss fintechs, corporate treasury teams, compliance companies, foreign-exchange specialists and technology providers.

There are still important risks. Regulation, cybersecurity, reserves, counterparty exposure, financial-crime controls and interoperability all matter.

But Mastercard's move tells us something important: one of the world's largest payment companies doesn't want to watch this market develop from the sidelines.

---

## PRIVATESECTOR INSIGHT

Perhaps the biggest stablecoin opportunity will not look like cryptocurrency at all.

It may simply look like a company paying a supplier, a multinational moving money between subsidiaries, a business settling an invoice or a treasury department managing cash overnight.

These activities sound ordinary.

But trillions of dollars move through ordinary financial activities.

And infrastructure sitting underneath ordinary activity can become extraordinarily valuable.

---

## EXECUTIVE CONCLUSION

**SIGNAL — STRONG ◆ SECTOR — PAYMENTS & INFRASTRUCTURE ◆ IMPACT — CONVERGENCE ◆ OUTLOOK — MONITOR WHO CONNECTS NEXT**

Mastercard's planned acquisition of BVNK is not proof that stablecoins will replace traditional banking. That misses the more interesting point.

Traditional finance and new digital infrastructure may increasingly begin working together.

Switzerland is particularly interesting in that world because it combines global financial expertise with a developed digital-asset ecosystem.

The bigger question is therefore not simply whether digital money can attract attention.

It already has.

The real question is who can make it useful enough that businesses eventually stop thinking about the technology behind it.

Mastercard wants to be part of that answer.

UBS, SIX, Sygnum, PostFinance, Swissquote — and the wider Swiss financial industry — have good reason to watch what happens next.

**PRIVATESECTOR INTELLIGENCE | 🇨🇭 Switzerland ↔ United States 🇺🇸**

**We find the signal. You find the opportunity.**`
  },
  {
    srcImage: 'media_1786879705993.jpg',
    baseName: 'thoma_bravo_accelerant_insurance_platform',
    title: "Why Is a Software Investor Paying More Than $4 Billion for an Insurance Platform?",
    subtitle: "Thoma Bravo's $4B+ acquisition of Accelerant signals a profound shift: insurance technology is moving past customer apps and into core underwriting, capital allocation, and risk data.",
    category: "Insurtech & Finance",
    author_name: "PrivateSector Intelligence",
    author_avatar: "https://i.pravatar.cc/100?img=33",
    date_published: "2026-08-16",
    read_time_mins: 3,
    pull_quote: "The next important insurance technology company may not be the one with the most beautiful customer app. It could be the company quietly helping determine which risks are insured, how they are priced and where billions of dollars of insurance capital are allocated.",
    tags: ["Thoma Bravo", "Accelerant", "Insurtech", "Insurance", "Reinsurance", "Underwriting", "Swiss Re", "Zurich Insurance", "Helvetia", "Baloise", "Private Equity"],
    focus_keyword: "Thoma Bravo Accelerant acquisition insurance platform Switzerland",
    meta_title: "Why Thoma Bravo Is Paying $4B+ for Accelerant — PrivateSector Intelligence",
    meta_description: "Thoma Bravo agrees to acquire Accelerant for over $4B at a 49% premium. What the move signals for Swiss Re, Zurich Insurance, Helvetia, and Baloise.",
    slug: "thoma-bravo-4b-accelerant-acquisition-insurance-platform-switzerland",
    content_body: `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 16 AUGUST 2026 ◆ 3 MIN READ ◆ INSURANCE ◆ INSURTECH ◆ PRIVATE EQUITY

At first glance, this looks like another large American acquisition. Thoma Bravo has agreed to acquire Accelerant in a transaction valuing the business at more than $4 billion.

But the price isn't actually the most interesting part of the story.

The better question is: why would one of the world's best-known software investors be willing to spend that much on an insurance platform?

The answer takes us into a part of insurance most customers never see.

Accelerant operates between specialist insurance underwriters — people who understand particular and often complicated risks — and the institutions willing to provide capital behind those risks. Its platform uses technology and data to help connect those two worlds.

Thoma Bravo has agreed to pay $20.25 per share, representing a 49% premium to Accelerant's August 12 closing share price. The transaction is expected to close during the first half of 2027, subject to shareholder and regulatory approvals.

More than $4 billion is a serious valuation. And for Switzerland, it provides an interesting signal about where insurance technology may be heading next.

---

## INSURANCE TECHNOLOGY IS MOVING DEEPER

**CUSTOMER APPS — MATURE ◆ UNDERWRITING & DATA — EXPANDING ◆ CAPITAL ALLOCATION — HIGH VALUE**

For years, digital insurance was easy to see from the outside. Companies built better customer apps, faster online quotations, digital documents and easier claims processes.

Those improvements still matter. But technology is increasingly moving much deeper into the insurance business — into underwriting, risk selection, data, decision-making and capital allocation.

These are not cosmetic improvements. They sit close to the economics of insurance itself:

- Which risks should an insurer accept?
- How should those risks be priced?
- What information does an underwriter need before making a decision?
- Where should capital be allocated?
- How quickly can a specialist insurance program grow?

Better technology can help answer those questions.

And that's why the Accelerant story deserves particular attention in Switzerland.

---

## SWITZERLAND ALREADY HAS SOMETHING EXTREMELY VALUABLE

Switzerland is home to some of the world's deepest insurance and reinsurance expertise. Swiss companies deal with complicated risks ranging from cyberattacks and aviation to energy infrastructure, engineering projects, natural catastrophes and global supply chains.

Technology doesn't necessarily replace that knowledge.

It can make it more powerful.

Imagine an experienced underwriter who previously needed to search through several systems, documents and databases before understanding a risk. Now imagine that same person receiving the relevant information in one place, supported by better analytics and better visibility into historical performance and capital.

The underwriter still makes the decision, but the quality and speed of that decision can improve.

And several major Swiss companies have reason to watch this evolution closely:

- **Swiss Re** — Sits at the heart of global reinsurance and sophisticated risk modelling. Technology capable of improving risk selection, underwriting information and capital deployment is therefore strategically relevant.
- **Zurich Insurance Group** — Has a substantial commercial-insurance business and major operations in the United States. Better underwriting technology and more intelligent use of risk data could directly affect markets in which Zurich already competes.
- **Helvetia** — Also operates across multiple insurance markets and has invested heavily in digital transformation. Developments that make underwriting and specialty insurance more efficient deserve attention.
- **Baloise** — Another Swiss insurer worth watching as insurance technology moves away from purely customer-facing applications and deeper into the operational and analytical core of the business.

None of these companies is being presented as involved in the Accelerant transaction. The point is different: a $4+ billion valuation tells Swiss insurers something about where investors believe value is being created inside insurance.

---

## WHO IN SWITZERLAND SHOULD WATCH THIS?

**SWISS RE — REINSURANCE & RISK MODELLING ◆ ZURICH — COMMERCIAL INSURANCE ◆ HELVETIA — OPERATIONAL TRANSFORMATION ◆ BALOISE — MODERNIZATION**

- **Swiss Re** — Reinsurance, risk modelling and capital allocation
- **Zurich Insurance Group** — Commercial insurance and major U.S. exposure
- **Helvetia** — Insurance technology and operational transformation
- **Baloise** — Digital insurance and underwriting modernization

The strategic question for established insurers is becoming increasingly interesting: should they build these capabilities internally, partner with technology platforms, invest in them, acquire them — or eventually compete against them?

There probably won't be one answer.

But the question is becoming harder to ignore.

---

## PRIVATESECTOR INSIGHT

The next important insurance technology company may not be the one with the most beautiful customer app.

It could be the company quietly helping determine which risks are insured, how they are priced and where billions of dollars of insurance capital are allocated.

That is much closer to the heart of insurance.

Thoma Bravo's willingness to place a multibillion-dollar bet on Accelerant suggests sophisticated technology investors see substantial value in that layer of the industry.

---

## EXECUTIVE CONCLUSION

**SIGNAL — STRONG ◆ VALUATION — $4B+ ◆ STRATEGY — DEEP CORE TECH ◆ IMPLICATION — POWER TO SPECIALIST EXPERTS**

This is more than an American private-equity transaction. It is another sign that technology is moving deeper into underwriting, data and capital.

For Switzerland, that creates competition — but also considerable opportunity.

Swiss insurers already possess decades of expertise and enormous amounts of institutional knowledge. Combining that experience with a new generation of technology could make that knowledge even more valuable.

Perhaps the future of insurance isn't human or machine.

Perhaps it is simply experienced humans with much better machines.

**PRIVATESECTOR INTELLIGENCE | 🇨🇭 Switzerland ↔ United States 🇺🇸**

**We find the signal. You find the opportunity.**`
  },
  {
    srcImage: 'media_1786879705992.jpg',
    baseName: 'archer_aviation_boeing_autonomous_flight',
    title: "Archer Is Buying Three Boeing Businesses. The Bigger Story Is What It Wants to Build Next.",
    subtitle: "Archer Aviation's deal for Boeing's Wisk Aero, Insitu, and SkyGrid unites eVTOL, autonomous flight, and defense drones — opening major supply-chain doors for Swiss precision engineering.",
    category: "Aerospace & Technology",
    author_name: "PrivateSector Intelligence",
    author_avatar: "https://i.pravatar.cc/100?img=33",
    date_published: "2026-08-16",
    read_time_mins: 3,
    pull_quote: "The next generation of aviation may look less like the traditional aircraft industry and more like a technology ecosystem. For Swiss companies, the question isn't simply 'Who will build the aircraft?' It is 'Who will build everything the aircraft needs?'",
    tags: ["Archer Aviation", "Boeing", "Wisk Aero", "Insitu", "SkyGrid", "Autonomous Flight", "Drones", "maxon", "u-blox", "RUAG", "Kopter", "Leonardo", "Aerospace"],
    focus_keyword: "Archer Aviation Boeing Wisk Insitu SkyGrid Swiss supply chain",
    meta_title: "Archer Acquires 3 Boeing Units: Autonomous Flight & Swiss Supply Chain — PrivateSector",
    meta_description: "Archer Aviation acquires Wisk Aero, Insitu, and SkyGrid from Boeing. Analysis of the emerging autonomous aerospace ecosystem and opportunities for Swiss suppliers.",
    slug: "archer-aviation-boeing-businesses-acquisition-autonomous-flight-switzerland",
    content_body: `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 16 AUGUST 2026 ◆ 3 MIN READ ◆ AEROSPACE ◆ AUTONOMOUS SYSTEMS ◆ DEFENSE TECH

For years, Archer Aviation was fairly easy to describe. The California company was building electric aircraft with an ambitious idea: make short urban journeys possible through the sky instead of crowded roads.

But Archer's latest move changes that story considerably.

The company has agreed to acquire three Boeing businesses — Wisk Aero, Insitu and SkyGrid — bringing autonomous flight, unmanned aircraft, defense technology and automated airspace software closer together under one company.

- **Wisk** has spent years developing autonomous electric-flight technology.
- **SkyGrid** develops software designed to help manage increasingly automated airspace.
- **Insitu** operates in a different but increasingly connected world: unmanned aircraft used for intelligence, surveillance and reconnaissance.

According to Archer, Insitu generates more than $200 million in annual revenue and operates across 35 countries. Together, the three businesses bring nearly two million flight hours of experience.

Boeing isn't simply handing over the businesses and leaving. It will become an investor in Archer and continue working with the company through a strategic technology collaboration. The transaction is expected to close by the end of 2026, subject to regulatory and other closing conditions.

---

## THIS IS BECOMING MUCH MORE THAN AN AIR-TAXI STORY

**ELECTRIC FLIGHT + AUTONOMY + DEFENSE + AIRSPACE MANAGEMENT = CONVERGENCE**

Put the pieces together and something interesting begins to appear. Archer is bringing aircraft, drones, artificial intelligence, autonomous flight, defense and airspace software closer together.

Tomorrow's successful aircraft company may therefore need to understand much more than how to build an aircraft. It may also need:
- Software capable of controlling it
- Sensors that understand the environment around it
- Artificial intelligence that helps make decisions
- Communications technology that keeps everything connected
- Digital infrastructure capable of managing increasingly busy autonomous airspace

When an industry changes this way, new supply chains begin to form.

And that is where this American story becomes particularly interesting for Switzerland.

---

## WHERE COULD SWITZERLAND FIT?

Switzerland has spent decades building expertise in areas that could become increasingly valuable in this new aviation market: precision engineering, sensors, robotics, communications, advanced manufacturing, aerospace systems and drone technology.

Sometimes the biggest opportunity isn't building the finished aircraft. It is building one specialized component without which that aircraft cannot operate.

Several Swiss companies therefore deserve a place on the watchlist:

- **maxon** — Particularly interesting because of its high-precision drive systems and expertise in demanding aerospace and robotics applications. As aircraft and drones become increasingly autonomous, precise motion and control technologies become more important.
- **u-blox** — Positioning and wireless-communications technologies operate in areas that matter greatly to autonomous machines, where reliable location, navigation and connectivity are essential.
- **RUAG** — Brings substantial Swiss aerospace and defense expertise. Developments in unmanned systems, autonomous aviation and advanced aerospace manufacturing therefore sit naturally close to its industrial world.
- **Kopter (Leonardo)** — Represents important Swiss-based aircraft engineering and manufacturing expertise. As aircraft design and autonomous technologies evolve, Switzerland's existing aviation engineering base could become increasingly relevant.

These companies are not being presented as Archer suppliers or participants in the Boeing transaction. PrivateSector is identifying them because their technologies and markets sit close to the opportunity developing around autonomous aviation.

---

## WHY THIS MATTERS

**CONVERGENCE — HIGH ◆ SOFTWARE + HARDWARE — INTEGRATED ◆ SWISS PRECISION — UNMATCHED**

The bigger signal behind Archer's move is convergence.

Artificial intelligence is moving out of computers and into physical machines. Commercial technologies are moving into defense. Drones are becoming more autonomous, while aircraft are becoming increasingly dependent on software.

Industries that once looked separate are beginning to overlap.

That creates uncertainty, but it also creates opportunities for highly specialized suppliers that can provide technologies the larger platforms do not want — or do not know how — to build themselves.

Switzerland has built much of its industrial reputation exactly this way: highly specialized products, exceptional precision and technologies that are difficult to replace.

---

## WHO IN SWITZERLAND SHOULD WATCH THIS?

**MAXON — PRECISION DRIVES ◆ U-BLOX — WIRELESS & POSITIONING ◆ RUAG — DEFENSE & AEROSPACE ◆ KOPTER — AIRCRAFT ENGINEERING**

- **maxon** — Precision drive and motion technology
- **u-blox** — Positioning and wireless connectivity
- **RUAG** — Aerospace and defense expertise
- **Kopter / Leonardo** — Swiss-based aircraft engineering

The opportunity is not necessarily to work directly with Archer tomorrow. It is to understand the new aerospace supply chain that companies such as Archer may help create.

---

## PRIVATESECTOR INSIGHT

The next generation of aviation may look less like the traditional aircraft industry and more like a technology ecosystem.

Aircraft manufacturers will need software companies. Software companies will need sensor specialists. Autonomous systems will need communications technology. Defense customers will need reliable manufacturing.

Every connection creates another potential market.

For Swiss companies, the interesting question is therefore not simply “Who will build the aircraft?”

It is “Who will build everything the aircraft needs?”

---

## EXECUTIVE CONCLUSION

**SIGNAL — STRONG ◆ SCALE — 2M+ FLIGHT HOURS ◆ ECOSYSTEM — HARDWARE + AI + AIRSPACE ◆ SWISS PLAY — NICHE HARDWARE & CONNECTIVITY**

Archer's Boeing transaction is bigger than three acquisitions. It is another sign that aviation, artificial intelligence, drones and defense are beginning to form a much more connected technology ecosystem.

For Switzerland, the opportunity may not be written on the side of the aircraft.

It may be hidden somewhere inside it.

What will this new generation of aviation companies need next — and could a Swiss company provide it?

**PRIVATESECTOR INTELLIGENCE | 🇨🇭 Switzerland ↔ United States 🇺🇸**

**We find the signal. You find the opportunity.**`
  }
];

function updateSQLite(art, imgUrl, schemaMarkup) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    db.serialize(() => {
      db.get('SELECT id FROM news WHERE slug = ? OR title = ?', [art.slug, art.title], (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }

        if (row) {
          console.log(`[SQLite] Article exists (ID: ${row.id}): "${art.title}". Updating...`);
          const updateStmt = db.prepare(`
            UPDATE news SET 
              subtitle = ?, category = ?, author_name = ?, author_avatar = ?, date_published = ?,
              read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?,
              focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?
            WHERE id = ?
          `);
          updateStmt.run([
            art.subtitle, art.category, art.author_name, art.author_avatar, art.date_published,
            art.read_time_mins, art.content_body, art.pull_quote, JSON.stringify(art.tags), imgUrl,
            art.focus_keyword, art.meta_title, art.meta_description, art.slug, schemaMarkup, row.id
          ], function(uErr) {
            updateStmt.finalize();
            db.close();
            if (uErr) reject(uErr);
            else {
              console.log(`[SQLite] Updated successfully: ${row.id}`);
              resolve(row.id);
            }
          });
        } else {
          console.log(`[SQLite] Inserting new article: "${art.title}"...`);
          const stmt = db.prepare(`
            INSERT INTO news (
              title, subtitle, category, author_name, author_avatar, date_published, 
              read_time_mins, content_body, pull_quote, tags, image_url, 
              focus_keyword, meta_title, meta_description, slug, schema_markup
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run([
            art.title, art.subtitle, art.category, art.author_name, art.author_avatar, art.date_published,
            art.read_time_mins, art.content_body, art.pull_quote, JSON.stringify(art.tags), imgUrl,
            art.focus_keyword, art.meta_title, art.meta_description, art.slug, schemaMarkup
          ], function(iErr) {
            const id = this ? this.lastID : null;
            stmt.finalize();
            db.close();
            if (iErr) reject(iErr);
            else {
              console.log(`[SQLite] Inserted successfully with ID: ${id}`);
              resolve(id);
            }
          });
        }
      });
    });
  });
}

async function postToLiveApi(art, imgUrl, schemaMarkup) {
  try {
    // Check if article already exists on live API
    const getRes = await fetch('https://privatesector.ch/api/news');
    const existingList = await getRes.json();
    const existing = Array.isArray(existingList) ? existingList.find(a => a.slug === art.slug || a.title === art.title) : null;

    const payload = {
      title: art.title,
      subtitle: art.subtitle,
      category: art.category,
      author_name: art.author_name,
      author_avatar: art.author_avatar,
      date_published: art.date_published,
      read_time_mins: art.read_time_mins,
      content_body: art.content_body,
      pull_quote: art.pull_quote,
      tags: art.tags,
      image_url: imgUrl,
      focus_keyword: art.focus_keyword,
      meta_title: art.meta_title,
      meta_description: art.meta_description,
      slug: art.slug,
      schema_markup: schemaMarkup
    };

    if (existing && existing.id) {
      console.log(`[Live API] Updating existing article ID: ${existing.id} on https://privatesector.ch/api/news/${existing.id}...`);
      const res = await fetch(`https://privatesector.ch/api/news/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`[Live API] Update response:`, data);
    } else {
      console.log(`[Live API] Inserting new article into https://privatesector.ch/api/news...`);
      const res = await fetch('https://privatesector.ch/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`[Live API] Insert response:`, data);
    }
  } catch (err) {
    console.error(`[Live API] Error posting to live API:`, err.message);
  }
}

async function main() {
  console.log('=== Starting Publication of 3 Articles ===\n');

  for (let i = 0; i < articlesData.length; i++) {
    const art = articlesData[i];
    console.log(`\n--- [Article ${i + 1}/${articlesData.length}] "${art.title}" ---`);

    // 1. Upload image to live server
    const imgUrl = await uploadImage(art.srcImage, art.baseName);
    console.log(`Image URL: ${imgUrl}`);

    // 2. Generate schema markup
    const schemaMarkup = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": art.title,
      "description": art.meta_description,
      "image": "https://privatesector.ch" + imgUrl,
      "datePublished": art.date_published,
      "author": {
        "@type": "Organization",
        "name": art.author_name,
        "url": "https://privatesector.ch"
      },
      "publisher": {
        "@type": "Organization",
        "name": "PrivateSector",
        "logo": {
          "@type": "ImageObject",
          "url": "https://privatesector.ch/assets/logo_highres.png"
        }
      }
    }, null, 2);

    // 3. Update SQLite
    await updateSQLite(art, imgUrl, schemaMarkup);

    // 4. Update Live API
    await postToLiveApi(art, imgUrl, schemaMarkup);
  }

  console.log('\n=== All 3 Articles Published! Verifying live site... ===');
  const verifyRes = await fetch('https://privatesector.ch/api/news');
  const allLive = await verifyRes.json();
  console.log(`Total live articles now: ${allLive.length}`);
  console.log(allLive.slice(0, 5).map(a => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    category: a.category,
    image_url: a.image_url
  })));
}

main().catch(console.error);
