import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';

const baseURL = process.env.SITE_TEST_URL || 'http://127.0.0.1:4323';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
await mkdir('docs/audit/browser', { recursive: true });
await mkdir('public/review', { recursive: true });
const widths = [390, 768, 1440, 1920];
const routes = ['/', '/nosotros/', '/auditoria/', '/legal/', '/asesoria-infonavit/', '/gestor-de-pensiones/'];
const report = { baseURL, viewports: [], content: [], failures: [] };
const context = await browser.newContext();
await context.route('**/*', (route) => {
  if (route.request().method() !== 'GET' || /google(tagmanager|analytics)|hubspot|facebook|doubleclick|whatsapp/.test(route.request().url())) return route.abort();
  return route.continue();
});
const normalized = (element) => {
  const clone = element.cloneNode(true);
  clone.querySelectorAll('style,script').forEach((node) => node.remove());
  clone.querySelectorAll('br').forEach((node) => node.replaceWith(' '));
  clone.querySelectorAll('p,li,h1,h2,h3,h4,h5,h6,div,section,span').forEach((node) => node.append(' '));
  return clone.textContent.replace(/\s+/g, ' ').trim();
};
for (const route of routes) {
  const page = await context.newPage();
  page.on('pageerror', (error) => report.failures.push(`${route}: ${error.message}`));
  page.on('response', (response) => { if (response.status() >= 400) report.failures.push(`${response.status()} ${response.url()}`); });
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 1000 ? 900 : 1080 });
    await page.goto(baseURL + route, { waitUntil: 'load' });
    await page.evaluate(async () => {
      document.querySelectorAll('img').forEach((image) => { image.loading = 'eager'; });
      await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
      await document.fonts.ready;
    });
    const diagnostics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      brokenImages: [...document.images].filter((image) => !image.complete || !image.naturalWidth).map((image) => image.src),
      headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
      title: document.title,
    }));
    report.viewports.push({ route, width, ...diagnostics });
    if (diagnostics.overflow || diagnostics.brokenImages.length) report.failures.push(JSON.stringify({ route, width, ...diagnostics }));
    if (route === '/') {
      const video = page.locator('video');
      await video.evaluate(async (element) => {
        const videoElement = /** @type {HTMLVideoElement} */ (element);
        if (videoElement.readyState < 2) await new Promise((resolve) => videoElement.addEventListener('loadeddata', resolve, { once: true }));
        videoElement.pause();
        videoElement.currentTime = 2;
        await new Promise((resolve) => videoElement.addEventListener('seeked', resolve, { once: true }));
      });
      await page.screenshot({ path: `docs/audit/browser/home-${width}.png`, fullPage: true });
      for (const [name, selector] of [['hero', '.home-hero'], ['nosotros', '.about'], ['clients', '.clients']]) {
        const buffer = await page.locator(selector).screenshot({ animations: 'disabled' });
        await sharp(buffer).webp({ quality: 88 }).toFile(`public/review/${name}-${width}.webp`);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
    } else if (width === 390 || width === 1440) {
      await page.screenshot({ path: `docs/audit/browser/${route.replaceAll('/', '')}-${width}.png`, fullPage: true });
    }
  }
  const slug = route === '/' ? 'home' : route.replaceAll('/', '');
  const snapshotFile = `docs/audit/source/${slug}.json`;
  if (existsSync(snapshotFile)) {
    const snapshot = JSON.parse(await readFile(snapshotFile, 'utf8'));
    const actual = await page.locator('body').evaluate(normalized);
    const sourcePage = await context.newPage();
    await sourcePage.route('**/*', (route) => route.abort());
    await sourcePage.setContent(snapshot.mainHTML, { waitUntil: 'domcontentloaded' });
    const expected = await sourcePage.evaluate((normalizeFunction) => {
      const normalize = new Function(`return (${normalizeFunction})`)();
      return [...document.querySelectorAll('[data-widget_type="heading.default"], [data-widget_type="text-editor.default"], .elementor-flip-box__layer__title, .elementor-flip-box__layer__description, .e-n-tab-title-text, .e-n-accordion-item-title-text, .elementor-testimonial__text, .elementor-testimonial__name, .elementor-testimonial__title, .elementor-button-text')].map(normalize).filter(Boolean);
    }, normalized.toString());
    const missing = [...new Set(expected)].filter((text) => !actual.includes(text));
    report.content.push({ route, checkedFragments: new Set(expected).size, missing });
    if (missing.length) report.failures.push(`${route}: missing source fragments ${JSON.stringify(missing)}`);
    await sourcePage.close();
  }
  await page.close();
}
const reducedPage = await context.newPage();
await reducedPage.emulateMedia({ reducedMotion: 'reduce' });
const videoRequests = [];
reducedPage.on('request', (request) => { if (/\.mp4/.test(request.url())) videoRequests.push(request.url()); });
await reducedPage.goto(baseURL, { waitUntil: 'load' });
const reducedMode = await reducedPage.evaluate(() => ({ posterVisible: !!document.querySelector('.hero-poster'), videoHidden: getComputedStyle(document.querySelector('video')).display === 'none', videoSrc: document.querySelector('video').getAttribute('src') }));
report.reducedMotion = { ...reducedMode, videoRequests };
if (!reducedMode.videoHidden || reducedMode.videoSrc || videoRequests.length) report.failures.push('Reduced motion must not play or download the video.');
await browser.close();
await writeFile('docs/audit/visual-report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (report.failures.length) process.exitCode = 1;
