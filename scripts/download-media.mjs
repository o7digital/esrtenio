import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, stat, writeFile } from 'node:fs/promises';
const exec = promisify(execFile);
const base = 'https://estenio.com.mx/wp-content/uploads/';
const assets = [
  ['2025/07/auditoria1-scaled.jpg', 'auditoria1-scaled.jpg'],
  ['2025/07/pensionOptimized.png', 'pensionOptimized.png'],
  ['2025/07/infonavit1_.png', 'infonavit1_.png'],
  ['2025/07/legal1.png', 'legal1.png'],
  ['2025/08/img-inicio-02.jpg', 'img-inicio-02.jpg'],
  ['2025/07/pension-img-head-04.jpg', 'pension-img-head-04.jpg'],
  ['2025/08/nosotrosFram.jpeg', 'nosotrosFram.jpeg'],
  ['2025/08/nosotros_bg.jpeg', 'nosotros_bg.jpeg'],
  ['2025/07/ciudad-mexico.jpg', 'ciudad-mexico.jpg'],
  ['2025/08/Diseno-sin-titulo-2.mp4', 'Diseno-sin-titulo-2.mp4'],
  ['2025/04/icono-estenio.png', 'icono-estenio.png'],
  ['elementor/thumbs/estenio-logo-bl-rad1kgg1jf0y4qnprqojvagmmxjdbwbopefom0zdu2.png', 'logo-header.png'],
  ['elementor/google-fonts/fonts/albertsans-i7doifdwyjgaamftzd_qa1zbyfc.woff2', 'albert-sans-latin.woff2'],
];
await mkdir('public/assets/original', { recursive: true });
const results = [];
while (assets.length) {
  await Promise.all(assets.splice(0, 3).map(async ([remote, filename]) => {
    const url = base + remote;
    const file = `public/assets/original/${filename}`;
    try {
      try { await stat(file); } catch { await exec('curl', ['-fL', '--retry', '2', '--max-time', '40', '-A', 'Mozilla/5.0', '-sS', url, '-o', file]); }
      results.push({ url, file, size: (await stat(file)).size });
      console.log(`Media ready: ${filename}`);
    } catch (error) { results.push({ url, file, error: error.message }); console.log(`Failed ${filename}: ${error.message}`); }
  }));
}
await writeFile('docs/audit/media-downloads.json', JSON.stringify(results, null, 2));
