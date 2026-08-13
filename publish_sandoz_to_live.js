import fs from 'fs';

const mdPath = "C:\\Users\\Faisal\\Downloads\\America's Push to Bring Drug Production Home Puts Sandoz at a Strategic Crossroads.md";
const rawContent = fs.readFileSync(mdPath, 'utf8');
const lines = rawContent.split('\n');

const title = "America's Push to Bring Drug Production Home Puts Sandoz at a Strategic Crossroads";
const subtitle = "Sandoz is discussing potential U.S. manufacturing investment. PrivateSector examines what could come next — and where proven Swiss pharmaceutical capabilities may fit.";
const category = "Pharmaceuticals";
const author_name = "PrivateSector Intelligence";
const author_avatar = "https://i.pravatar.cc/100?img=33";
const date_published = "2026-08-09";
const read_time_mins = 7;
const pull_quote = "We don't stop at the news. We find where the opportunity lies.";
const tags = ["Sandoz", "Pharmaceuticals", "Biosimilars", "U.S.-Swiss Industry", "SKAN", "SGS", "Manufacturing"];
const image_url = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600";
const focus_keyword = "Sandoz US drug production manufacturing";
const meta_title = "America's Push for Drug Production Home Puts Sandoz at Crossroads";
const meta_description = "Sandoz discusses potential U.S. manufacturing investment. PrivateSector analyzes biosimilar growth, Swiss industrial capabilities (SKAN, SGS), and key risks.";
const slug = "americas-push-drug-production-home-puts-sandoz-strategic-crossroads";

const bodyStartIndex = lines.findIndex(line => line.trim().startsWith('## EXECUTIVE SUMMARY'));
const content_body = lines.slice(bodyStartIndex >= 0 ? bodyStartIndex : 16).join('\n');

const schema_markup = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": title,
  "description": meta_description,
  "image": image_url,
  "datePublished": date_published,
  "author": {
    "@type": "Organization",
    "name": author_name,
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
  title,
  subtitle,
  category,
  author_name,
  author_avatar,
  content_body,
  pull_quote,
  tags,
  image_url,
  focus_keyword,
  meta_title,
  meta_description,
  slug,
  schema_markup
};

async function publishToLive() {
  console.log("Publishing Sandoz article to https://privatesector.ch/api/news...");
  try {
    const res = await fetch('https://privatesector.ch/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Response from live server:", data);
  } catch (err) {
    console.error("Failed to post to live API:", err);
  }
}

publishToLive();
