import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');
const localUploadsDir = path.resolve(__dirname, 'server', 'uploads');

if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

// 1. Upload image to live server and save locally
async function uploadImage(localImagePath, filenamePrefix) {
  if (!fs.existsSync(localImagePath)) {
    throw new Error(`Image not found at path: ${localImagePath}`);
  }

  const imageBuffer = fs.readFileSync(localImagePath);
  const base64Data = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

  console.log(`[Upload] Uploading image for ${filenamePrefix} to live API...`);
  const response = await fetch('https://privatesector.ch/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: base64Data,
      filename: filenamePrefix
    })
  });

  const data = await response.json();
  if (!data.success || !data.url) {
    throw new Error(`Failed to upload image to live server: ${JSON.stringify(data)}`);
  }

  console.log(`[Upload] Uploaded successfully: ${data.url}`);

  // Also save copy into local server/uploads/ with matching filename
  const localFileName = path.basename(data.url);
  const localDestination = path.join(localUploadsDir, localFileName);
  fs.writeFileSync(localDestination, imageBuffer);
  console.log(`[Upload] Saved local copy at ${localDestination}`);

  return data.url;
}

// 2. Article Definitions
async function getArticles() {
  const brainDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\36a37ec1-e878-447b-b6d9-ed97c2af4bcd';
  
  const droneImgPath = path.join(brainDir, 'us_drone_tariffs_swiss_precision_1786717907044.jpg');
  const appleImgPath = path.join(brainDir, 'apple_houston_ai_manufacturing_1786717924625.jpg');
  const teslaImgPath = path.join(brainDir, 'tesla_texas_solar_factory_1786717948226.jpg');

  const droneImageUrl = await uploadImage(droneImgPath, 'us_drone_tariffs_swiss_precision');
  const appleImageUrl = await uploadImage(appleImgPath, 'apple_houston_manufacturing_ecosystem');
  const teslaImageUrl = await uploadImage(teslaImgPath, 'tesla_texas_solar_factory_supply_chain');

  return [
    // --- ARTICLE 1: U.S. Drone Tariffs ---
    {
      title: "U.S. Drone Tariffs Put Switzerland at 15% — But the Bigger Story Is What Comes Next",
      subtitle: "Washington is raising barriers around foreign drone technology while pushing more production into the United States. Switzerland is directly affected — and Swiss companies may now need to rethink how they approach the American market.",
      category: "Aerospace & Technology",
      author_name: "PrivateSector Intelligence",
      author_avatar: "https://i.pravatar.cc/100?img=33",
      date_published: "2026-08-14",
      read_time_mins: 3,
      pull_quote: "The tariff is today's news. Where Swiss companies choose to manufacture tomorrow could become the bigger story.",
      tags: ["Drone Technology", "U.S. Tariffs", "Precision Engineering", "Sensors", "Autonomous Systems", "Advanced Manufacturing", "U.S.-Swiss Trade", "Supply Chain Localization"],
      image_url: droneImageUrl,
      focus_keyword: "US drone tariffs Switzerland supply chain impact",
      meta_title: "U.S. Drone Tariffs Put Switzerland at 15% — PrivateSector",
      meta_description: "Washington imposes a 15% tariff on Swiss drone tech to force domestic supply chains. Analyze the impact on Swiss sensors, navigation, and U.S. localization ✓",
      slug: "us-drone-tariffs-switzerland-15-percent-impact-supply-chain",
      content_body: `🇺🇸 PRIVATESECTOR — AMERICA 24
FEDERAL ◆ WASHINGTON ◆ 14 AUGUST 2026 ◆ 3 MIN READ

Washington is raising barriers around foreign drone technology while pushing more production into the United States. Switzerland is directly affected — and Swiss companies may now need to rethink how they approach the American market.

The United States has introduced a new tariff regime covering imported drones, drone components and docking stations following a national-security investigation into America's dependence on foreign unmanned-aircraft technology.

For Switzerland, this isn't a distant U.S.–China trade dispute.

Switzerland is directly included.

Under the announced framework, qualifying imports from Switzerland and several other allied economies face a 15% tariff, while some categories of foreign drones face substantially higher rates.

---

## SWISS EXPOSURE & THE NEW TARIFF REGIME

**SWISS EXPOSURE — DIRECT ◆ TARIFF — 15% FOR COVERED SWISS IMPORTS ◆ TIMING — IMMEDIATE BUSINESS ATTENTION**

For Swiss companies selling affected technology into America, the first questions are practical:

- Which products are covered?
- What is their country of origin?
- How does the tariff affect U.S. pricing and margins?
- Can costs be absorbed — or passed to customers?

But that is only the first layer of the story.

---

## THE BIGGER SIGNAL: SUPPLY CHAIN RESHORING

Washington isn't simply making certain imported drones more expensive.

The United States wants to build more of the drone supply chain at home.

That changes the strategic calculation for companies that view America as an important long-term market. For some Swiss exporters, the new regime represents a straightforward risk: products manufactured in Switzerland could become less competitive after the tariff.

For others, however, it raises a fundamental strategic question:

Does entering the next phase of the U.S. drone market require becoming more local?

- **U.S. assembly**
- **American manufacturing**
- **Local partnerships**
- **Technology licensing**
- **Component localization**
- **Acquisition of U.S. capabilities**

None of these represents a guaranteed opportunity. But they are strategic routes worth examining as Washington pushes the industry toward a more domestic supply chain, closely mirroring developments in the [Apple Houston Advanced Manufacturing Ecosystem](/news/apple-houston-manufacturing-ecosystem-swiss-industry) and [Tesla's Texas Solar Factory Supply Chain](/news/tesla-texas-10b-solar-factory-supply-chain-staubli).

---

## WHERE SWITZERLAND COULD FIT

Switzerland's potential relevance extends beyond complete drones.

The country has world-class specialist capabilities across precision engineering, high-accuracy sensors, GPS and autonomous navigation, industrial electronics, autonomous flight systems, and advanced micro-components — capabilities spearheaded by leading Swiss tech innovators like [Logitech](/unternehmen/7).

That means the most interesting Swiss–U.S. opportunity may eventually sit deeper inside the supply chain.

A Swiss company may not need to manufacture an entire drone to benefit from growth in America's domestic drone industry.

It could supply the technology inside it.

The challenge is that Washington increasingly wants critical supply chains localized, a strategic pressure also seen in [America's generic drug reshoring push impacting Sandoz](/news/americas-push-drug-production-home-puts-sandoz-strategic-crossroads). Swiss companies therefore need to distinguish between what can continue to be exported competitively and what might eventually require a dedicated U.S. footprint.

---

## PRIVATESECTOR VIEW

The headline is:
**America introduced new drone tariffs.**

The business question is:
**What should a Swiss company selling drone technology into America do differently today than it did yesterday?**

For some, the answer will be review pricing and margins. For others, review product classification and origin.

And for companies that consider the United States strategically important, the bigger conversation may now be:

**Should part of our American value chain eventually be located in America?**

**SWISS RELEVANCE — VERY HIGH ◆ EXPORT RISK — HIGH FOR COVERED PRODUCTS ◆ OPPORTUNITY — SELECTIVE ◆ U.S. LOCALIZATION — WATCH CLOSELY**

The next signals to watch are implementation details, product classifications, tariff exemptions, Swiss corporate responses, U.S. partnerships, and local manufacturing announcements — alongside broader industrial corridors like the [BMS $2.3B Houston Pharma Campus](/news/bms-building-2-3b-pharma-campus-houston-swiss-opportunity) and the [Swiss Pharma North Carolina Manufacturing Corridor](/news/swiss-pharma-building-north-carolina-power-base-who-could-follow).

The tariff is today's news. Where Swiss companies choose to manufacture tomorrow could become the bigger story.

🇨🇭 ◆ 🇺🇸

Source: Reuters — U.S. drone tariff announcement, 13 August 2026
https://www.reuters.com/world/us/trump-administration-impose-tariffs-drone-imports-white-house-says-2026-08-13/`
    },

    // --- ARTICLE 2: Apple Houston Manufacturing Ecosystem ---
    {
      title: "Apple Is Building More Than Products in Houston — Swiss Industry Should Watch the Ecosystem",
      subtitle: "Apple is expanding advanced manufacturing in Houston for AI servers and Mac mini hardware. For Switzerland, the interesting story isn't simply another American facility — it's the industrial ecosystem being built around it.",
      category: "Advanced Manufacturing",
      author_name: "PrivateSector Intelligence",
      author_avatar: "https://i.pravatar.cc/100?img=33",
      date_published: "2026-08-14",
      read_time_mins: 3,
      pull_quote: "The building is the headline. The manufacturing ecosystem growing around it may be the bigger opportunity.",
      tags: ["Apple", "Houston", "Advanced Manufacturing", "AI Hardware", "Robotics", "Factory Automation", "Precision Engineering", "Swiss Industry", "Texas Tech Corridor"],
      image_url: appleImageUrl,
      focus_keyword: "Apple Houston manufacturing AI servers Swiss industry",
      meta_title: "Apple Houston Manufacturing: What It Means for Swiss Industry",
      meta_description: "Apple expands Houston advanced manufacturing for AI servers & Mac mini. Explore how Swiss precision robotics, sensors, and automation fit into the U.S. supply chain ✓",
      slug: "apple-houston-manufacturing-ecosystem-swiss-industry",
      content_body: `🇺🇸 PRIVATESECTOR — AMERICA 24
ECONOMIC CENTER ◆ HOUSTON ◆ 14 AUGUST 2026 ◆ 3 MIN READ

Apple is expanding advanced manufacturing in Houston. For Switzerland, the interesting story isn't simply another American facility — it's the industrial ecosystem being built around it.

Apple is expanding its manufacturing presence in Houston, Texas, where advanced AI servers are already being assembled and Mac mini production is expected to follow.

But one part of Apple's Houston strategy deserves particular attention:

The company is also developing advanced-manufacturing capabilities designed to support students, suppliers and businesses as America's technology-production ecosystem expands.

For privatesector.ch, that's the signal.

**HOUSTON — ADVANCED MANUFACTURING ◆ AI HARDWARE — EXPANDING ◆ SUPPLIER DEVELOPMENT — IMPORTANT ◆ SWISS RELEVANCE — HIGH**

---

## WHY SWITZERLAND SHOULD CARE

Switzerland doesn't need to manufacture consumer electronics to participate in America's advanced-manufacturing expansion.

Swiss industry has deep, world-renowned capabilities in technologies modern factories depend upon:

- **Automation & Robotics** (championed by Swiss heavyweights like [Bühler Group](/unternehmen/10))
- **Precision engineering & Machine tools**
- **Sensors, Metrology & Measurement**
- **Quality control & Testing systems**
- **Electrical connectivity & Industrial software**

These technologies often sit behind the finished product.

Consumers may see a computer or an AI server. Industry sees the machines, sensors, automation systems, testing equipment and precision components required to manufacture it.

That is where the Swiss angle becomes compelling.

---

## THE SUPPLIER SIGNAL

Apple's focus on developing manufacturing skills around suppliers tells us something important.

America's manufacturing push isn't only about constructing factories. It is increasingly about building the industrial ecosystem surrounding those factories.

That creates a different question for Swiss companies:

**Which technologies will America's next generation of factories require — and which of those capabilities does Switzerland already have?**

Potential areas worth monitoring include:

- Factory automation and robotics
- Precision manufacturing and CNC tooling
- Inspection, metrology, and optical testing
- Electrical connectivity and wire-harness solutions
- Semiconductor-production equipment
- AI-server thermal and manufacturing technology

There is currently no confirmed Swiss supplier opportunity connected to Apple's Houston expansion. That distinction matters. PrivateSector isn't claiming that a contract exists. We are identifying where the industrial ecosystem is moving — and where Swiss capabilities may eventually fit.

**SWISS CAPABILITY — STRONG ◆ DIRECT APPLE OPPORTUNITY — NOT CONFIRMED ◆ SUPPLY-CHAIN SIGNAL — REAL ◆ TIMING — EARLY**

---

## WHERE COULD THE OPPORTUNITY LIE?

The strongest position may belong to Swiss companies that combine advanced engineering with an existing American presence.

As U.S. industrial policy increasingly favors domestic capacity and resilient supply chains, the formula could become:

**SWISS ENGINEERING ◆ AMERICAN PRODUCTION**

That could mean U.S. manufacturing, local assembly, partnerships with American suppliers, or Swiss technology becoming part of a larger U.S.-based manufacturing system. This dynamic echoes the broader Texas industrial expansion, which also includes the [BMS $2.3B Houston Pharma Campus](/news/bms-building-2-3b-pharma-campus-houston-swiss-opportunity) and the [Tesla Texas Solar Gigafactory Proposal](/news/tesla-texas-10b-solar-factory-supply-chain-staubli).

The opportunity isn't necessarily visible in today's Apple announcement. It may emerge in the supplier decisions that follow it.

---

## PRIVATESECTOR VIEW

The conventional headline is:
**Apple is expanding manufacturing in Houston.**

Our question is different:
**What does Apple's investment tell us about the industrial supply chain America is trying to build?**

Apple isn't simply producing more hardware. It is helping develop the manufacturing capabilities and supplier ecosystem needed to support a larger American technology-production base.

For Switzerland's advanced-manufacturing companies, that deserves attention. Not because an Apple contract is waiting today, but because one of the world's largest technology companies is showing where American manufacturing is heading.

**SWISS RELEVANCE — HIGH ◆ OPPORTUNITY — INDIRECT ◆ LOCALIZATION — IMPORTANT ◆ TIMING — EARLY**

### WHAT WE WATCH NEXT

- Apple supplier announcements
- Houston manufacturing equipment procurement
- AI-server production ramp-up
- Automation investments & supplier partnerships
- Swiss industrial expansion in the United States, including [KKR's Integer Medtech integration in Biel/Bienne](/news/kkr-integer-holdings-acquisition-swiss-medtech) and [U.S. Drone Tariff responses](/news/us-drone-tariffs-switzerland-15-percent-impact-supply-chain)

The building is the headline. The manufacturing ecosystem growing around it may be the bigger opportunity.

🇨🇭 ◆ 🇺🇸`
    },

    // --- ARTICLE 3: Tesla Texas Solar Factory Supply Chain ---
    {
      title: "Tesla Is Considering a $10.1 Billion Texas Solar Factory. Swiss Industry Should Watch the Supply Chain",
      subtitle: "Tesla is considering one of America's largest new solar-manufacturing investments in Texas. The headline is $10.1 billion. For Switzerland, the more interesting question is what a project of this scale would need around it.",
      category: "Clean Energy",
      author_name: "PrivateSector Intelligence",
      author_avatar: "https://i.pravatar.cc/100?img=33",
      date_published: "2026-08-14",
      read_time_mins: 3,
      pull_quote: "The $10.1 billion factory is the headline. The supply chain around it could be where the opportunity lies.",
      tags: ["Tesla", "Solar Manufacturing", "Project Crystal Sun", "Stäubli", "Clean Energy", "Texas", "Industrial Automation", "MC4 Connectors", "Photovoltaics"],
      image_url: teslaImageUrl,
      focus_keyword: "Tesla Texas solar factory Stäubli supply chain",
      meta_title: "Tesla's $10.1B Texas Solar Factory: The Swiss Supply Chain Link",
      meta_description: "Tesla weighs a $10.1B solar cell factory in Texas. PrivateSector analyzes how Swiss photovoltaic pioneer Stäubli (MC4) and automation firms position for the boom ✓",
      slug: "tesla-texas-10b-solar-factory-supply-chain-staubli",
      content_body: `🇺🇸 PRIVATESECTOR — AMERICA 24
STATE ◆ TEXAS ◆ 14 AUGUST 2026 ◆ 3 MIN READ

Tesla is considering one of America's largest new solar-manufacturing investments in Texas. The headline is $10.1 billion. For Switzerland, the more interesting question is what a project of this scale would need around it.

Tesla is considering a massive new solar-cell and module manufacturing facility in Fort Bend County, Texas, according to newly reported project plans.

The proposed investment is approximately $10.1 billion.

The project — referred to as **Project Crystal Sun** — could eventually employ more than 9,700 people and manufacture photovoltaic cells and assembled solar modules. Operations are targeted for 2029 if the project proceeds.

But there is an important qualification:

Texas has not won the project yet. Tesla is seeking state and local incentives and is considering at least one alternative U.S. location.

**INVESTMENT — $10.1B ◆ LOCATION — TEXAS UNDER CONSIDERATION ◆ SECTOR — SOLAR MANUFACTURING ◆ STATUS — PROPOSED**

---

## THE HIDDEN SUPPLY-CHAIN STORY

A solar factory of this scale isn't simply a building filled with panels. It requires an industrial ecosystem:

- **Automation & robotics**
- **Electrical connections & cabling**
- **Testing & precision manufacturing equipment**
- **Power electronics & energy management**
- **Factory engineering & logistics infrastructure**

That's where the story becomes relevant to Switzerland.

Instead of asking: *“Will Tesla build another factory?”*
PrivateSector asks: *“What will that factory need — and does Swiss industry already make any of it?”*

---

## ONE SWISS COMPANY ALREADY FITS THE MAP: STÄUBLI

One particularly interesting company is Swiss-founded **Stäubli**.

Stäubli has more than 30 years of photovoltaic experience, and its Original MC4 connector technology is used across more than half of cumulative global PV capacity.

More importantly for this story, Stäubli isn't approaching America as an exporter from zero.

It already manufactures in the United States.

The company has U.S. operations including manufacturing of electrical connectors in California and a major base in South Carolina. It has previously expanded American production of photovoltaic connectors and wire-harness products.

That matters because U.S. clean-energy manufacturing increasingly rewards domestic supply chains.

**SWISS TECHNOLOGY — PROVEN ◆ U.S. MANUFACTURING — EXISTING ◆ SOLAR EXPOSURE — DIRECT ◆ TESLA CONTRACT — NOT CONFIRMED**

There is currently no evidence we have found that Stäubli has been selected as a supplier for Project Crystal Sun. And that's exactly where PrivateSector draws the line between opportunity intelligence and speculation.

The match is worth watching. The contract is not confirmed.

---

## WHERE COULD THE OPPORTUNITY LIE?

If Tesla proceeds with a vertically integrated solar manufacturing complex, the commercial opportunity will extend far beyond photovoltaic cells.

The facility itself could require suppliers across:

- Industrial automation and robotics
- Electrical systems and high-voltage connectors
- Testing equipment and optical inspection
- Precision mechanical components
- Manufacturing execution software
- Advanced cleanroom infrastructure (similar to facilities operated by [Lonza Group](/unternehmen/14) and [Stadler Rail](/unternehmen/9))

Some of those capabilities exist within Swiss industry. The strongest candidates may be companies that have already done what Stäubli has done: **combine Swiss engineering with American manufacturing**.

That structure could become increasingly important as the United States pushes companies toward more localized industrial supply chains, a pattern also evident in [Apple's Houston AI Server Expansion](/news/apple-houston-manufacturing-ecosystem-swiss-industry) and [U.S. Drone Tariff Policies](/news/us-drone-tariffs-switzerland-15-percent-impact-supply-chain).

---

## OPPORTUNITY & RISK

This is still an early-stage signal.

Tesla is considering other locations, incentives remain part of the decision, construction and production would take years, and there is no public supplier list. That means Swiss companies shouldn't treat this as an available contract. They should treat it as a supply chain forming before our eyes.

**SWISS RELEVANCE — HIGH ◆ OPPORTUNITY — EARLY ◆ COMPETITION — HIGH ◆ LOCALIZATION — IMPORTANT ◆ TIMING — WATCH NOW**

---

## PRIVATESECTOR VIEW

The conventional headline is:
**Tesla may spend $10.1 billion on a Texas solar factory.**

Our question is:
**Where will the thousands of components, machines and technologies needed to operate that factory come from?**

Stäubli gives us an important clue. A Swiss industrial company with relevant technology, existing American production and decades of photovoltaic experience is structurally better positioned for America's manufacturing shift than a company trying to enter the market from Switzerland alone.

That doesn't make Stäubli a Tesla supplier. It makes it the type of Swiss company worth watching as America's solar supply chain expands.

The next signals are:
- Texas incentive approval
- Tesla site selection
- Construction awards
- Equipment procurement
- Supplier announcements & new U.S. manufacturing expansions

The $10.1 billion factory is the headline. The supply chain around it could be where the opportunity lies.

🇨🇭 ◆ 🇺🇸`
    }
  ];
}

// 3. Update SQLite Local Database
function updateSQLite(article) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    const schemaMarkup = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": article.meta_description,
      "image": "https://privatesector.ch" + article.image_url,
      "datePublished": article.date_published,
      "dateModified": article.date_published,
      "inLanguage": "en",
      "mainEntityOfPage": `https://privatesector.ch/news/${article.slug}`,
      "keywords": `${article.focus_keyword}, ${article.tags.join(', ')}`,
      "articleSection": article.category,
      "author": {
        "@type": "Organization",
        "name": article.author_name,
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

    db.serialize(() => {
      db.get('SELECT id FROM news WHERE slug = ? OR title = ?', [article.slug, article.title], (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }

        if (row) {
          console.log(`[SQLite] Article exists (ID: ${row.id}). Updating...`);
          const updateStmt = db.prepare(`
            UPDATE news SET 
              title = ?, subtitle = ?, category = ?, author_name = ?, author_avatar = ?, date_published = ?,
              read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?,
              focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?
            WHERE id = ?
          `);
          updateStmt.run([
            article.title, article.subtitle, article.category, article.author_name, article.author_avatar, article.date_published,
            article.read_time_mins, article.content_body, article.pull_quote, JSON.stringify(article.tags), article.image_url,
            article.focus_keyword, article.meta_title, article.meta_description, article.slug, schemaMarkup, row.id
          ], function(uErr) {
            updateStmt.finalize();
            db.close();
            if (uErr) reject(uErr);
            else {
              console.log(`[SQLite] Updated successfully: ${article.slug}`);
              resolve(row.id);
            }
          });
        } else {
          console.log(`[SQLite] Inserting new article: ${article.slug}`);
          const stmt = db.prepare(`
            INSERT INTO news (
              title, subtitle, category, author_name, author_avatar, date_published, 
              read_time_mins, content_body, pull_quote, tags, image_url, 
              focus_keyword, meta_title, meta_description, slug, schema_markup
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run([
            article.title, article.subtitle, article.category, article.author_name, article.author_avatar, article.date_published,
            article.read_time_mins, article.content_body, article.pull_quote, JSON.stringify(article.tags), article.image_url,
            article.focus_keyword, article.meta_title, article.meta_description, article.slug, schemaMarkup
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

// 4. Post to Live Website API
async function publishToLiveApi(article) {
  const schemaMarkup = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.meta_description,
    "image": "https://privatesector.ch" + article.image_url,
    "datePublished": article.date_published,
    "dateModified": article.date_published,
    "inLanguage": "en",
    "mainEntityOfPage": `https://privatesector.ch/news/${article.slug}`,
    "keywords": `${article.focus_keyword}, ${article.tags.join(', ')}`,
    "articleSection": article.category,
    "author": {
      "@type": "Organization",
      "name": article.author_name,
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

  const payload = {
    title: article.title,
    subtitle: article.subtitle,
    category: article.category,
    author_name: article.author_name,
    author_avatar: article.author_avatar,
    date_published: article.date_published,
    read_time_mins: article.read_time_mins,
    content_body: article.content_body,
    pull_quote: article.pull_quote,
    tags: article.tags,
    image_url: article.image_url,
    focus_keyword: article.focus_keyword,
    meta_title: article.meta_title,
    meta_description: article.meta_description,
    slug: article.slug,
    schema_markup: schemaMarkup
  };

  console.log(`[Live API] Publishing "${article.title}" to https://privatesector.ch/api/news...`);
  const response = await fetch('https://privatesector.ch/api/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const resData = await response.json();
  console.log(`[Live API] Response for "${article.slug}":`, resData);
  return resData;
}

// Main Execution
async function main() {
  console.log('=== Starting Publication of 3 PDF Articles (NO GIT PUSH) ===');
  
  const articles = await getArticles();

  for (const article of articles) {
    console.log(`\n-----------------------------------------`);
    console.log(`Processing Article: ${article.title}`);
    console.log(`Slug: ${article.slug}`);
    console.log(`Image: ${article.image_url}`);

    await updateSQLite(article);
    await publishToLiveApi(article);
  }

  console.log('\n=== All 3 Articles Successfully Published to Live Website! ===');
}

main().catch(err => {
  console.error('Fatal publication error:', err);
  process.exit(1);
});
