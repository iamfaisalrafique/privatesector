import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'C:\\Users\\Faisal\\.gemini\\antigravity-ide\\brain\\4f0851fc-32f4-4d1f-b4cb-54ce12184575\\.user_uploaded';
const localUploadsDir = path.resolve(__dirname, 'server', 'uploads');
const publicUploadsDir = path.resolve(__dirname, 'public', 'uploads');
const distUploadsDir = path.resolve(__dirname, 'dist', 'uploads');
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

if (!fs.existsSync(localUploadsDir)) fs.mkdirSync(localUploadsDir, { recursive: true });
if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });
if (fs.existsSync(path.resolve(__dirname, 'dist')) && !fs.existsSync(distUploadsDir)) {
  fs.mkdirSync(distUploadsDir, { recursive: true });
}

async function uploadImage(srcFilename, baseName) {
  const filePath = path.join(uploadDir, srcFilename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Source image not found at ${filePath}`);
  }

  const fileBuf = fs.readFileSync(filePath);
  const b64 = 'data:image/jpeg;base64,' + fileBuf.toString('base64');
  
  // Save local copies in server/uploads, public/uploads & dist/uploads
  fs.writeFileSync(path.join(localUploadsDir, `${baseName}.jpg`), fileBuf);
  fs.writeFileSync(path.join(publicUploadsDir, `${baseName}.jpg`), fileBuf);
  if (fs.existsSync(distUploadsDir)) {
    fs.writeFileSync(path.join(distUploadsDir, `${baseName}.jpg`), fileBuf);
  }
  console.log(`[Local Upload] Saved local image copies as ${baseName}.jpg`);

  // Upload to live site
  try {
    console.log(`[Upload] Uploading ${baseName} to live API (https://privatesector.ch/api/upload)...`);
    const res = await fetch('https://privatesector.ch/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: b64, filename: baseName })
    });
    const data = await res.json();
    console.log(`[Upload] Result for ${baseName}:`, data);
    if (data && data.url) {
      return data.url;
    }
  } catch (err) {
    console.error(`[Upload] Error uploading to live server:`, err.message);
  }

  return `/uploads/${baseName}.jpg`;
}

const articlesData = [
  // ARTICLE 1: AMYLYX GLP-1
  {
    srcImage: 'media_1787155561445.jpg',
    baseName: 'glp1_another_side_amylyx_avexitide_phase3_lucidity',
    title: "GLP-1 Has Another Side — Amylyx Reports a 55% Reduction in Key Hypoglycemic Events",
    subtitle: "Amylyx Pharmaceuticals reports a 55% reduction in Level 2/3 hypoglycemic events in Phase 3 LUCIDITY for avexitide. Why blocking GLP-1 post-bariatric surgery could open a multi-billion-dollar therapeutic frontier for Swiss pharma.",
    category: "Biotechnology",
    author_name: "PrivateSector Intelligence",
    author_avatar: "https://i.pravatar.cc/100?img=33",
    date_published: "2026-08-19",
    read_time_mins: 3,
    pull_quote: "When an industry becomes obsessed with one direction, interesting opportunities sometimes appear in the other direction. Don't only search for the next obesity drug — search for the businesses being created around the GLP-1 economy itself.",
    tags: [
      "GLP-1",
      "Amylyx Pharmaceuticals",
      "Avexitide",
      "Post-Bariatric Hypoglycemia",
      "Phase 3 LUCIDITY",
      "Biotechnology",
      "Metabolic Medicine",
      "Roche",
      "Novartis",
      "Switzerland",
      "United States",
      "FDA",
      "GLP-1 Antagonist",
      "Bariatric Surgery"
    ],
    focus_keyword: "GLP-1 Amylyx Avexitide post-bariatric hypoglycemia Phase 3 LUCIDITY Swiss pharma",
    meta_title: "GLP-1 Has Another Side: Amylyx Reports 55% Hypoglycemia Reduction — PrivateSector",
    meta_description: "Amylyx's Phase 3 LUCIDITY study shows avexitide reduces hypoglycemic events by 55% by blocking GLP-1. Discover what this means for Swiss pharma giants like Roche and Novartis.",
    slug: "glp-1-has-another-side-amylyx-reports-55-percent-reduction-hypoglycemic-events",
    content_body: `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 19 AUGUST 2026 ◆ 3 MIN READ ◆ BIOTECHNOLOGY ◆ METABOLIC MEDICINE ◆ CLINICAL TRIALS

Mention GLP-1 today and almost everybody thinks about one thing:

**Weight loss.**

The pharmaceutical industry has spent years racing toward medicines that activate the GLP-1 receptor.

But a U.S. biotechnology company is approaching GLP-1 from almost the opposite direction.

**It wants to block it.**

And new Phase 3 results have put that strategy firmly on the PrivateSector radar.

Amylyx Pharmaceuticals reported that its investigational medicine **avexitide** reduced Level 2 and Level 3 hypoglycemic events by **55%** compared with placebo in its Phase 3 LUCIDITY study.

---

## WHY WOULD ANYONE BLOCK GLP-1?

**POST-BARIATRIC HYPOGLYCEMIA ◆ EXAGGERATED GLP-1 RESPONSE ◆ RECEPTOR ANTAGONISM**

Because GLP-1 isn't only about weight loss.

Some people who undergo bariatric surgery can later develop **post-bariatric hypoglycemia**.

Their blood sugar can fall dangerously low after eating. The condition can seriously disrupt everyday life and, in severe cases, become dangerous.

Amylyx believes an exaggerated GLP-1 response contributes to the problem.

Its answer is **avexitide**.

Rather than stimulating the GLP-1 receptor, the medicine is designed to block it.

---

## THE NUMBER THAT MATTERS: 55%

**PHASE 3 LUCIDITY ◆ 78 PARTICIPANTS ◆ 16-WEEK PRIMARY ENDPOINT ◆ U.S. REGULATORY FILING**

The Phase 3 LUCIDITY study included 78 participants.

According to Amylyx:

- **Primary Result:** Avexitide produced a **55% reduction** in Level 2/3 hypoglycemic events versus placebo over 16 weeks.
- **Unmet Need:** There is currently **no FDA-approved therapy** specifically for post-bariatric hypoglycemia.
- **Next Step:** Amylyx plans to pursue a U.S. regulatory submission.

That means a relatively small biotechnology company could potentially be approaching a market where patients still lack a specifically approved treatment.

---

## THE GLP-1 ECONOMY IS BECOMING MUCH BIGGER

**FIRST CHAPTER — DIABETES & OBESITY ◆ SECOND CHAPTER — THE GLP-1 ECOSYSTEM**

This is where PrivateSector believes the story becomes particularly interesting.

The first chapter of the GLP-1 revolution has been dominated by:
- **Diabetes**
- **Obesity**

But pharmaceutical revolutions rarely stop with the first successful indication. Around major biological pathways, entire ecosystems emerge:

- **New Indications:** Exploring metabolic, cardiovascular, renal, and neurological conditions.
- **Antagonists & Blockers:** Targeting hyper-response complications and post-surgical side effects.
- **Combination Treatments:** Synergistic multi-target formulations.
- **Diagnostics & Monitoring:** Continuous glucose and biomarker tracking.
- **Side-Effect Management:** Addressing GI and muscle mass considerations.
- **Complication Treatment:** Specialized interventions across patient cohorts.

And, as Amylyx demonstrates, even medicines designed to produce the opposite receptor effect.

---

## 🇨🇭 WHY SWITZERLAND SHOULD CARE

**ROCHE ◆ NOVARTIS ◆ BASEL PHARMA CLUSTER ◆ TRANSATLANTIC LICENSING & M&A**

Switzerland sits at the center of global pharmaceutical innovation.

Companies such as **Roche** are heavily exposed to cardiometabolic research and the broader transformation taking place around obesity and metabolic disease.

But Swiss companies and investors shouldn't look only for the next blockbuster weight-loss drug.

There may be substantial value around the edges of the revolution.

The companies solving problems created by, associated with, or biologically adjacent to GLP-1 medicine could become important **partnership, licensing, or acquisition candidates**.

---

## 🔎 PRIVATESECTOR VIEW

**OPPOSITE DIRECTION OPPORTUNITY ◆ ADJACENT ECOSYSTEMS ◆ STRATEGIC THESIS**

When an industry becomes obsessed with one direction, interesting opportunities sometimes appear in the other direction.

Right now, enormous attention is focused on:
- *Who can build a better GLP-1 agonist?*

Amylyx asks a different question:
- *Where might blocking GLP-1 actually help patients?*

That difference is what makes the development interesting. And it points toward a much larger investment thesis:

**Don't only search for the next obesity drug. Search for the businesses being created around the GLP-1 economy itself.**

---

## PRIVATESECTOR INTELLIGENCE CARD

**AMYLYX PHARMACEUTICALS ◆ AVEXITIDE ◆ PHASE 3 LUCIDITY**

- 🏢 **Company:** Amylyx Pharmaceuticals
- 💊 **Drug:** Avexitide
- 🔬 **Trial:** Phase 3 LUCIDITY (78 participants)
- 📊 **Key Result:** 55% reduction in Level 2/3 hypoglycemic events vs placebo
- 🎯 **Condition:** Post-bariatric hypoglycemia
- ⚙️ **Mechanism:** GLP-1 receptor antagonist
- 🚀 **Next Major Step:** U.S. FDA regulatory submission pathway
- 🇨🇭 **Swiss Relevance:** Pharma ★ Metabolic medicine ★ Licensing ★ Investment

---

## PRIVATESECTOR INTELLIGENCE SCORE

**9.3/10 — TOP SIGNAL 🔴**

- **Clinical Significance:** ★★★★★
- **Innovation:** ★★★★★
- **Swiss Pharma Relevance:** ★★★★☆
- **Market Potential:** ★★★★☆
- **Strategic Signal:** ★★★★★

**Executive Conclusion:**
The GLP-1 story is becoming much larger than weight loss. Amylyx's Phase 3 result shows how new businesses can emerge from different parts of the same biological pathway.

For Swiss pharmaceutical companies and investors, the lesson is simple:
**Don't only watch the center of a pharmaceutical revolution. Sometimes the next opportunity is developing around its edges.**

---

Source: Amylyx corporate and regulatory materials concerning the Phase 3 LUCIDITY study. Avexitide remains investigational and has not been approved by the FDA for post-bariatric hypoglycemia.`
  },

  // ARTICLE 2: BIOMARIN ALESTA ALE1
  {
    srcImage: 'media_1787155593212.jpg',
    baseName: 'biomarin_490_million_acquisition_alesta_therapeutics_ale1',
    title: "BioMarin Makes a $490 Million Move for the Next Rare-Disease Breakthrough — Switzerland Should Watch",
    subtitle: "BioMarin agrees to acquire Alesta Therapeutics for up to $490M to secure ALE1, an investigational oral treatment for hypophosphatasia. What transatlantic rare-disease M&A teaches Swiss biotech founders and investors.",
    category: "Biotechnology & M&A",
    author_name: "PrivateSector Intelligence",
    author_avatar: "https://i.pravatar.cc/100?img=33",
    date_published: "2026-08-19",
    read_time_mins: 3,
    pull_quote: "You don't necessarily need to become the next Roche. Build something scientifically differentiated, generate convincing evidence, protect the IP — and the world's largest pharma companies may come looking.",
    tags: [
      "BioMarin",
      "Alesta Therapeutics",
      "ALE1",
      "Hypophosphatasia",
      "Rare Diseases",
      "Biotechnology",
      "M&A",
      "Pharmaceuticals",
      "Switzerland",
      "United States",
      "Roche",
      "Novartis",
      "Licensing",
      "IP Valuation",
      "Oral Therapy"
    ],
    focus_keyword: "BioMarin Alesta Therapeutics acquisition 490 million ALE1 rare disease Swiss biotech",
    meta_title: "BioMarin Makes $490M Move for Alesta Therapeutics — PrivateSector Intelligence",
    meta_description: "BioMarin agrees to acquire Alesta Therapeutics for up to $490M for oral rare-disease candidate ALE1. PrivateSector analyzes key takeaways for Swiss biotech and M&A.",
    slug: "biomarin-makes-490-million-move-alesta-therapeutics-rare-disease-breakthrough",
    content_body: `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 19 AUGUST 2026 ◆ 3 MIN READ ◆ BIOTECHNOLOGY ◆ M&A ◆ RARE DISEASE

Some of the pharmaceutical industry's most valuable assets are not factories.

They are not brands.

They are not even medicines being sold today.

Sometimes, they are molecules that could become tomorrow's medicine.

And California-based **BioMarin** is prepared to put almost half a billion dollars behind one of them.

BioMarin has agreed to acquire **Alesta Therapeutics** in a transaction carrying **up to $490 million** in potential consideration.

The structure is striking:
- **$275 million** upfront.
- **Up to $215 million** in development and regulatory milestones.

And at the center of the transaction sits one experimental medicine: **ALE1**.

---

## THE MOLECULE BEHIND THE MONEY

**ALE1 ◆ ORAL HYPOPHOSPHATASIA CANDIDATE ◆ UNMET MEDICAL NEED ◆ TARGETED ACQUISITION**

**ALE1** is being developed as an oral treatment for **hypophosphatasia**, a rare genetic disorder affecting bones and teeth.

There is currently no approved oral treatment specifically for the disease.

For BioMarin — a company built around therapies for rare genetic conditions — that makes ALE1 strategically compelling.

But BioMarin isn't simply buying everything Alesta has created. Alesta plans to separate its other programs before completion of the transaction.

That means BioMarin is making a highly targeted bet: **it wants ALE1.**

---

## WHY PAY SO MUCH BEFORE COMMERCIALISATION?

**EARLY-STAGE VALUE CREATION ◆ SCIENTIFIC POTENTIAL ◆ REGULATORY UPSIDE**

This is where the transaction becomes particularly interesting.

BioMarin isn't paying hundreds of millions for an established blockbuster generating billions in annual sales.

It is paying for potential:
- **Scientific potential**
- **Clinical potential**
- **Regulatory potential**
- **And eventually, commercial potential**

That is one of the defining characteristics of modern biotechnology: a company can create enormous value long before millions of patients ever receive its medicine.

---

## 🇨🇭 SWITZERLAND SHOULD PAY ATTENTION

**WORLD-CLASS RESEARCH ◆ MOLECULES OVER FACTORIES ◆ TRANSATLANTIC CAPITAL SYNERGY**

Switzerland understands this business model extremely well.

The country is home to one of the world's deepest life-sciences ecosystems — pharmaceutical giants, biotechnology innovators, universities, laboratories, specialist investors, and highly skilled researchers.

Switzerland doesn't need to compete with America purely by manufacturing more medicines.

Sometimes the most valuable export is something much smaller:
- **A molecule**
- **A patent**
- **A clinical program**
- **A platform**
- **Or scientific knowledge that a global pharmaceutical company decides it cannot afford to ignore**

The BioMarin–Alesta transaction is another example of how that value is realised: **European science ➔ Clinical development ➔ Global pharma interest ➔ American capital.**

---

## WHAT SWISS BIOTECH FOUNDERS SHOULD NOTICE

**DIFFERENTIATION ◆ STRONG EVIDENCE ◆ IP PROTECTION ◆ EXIT STRATEGY**

There is an important lesson here for smaller Swiss biotechnology companies.

You don't necessarily need to become the next Roche.

You don't necessarily need a global sales organisation.

And you don't necessarily need to commercialise every medicine yourself.

- **Build something scientifically differentiated.**
- **Generate convincing clinical evidence.**
- **Protect the intellectual property.**
- **Advance it far enough clinically.**

And the world's largest pharmaceutical companies may eventually come looking.

---

## 🔎 PRIVATESECTOR VIEW

**BUYING TIME & SCIENTIFIC POSSIBILITY ◆ SWISS IP EXPORT ◆ INNOVATION ARBITRAGE**

The headline is **$490 million**. But that's not really what BioMarin is buying.

BioMarin is buying **time and scientific possibility**.

Instead of beginning from a blank laboratory bench and spending years discovering its own molecule, the company acquires a program that has already travelled part of that journey.

For Switzerland, that matters immensely.

One of the country's greatest economic advantages is precisely the ability to transform scientific knowledge into extremely valuable intellectual property.

The opportunity is not always *manufacture more*. Sometimes it is: **discover something the world needs.**

---

## PRIVATESECTOR INTELLIGENCE CARD

**BIOMARIN PHARMACEUTICAL ◆ ALESTA THERAPEUTICS ◆ ALE1 PROGRAM**

- 🏢 **Buyer:** BioMarin Pharmaceutical (United States 🇺🇸)
- 🎯 **Target:** Alesta Therapeutics
- 💰 **Potential Consideration:** Up to $490M
- 💵 **Upfront Cash:** $275M
- 📈 **Potential Milestones:** Up to $215M
- 💊 **Lead Asset:** ALE1 (Investigational oral therapy for hypophosphatasia)
- 🧬 **Field:** Rare genetic diseases & bone disorders
- ⚡ **Strategic Theme:** Clinical-stage targeted biotech acquisition
- 🇨🇭 **Swiss Relevance:** Biotech ★ Pharma ★ IP Valuation ★ Licensing ★ Investment

---

## PRIVATESECTOR INTELLIGENCE SCORE

**9.5/10 — TOP SIGNAL 🔴**

- **Transaction Scale:** ★★★★☆
- **Scientific Potential:** ★★★★★
- **Swiss Relevance:** ★★★★★
- **Strategic Importance:** ★★★★★
- **Future Potential:** ★★★★★

**Executive Conclusion:**
BioMarin's proposed acquisition of Alesta shows once again where enormous value can be created in biotechnology: **before the product becomes famous.**

For Switzerland's pharmaceutical companies, biotech founders, and investors, that makes this much more than another American acquisition. It is another reminder that world-class science can become one of Switzerland's most valuable exports.

---

Source: BioMarin corporate announcement and company materials. Transaction values and development information should be read subject to definitive transaction terms and future clinical/regulatory outcomes.`
  },

  // ARTICLE 3: DISPATCH BIO FLARE PLATFORM
  {
    srcImage: 'media_1787155628269.jpg',
    baseName: 'dispatch_bio_solid_tumors_flare_platform_disp10_phase1',
    title: "UNDER THE RADAR: Dispatch Bio Is Trying to Make Solid Tumors Reveal Themselves",
    subtitle: "Dispatch Bio doses first patient in Phase 1 trial for DISP-10, combining tumor-targeting viruses with engineered immunotherapy. Why Basel's cell-therapy scouting teams at Novartis and Roche should watch this early-stage platform.",
    category: "Biotechnology",
    author_name: "PrivateSector Intelligence",
    author_avatar: "https://i.pravatar.cc/100?img=33",
    date_published: "2026-08-19",
    read_time_mins: 3,
    pull_quote: "Thousands of scientists are asking 'How do we find better targets on solid tumors?' Dispatch is asking 'Can we give the immune system a better target ourselves?' That difference is what makes it worth watching.",
    tags: [
      "Dispatch Bio",
      "DISP-10",
      "Flare Platform",
      "CAR-T",
      "Cell Therapy",
      "Solid Tumors",
      "Novartis",
      "Roche",
      "Poseida Therapeutics",
      "Oncology",
      "Immunotherapy",
      "Phase 1",
      "Basel",
      "Switzerland",
      "United States",
      "Under The Radar",
      "Gastrointestinal Cancer"
    ],
    focus_keyword: "Dispatch Bio solid tumors CAR-T Flare platform DISP-10 Phase 1 Novartis Roche",
    meta_title: "Under the Radar: Dispatch Bio Tackles Solid Tumors — PrivateSector Intelligence",
    meta_description: "Dispatch Bio enters Phase 1 with DISP-10 using its Flare platform to make solid tumors reveal themselves to CAR-T cells. What Basel pharma giants Novartis and Roche should watch.",
    slug: "under-the-radar-dispatch-bio-trying-make-solid-tumors-reveal-themselves",
    content_body: `U.S. RADAR 🇺🇸 ↔ 🇨🇭 ◆ 19 AUGUST 2026 ◆ 3 MIN READ ◆ UNDER THE RADAR ◆ CELL THERAPY ◆ ONCOLOGY

CAR-T therapy changed cancer medicine.

For some blood cancers, scientists learned how to take immune cells, engineer them, and send them back into the body with a new mission:
- **Find the cancer.**
- **Attack it.**

But there has always been a much harder frontier: **solid tumors.**

And one American biotechnology company is trying something unusual to break through that wall.

Its name is **Dispatch Bio**.

And it has now entered the clinic.

---

## THE PROBLEM WITH SOLID TUMORS

**HETEROGENEOUS TARGETS ◆ TUMOR MICROENVIRONMENT ◆ THE SEARCH FOR TARGETS**

CAR-T cells need something to attack.

In blood cancers, scientists have identified clear surface targets that have allowed CAR-T therapies to produce remarkable, life-saving results.

Solid tumors are considerably more complicated:
- Cancer cells can be **heterogeneous**.
- Targets can be **inconsistent or absent**.
- The immunosuppressive **microenvironment surrounding a tumor** makes it extremely difficult for engineered immune cells to function effectively.

So Dispatch is asking a fundamentally different question.

Instead of simply searching endlessly for the perfect target...

**What if we could make the cancer reveal itself?**

---

## THE DISPATCH IDEA: THE FLARE PLATFORM

**TUMOR-TARGETING VIRUS ◆ ENGINEERED IMMUNOTHERAPY ◆ DISP-10 PHASE 1 INITIATION**

Dispatch Bio's **Flare platform** combines engineered immunotherapy with a tumor-targeting virus:

1. **Virus Targets the Tumor:** The FLARE virus selectively infects cancer cells.
2. **Tumor Cells Are Marked:** Infected cells express and display a unique synthetic signal on their surface.
3. **Engineered Immune Cells Find & Destroy:** CAR-T cells engineered specifically to recognise that synthetic signal home in and attack the tumor.

It is an ambitious strategy. And now it has moved beyond the laboratory bench:

- **Milestone:** Dispatch has begun a **Phase 1 clinical trial of DISP-10** in patients with advanced gastrointestinal cancers.
- **Status:** The first patient has been dosed (August 2026).

---

## WHY PRIVATESECTOR IS WATCHING NOW

**EARLY SIGNAL IDENTIFICATION ◆ UNDER THE RADAR ◆ BEYOND CONSENSUS**

This is extremely early. There is no reason yet to describe DISP-10 as a proven clinical breakthrough.

Phase 1 is primarily about establishing safety, tolerability, and learning how a new therapy behaves in human biology.

But that is precisely why Dispatch belongs in PrivateSector's **Under the Radar** category:

**We don't want to discover every promising company after everybody else already knows its name. We want to identify scientifically interesting businesses when the important questions are still unanswered.**

---

## 🇨🇭 BASEL SHOULD BE WATCHING

**NOVARTIS CAR-T PIONEERING ◆ ROCHE & POSEIDA CELL THERAPY ◆ TRANSATLANTIC SCOUTING**

This field has direct relevance to Switzerland:

- **Novartis:** Helped pioneer commercial CAR-T therapy with Kymriah and continues heavily investing in next-generation cell therapies and solid-tumor targets.
- **Roche:** Has steadily expanded its cell-therapy capabilities, including through strategic acquisitions such as Poseida Therapeutics.

That means Dispatch is working directly inside an area of core strategic interest to two of Switzerland's largest pharmaceutical powerhouses.

The question today is not whether either company will partner with Dispatch. There is no basis to claim that yet.

The point is simpler: **this is exactly the kind of early U.S. platform technology that Swiss pharmaceutical scouting and business-development teams should know exists.**

---

## THE BIGGER OPPORTUNITY

**PLATFORM MULTIPLICITY ◆ BEYOND GASTROINTESTINAL CANCERS ◆ MECHANISTIC LEVERAGE**

If Dispatch's approach eventually succeeds in human testing, its importance may extend far beyond one gastrointestinal cancer program.

A platform capable of helping engineered immune cells recognise and penetrate difficult solid tumors could potentially have applications across multiple oncological indications:
- Pancreatic cancer
- Colorectal cancer
- Gastric cancer
- Other refractory solid tumors

That is what makes platform biotechnology so compelling: **one validated mechanism can create multiple future development programs.**

---

## 🔎 PRIVATESECTOR VIEW

**CREATING NEW TARGETS ◆ SCIENTIFIC DARING ◆ EARLY RADAR VALUE**

Thousands of oncology researchers are asking:
*“How do we find better targets on solid tumors?”*

Dispatch appears to be asking something subtly different:
*“Can we give the immune system a better target ourselves?”*

That distinction is what caught our attention.

It doesn't make Dispatch a guaranteed winner. It makes Dispatch **worth watching**. And there is an important difference between those two statements.

---

## PRIVATESECTOR INTELLIGENCE CARD

**DISPATCH BIO ◆ FLARE PLATFORM ◆ DISP-10 PROGRAM**

- 🏢 **Company:** Dispatch Bio
- 📍 **Country:** United States 🇺🇸
- 🔬 **Platform:** Flare Platform™ (Tumor-targeting virus + engineered immunotherapy)
- 🧪 **Clinical Program:** DISP-10
- 🏥 **Trial Stage:** Phase 1 Clinical Trial (First patient dosed August 2026)
- 🎯 **Initial Indication:** Advanced Gastrointestinal Cancers
- ⚙️ **Technology:** Selective viral tagging + synthetic target CAR-T destruction
- 🇨🇭 **Swiss Relevance:** Novartis ★ Roche ★ Cell Therapy ★ Solid Tumor Oncology
- 🏷️ **PrivateSector Category:** UNDER THE RADAR

---

## PRIVATESECTOR INTELLIGENCE SCORE

**9.1/10 — TOP SIGNAL 🔴**

- **Scientific Originality:** ★★★★★
- **Potential Impact:** ★★★★★
- **Swiss Relevance:** ★★★★★
- **Clinical Maturity:** ★★☆☆☆
- **Strategic Watch Value:** ★★★★★

⚠️ **PrivateSector Risk Flag:**
This is early-stage biotechnology. Phase 1 success is never guaranteed. Clinical efficacy remains unproven, and development could face safety, manufacturing, regulatory, or financing hurdles. That uncertainty is precisely why early biotech holds both extraordinary promise and inherent risk.

**Executive Conclusion:**
Dispatch Bio isn't interesting because it has already solved solid tumors. It hasn't. It is interesting because it is attempting to solve one of cancer medicine's hardest problems in a genuinely different way — and it has now taken that idea into human testing.

For Switzerland's pharmaceutical industry, oncology researchers, and biotech investors: **Dispatch Bio belongs on the radar. Not after Phase 3. Now.**

---

Source: Dispatch Bio corporate materials and clinical-development disclosures; Novartis and Roche public corporate materials for Swiss-sector context. DISP-10 remains an investigational early-stage therapy.`
  }
];

// SQLite Updater
function updateSQLite(article, imgUrl, schemaMarkup) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
    });

    db.serialize(() => {
      db.get('SELECT id FROM news WHERE title = ? OR slug = ?', [article.title, article.slug], (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }

        const tagsStr = JSON.stringify(article.tags);

        if (row) {
          console.log(`[SQLite] Article exists (ID: ${row.id}). Updating: ${article.title}`);
          const updateStmt = db.prepare(`
            UPDATE news SET 
              subtitle = ?, category = ?, author_name = ?, author_avatar = ?, date_published = ?,
              read_time_mins = ?, content_body = ?, pull_quote = ?, tags = ?, image_url = ?,
              focus_keyword = ?, meta_title = ?, meta_description = ?, slug = ?, schema_markup = ?
            WHERE id = ?
          `);
          updateStmt.run([
            article.subtitle, article.category, article.author_name, article.author_avatar, article.date_published,
            article.read_time_mins, article.content_body, article.pull_quote, tagsStr, imgUrl,
            article.focus_keyword, article.meta_title, article.meta_description, article.slug, schemaMarkup, row.id
          ], function(uErr) {
            updateStmt.finalize();
            db.close();
            if (uErr) reject(uErr);
            else {
              console.log(`[SQLite] Updated successfully: ID ${row.id}`);
              resolve(row.id);
            }
          });
        } else {
          console.log(`[SQLite] Inserting new article: ${article.title}`);
          const stmt = db.prepare(`
            INSERT INTO news (
              title, subtitle, category, author_name, author_avatar, date_published, 
              read_time_mins, content_body, pull_quote, tags, image_url, 
              focus_keyword, meta_title, meta_description, slug, schema_markup
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run([
            article.title, article.subtitle, article.category, article.author_name, article.author_avatar, article.date_published,
            article.read_time_mins, article.content_body, article.pull_quote, tagsStr, imgUrl,
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

// Live Postgres Updater
async function updateLivePostgres(article, imgUrl, schemaMarkup) {
  const connectionString = "postgres://postgres:edcKM0253QrFib0sSl2JYZoj5If8DxbKVxgzmsBpQVI5HBHyQ9UBZ6gMi79z0AFD@62.72.44.254:1127/postgres";
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const resCheck = await client.query('SELECT id FROM news WHERE slug = $1 OR title = $2', [article.slug, article.title]);

    if (resCheck.rows.length > 0) {
      const id = resCheck.rows[0].id;
      console.log(`[Postgres] Article exists (ID: ${id}). Updating: ${article.title}`);
      await client.query(`
        UPDATE news SET 
          subtitle = $1, category = $2, author_name = $3, author_avatar = $4, date_published = $5,
          read_time_mins = $6, content_body = $7, pull_quote = $8, tags = $9, image_url = $10,
          focus_keyword = $11, meta_title = $12, meta_description = $13, slug = $14, schema_markup = $15
        WHERE id = $16
      `, [
        article.subtitle, article.category, article.author_name, article.author_avatar, article.date_published,
        article.read_time_mins, article.content_body, article.pull_quote, JSON.stringify(article.tags), imgUrl,
        article.focus_keyword, article.meta_title, article.meta_description, article.slug, schemaMarkup, id
      ]);
      console.log(`[Postgres] Article ID ${id} updated successfully!`);
    } else {
      console.log(`[Postgres] Inserting article: ${article.title}`);
      const resIns = await client.query(`
        INSERT INTO news (
          title, subtitle, category, author_name, author_avatar, date_published, 
          read_time_mins, content_body, pull_quote, tags, image_url, 
          focus_keyword, meta_title, meta_description, slug, schema_markup
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id
      `, [
        article.title, article.subtitle, article.category, article.author_name, article.author_avatar, article.date_published,
        article.read_time_mins, article.content_body, article.pull_quote, JSON.stringify(article.tags), imgUrl,
        article.focus_keyword, article.meta_title, article.meta_description, article.slug, schemaMarkup
      ]);
      console.log(`[Postgres] Article inserted successfully with ID: ${resIns.rows[0].id}`);
    }
  } catch (err) {
    console.error(`[Postgres] Error publishing ${article.slug}:`, err.message);
  } finally {
    await client.end();
  }
}

// Live API Poster
async function postToLiveApi(article, imgUrl, schemaMarkup) {
  try {
    const getRes = await fetch('https://privatesector.ch/api/news');
    const existingList = await getRes.json();
    const existing = Array.isArray(existingList) ? existingList.find(a => a.slug === article.slug || a.title === article.title) : null;

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
      image_url: imgUrl,
      focus_keyword: article.focus_keyword,
      meta_title: article.meta_title,
      meta_description: article.meta_description,
      slug: article.slug,
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
      console.log(`[Live API] Update response for ${article.slug}:`, data.id || data);
    } else {
      console.log(`[Live API] Inserting new article into https://privatesector.ch/api/news: ${article.slug}...`);
      const res = await fetch('https://privatesector.ch/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`[Live API] Insert response for ${article.slug}:`, data.id || data);
    }
  } catch (err) {
    console.error(`[Live API] Error posting ${article.slug}:`, err.message);
  }
}

async function main() {
  console.log('===============================================================');
  console.log('PUBLISHING 3 BIOTECHNOLOGY ARTICLES (AUGUST 19, 2026)');
  console.log('===============================================================\n');

  for (let i = 0; i < articlesData.length; i++) {
    const article = articlesData[i];
    console.log(`\n---------------------------------------------------------------`);
    console.log(`[${i + 1}/${articlesData.length}] Processing: "${article.title}"`);
    console.log(`---------------------------------------------------------------`);

    // 1. Upload feature image
    const imgUrl = await uploadImage(article.srcImage, article.baseName);
    console.log(`Feature Image URL: ${imgUrl}`);

    // 2. Generate Schema Markup
    const schemaMarkup = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": article.meta_description,
      "image": imgUrl.startsWith('http') ? imgUrl : `https://privatesector.ch${imgUrl}`,
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

    // 3. SQLite
    await updateSQLite(article, imgUrl, schemaMarkup);

    // 4. Postgres
    await updateLivePostgres(article, imgUrl, schemaMarkup);

    // 5. Live API
    await postToLiveApi(article, imgUrl, schemaMarkup);
  }

  console.log('\n===============================================================');
  console.log('ALL ARTICLES PROCESSED! VERIFYING LIVE PLATFORM...');
  console.log('===============================================================\n');

  try {
    const verifyRes = await fetch('https://privatesector.ch/api/news');
    const allLive = await verifyRes.json();
    console.log(`Total live articles count: ${allLive.length}`);
    articlesData.forEach(art => {
      const found = allLive.find(a => a.slug === art.slug || a.title === art.title);
      if (found) {
        console.log(`[VERIFIED LIVE] ID: ${found.id} | Slug: ${found.slug} | Image: ${found.image_url}`);
      } else {
        console.warn(`[NOT FOUND IN LIVE API] ${art.slug}`);
      }
    });
  } catch (e) {
    console.error('Verification error:', e.message);
  }
}

main().catch(console.error);
