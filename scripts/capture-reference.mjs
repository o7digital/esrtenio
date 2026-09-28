// Read-only captures: production analytics and all mutations are blocked.
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

await mkdir('docs/audit/source', { recursive: true });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const page = await browser.newPage();
await page.route('**/*', async (route) => {
  const request = route.request();
  if (request.method() !== 'GET' || /google(tagmanager|analytics)|analytics|hubspot|facebook|doubleclick|joinchat|whatsapp|wa\.me/i.test(request.url())) return route.abort();
  // These unchanged local copies avoid the source server's sporadic asset 406s.
  const url = new URL(request.url());
  const file = `public/assets/original/${url.pathname.split('/').pop()}`;
  if (url.pathname.includes('/wp-content/uploads/') && existsSync(file)) return route.fulfill({ path: file });
  return route.continue();
});
for (const width of [390, 768, 1440, 1920]) {
  await page.setViewportSize({ width, height: width < 1000 ? 900 : 1080 });
  await page.goto('https://estenio.com.mx/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2000);
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
    for (let top = 0; top < document.body.scrollHeight; top += 600) {
      window.scrollTo(0, top);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    document.querySelectorAll('.elementor-invisible').forEach((element) => element.classList.remove('elementor-invisible'));
    document.querySelectorAll('.swiper').forEach((element) => element.swiper?.autoplay?.stop());
    await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
    await document.fonts.ready;
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `docs/audit/source/home-${width}.png`, fullPage: true, animations: 'disabled' });
  for (const [name, selector] of [['hero', '[data-id="7b0058a"]'], ['nosotros', '[data-id="74df436"], [data-id="7ebb324"]'], ['clients', '[data-widget_type="media-carousel.default"]']]) {
    const section = page.locator(selector).filter({ visible: true }).first();
    if (!await section.count() || !await section.isVisible()) continue;
    const buffer = await section.screenshot({ animations: 'disabled' });
    await sharp(buffer).webp({ quality: 88 }).toFile(`docs/audit/source/${name}-${width}.webp`);
  }
  console.log(`Source screenshots: ${width}px`);
}
await browser.close();
