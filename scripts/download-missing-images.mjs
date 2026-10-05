import fs from 'node:fs';
import path from 'node:path';

const missingImages = [
  'chatgpt-bild_4__okt__2026__22_31_20_png_1791146057024_iu56d.png',
  'chatgpt-bild_4__okt__2026__21_18_32_png_1791142536914_guy60.png',
  'chatgpt-bild_2__okt__2026__21_23_00_png_1790970084424_xolhz.png',
  'wide_panoramic_editorial_infographic_style_image_png_1790804024792_n2o49.png',
  'chatgpt-bild_30__sept__2026__23_11_15_png_1790803622423_q6zg6.png',
  'chatgpt-bild_29__sept__2026__22_46_49_png_1790715476629_yge4y.png',
  'chatgpt-bild_28__sept__2026__22_25_13_png_1790627280609_o64og.png'
];

const destDirs = [
  path.resolve('public/uploads'),
  path.resolve('emdash-site/uploads')
];

for (const dir of destDirs) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function downloadAll() {
  console.log('Downloading missing images from https://privatesector.ch/uploads/...');
  for (const filename of missingImages) {
    const url = `https://privatesector.ch/uploads/${filename}`;
    try {
      console.log(`Fetching ${filename}...`);
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`Failed ${filename}: ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      for (const dir of destDirs) {
        fs.writeFileSync(path.join(dir, filename), buffer);
      }
      console.log(`Saved ${filename} (${buffer.length} bytes)`);
    } catch (e) {
      console.error(`Error downloading ${filename}: ${e.message}`);
    }
  }
  console.log('Finished downloading missing images.');
}

downloadAll();
