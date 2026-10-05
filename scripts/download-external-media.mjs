import fs from 'node:fs';
import path from 'node:path';

const extDir = path.resolve('public/uploads/external');
if (!fs.existsSync(extDir)) fs.mkdirSync(extDir, { recursive: true });

const externalUrls = [
  { url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=600', filename: 'unsplash_fintech_report.jpg' },
  { url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600', filename: 'unsplash_wealth_mgmt.jpg' },
  { url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600', filename: 'unsplash_pharma_lab.jpg' },
  { url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=600', filename: 'unsplash_biotech_research.jpg' },
  { url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600', filename: 'unsplash_medtech_devices.jpg' },
  { url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256', filename: 'avatar_interview_1.jpg' },
  { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256', filename: 'avatar_interview_2.jpg' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256', filename: 'avatar_interview_3.jpg' },
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256', filename: 'avatar_interview_4.jpg' },
  { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256', filename: 'avatar_interview_5.jpg' },
  { url: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=256', filename: 'avatar_interview_6.jpg' },
  { url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=600', filename: 'unsplash_green_tech.jpg' },
  { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', filename: 'soundhelix_song_1.mp3' },
  { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', filename: 'soundhelix_song_2.mp3' },
  { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', filename: 'soundhelix_song_3.mp3' },
  { url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', filename: 'soundhelix_song_4.mp3' }
];

async function downloadExternal() {
  console.log('Downloading external media...');
  for (const item of externalUrls) {
    const dest = path.join(extDir, item.filename);
    if (fs.existsSync(dest)) {
      console.log(`Already exists: ${item.filename}`);
      continue;
    }
    try {
      console.log(`Downloading ${item.filename} from ${item.url}...`);
      const res = await fetch(item.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(dest, buf);
        console.log(`Saved ${item.filename} (${buf.length} bytes)`);
      } else {
        console.log(`Failed to fetch ${item.filename}: ${res.status}`);
      }
    } catch(e) {
      console.log(`Error on ${item.filename}: ${e.message}`);
    }
  }
  console.log('Done downloading external media.');
}

downloadExternal();
