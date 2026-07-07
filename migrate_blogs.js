import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server', 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS blogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      category TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_avatar TEXT NOT NULL,
      date_published TEXT NOT NULL,
      read_time_mins INTEGER NOT NULL,
      content_body TEXT NOT NULL,
      pull_quote TEXT NOT NULL,
      tags TEXT NOT NULL,
      image_url TEXT DEFAULT ''
    )
  `);

  const blogPosts = [
    {
      title: 'How to Navigate the Swiss B2B Compliance Landscape',
      subtitle: 'A practical guide for new enterprises entering the Swiss market and handling FINMA regulations.',
      category: 'Guides',
      author_name: 'Faisal Rafique',
      author_avatar: 'https://i.pravatar.cc/100?img=11',
      date_published: '2026-05-20',
      read_time_mins: 6,
      content_body: `When entering the Swiss B2B market, companies must quickly adapt to a highly regulated yet extremely rewarding environment. In this post, we cover the top three strategies for compliance and why you need to integrate them early into your business processes.

First, understanding the local canton laws is vital. Each canton may have specific regulations regarding corporate tax, hiring, and environmental compliance.
Second, if you're in tech or finance, FINMA compliance is non-negotiable. Building your cloud infrastructure with these guidelines in mind saves millions in potential rework.
Lastly, maintaining a verified Zefix profile gives you the trust necessary to close enterprise deals.`,
      pull_quote: 'Compliance is not just a legal requirement; it is a competitive advantage in Switzerland.',
      tags: JSON.stringify(['Compliance', 'FINMA', 'B2B Strategy']),
      image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600'
    },
    {
      title: 'The Rise of Green Tech Startups in Zurich',
      subtitle: 'Why Zurich is quickly becoming the European hub for sustainable technology and green investments.',
      category: 'Market Trends',
      author_name: 'Sophia Müller',
      author_avatar: 'https://i.pravatar.cc/100?img=5',
      date_published: '2026-05-18',
      read_time_mins: 4,
      content_body: `Over the past three years, Zurich has seen a 40% increase in the number of registered green tech startups. This boom is fueled by a combination of government grants, strong academic institutions like ETH Zurich, and a culture that values sustainability.

Investors from across Europe are now looking at Zurich as the primary hub for early-stage investments in climate tech. In this blog, we explore the top sectors driving this growth, including smart grid technologies and sustainable agriculture solutions.`,
      pull_quote: 'Zurich is proving that ecological sustainability and economic prosperity go hand in hand.',
      tags: JSON.stringify(['Green Tech', 'Startups', 'Zurich']),
      image_url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=600'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO blogs (
      title, subtitle, category, author_name, author_avatar, date_published, read_time_mins, content_body, pull_quote, tags, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const blog of blogPosts) {
    stmt.run([
      blog.title, blog.subtitle, blog.category, blog.author_name, blog.author_avatar, blog.date_published,
      blog.read_time_mins, blog.content_body, blog.pull_quote, blog.tags, blog.image_url
    ]);
  }
  stmt.finalize();

  console.log("Migration complete.");
});

db.close();
