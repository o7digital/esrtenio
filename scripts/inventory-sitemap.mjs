import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFile } from 'node:fs/promises';
const exec = promisify(execFile);
const entries = await Promise.all(['robots.txt', 'sitemap_index.xml', 'page-sitemap.xml'].map(async (path) => {
  const url = `https://estenio.com.mx/${path}`;
  const { stdout } = await exec('curl', ['-fL', '-A', 'Mozilla/5.0', '-sS', '--max-time', '25', url]);
  const pages = [...stdout.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  return { url, status: 200, pages, content: stdout };
}));
await writeFile('docs/audit/sitemap.json', JSON.stringify({ auditedAt: new Date().toISOString(), entries }, null, 2));
console.log(entries.map(({ url, pages }) => ({ url, pages })));
