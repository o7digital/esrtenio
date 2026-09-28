import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const output = 'docs/audit';
await mkdir(`${output}/source`, { recursive: true });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const offline = process.argv.includes('--offline');
const routes = offline ? ['/nosotros/', '/auditoria/', '/legal/', '/asesoria-infonavit/', '/gestor-de-pensiones/'] : ['/', '/nosotros/', '/auditoria/', '/legal/', '/asesoria-infonavit/', '/gestor-de-pensiones/'];
const pages = [];
for (const pathname of routes) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.route('**/*', async (route) => {
    const request = route.request();
    if (offline || request.method() !== 'GET' || /google(tagmanager|analytics)|analytics|hubspot|facebook|doubleclick|joinchat|whatsapp|wa\.me/i.test(request.url())) return route.abort();
    return route.continue();
  });
  if (offline) {
    const names = { '/asesoria-infonavit/': 'asesoria' };
    const html = await readFile(`/tmp/estenio-${names[pathname] || pathname.replaceAll('/', '')}.html`, 'utf8');
    await page.setContent(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<link[^>]+rel=['"]stylesheet['"][^>]*>/gi, ''), { waitUntil: 'domcontentloaded' });
  } else {
    await page.goto(`https://estenio.com.mx${pathname}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  await page.waitForTimeout(1500);
  const result = await page.evaluate(() => {
    const normalize = (text) => text.replace(/\s+/g, ' ').trim();
    const main = document.querySelector('main');
    const widgets = [...main.querySelectorAll('[data-widget_type]')].map((element) => ({
      id: element.getAttribute('data-id'),
      type: element.getAttribute('data-widget_type'),
      text: normalize(element.textContent),
      html: element.innerHTML,
      images: [...element.querySelectorAll('img')].map((image) => ({ src: image.src, alt: image.alt, width: image.naturalWidth, height: image.naturalHeight })),
      background: getComputedStyle(element).backgroundImage,
      ancestors: [...(function* () { let parent = element.parentElement; while (parent && parent !== main) { yield parent.getAttribute('data-id'); parent = parent.parentElement; } })()].filter(Boolean),
    }));
    return {
      title: document.title,
      meta: [...document.head.querySelectorAll('meta[name],meta[property],link[rel="canonical"]')].map((element) => Object.fromEntries([...element.attributes].map((attribute) => [attribute.name, attribute.value]))),
      text: normalize(main.textContent),
      mainHTML: main.innerHTML,
      widgets,
      containers: [...main.querySelectorAll('[data-element_type="container"]')].map((element) => ({ id: element.getAttribute('data-id'), text: normalize(element.textContent).slice(0, 150), background: getComputedStyle(element).backgroundImage, display: getComputedStyle(element).display })),
      links: [...document.querySelectorAll('a[href]')].map((element) => ({ text: normalize(element.textContent), href: element.getAttribute('href') })),
      images: [...document.querySelectorAll('img')].map((image) => ({ src: image.src, alt: image.alt, width: image.naturalWidth, height: image.naturalHeight })),
      fonts: [...new Set([...document.querySelectorAll('h1,h2,h3,h4,p')].map((element) => getComputedStyle(element).fontFamily))],
      stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((element) => element.href),
    };
  });
  const slug = pathname === '/' ? 'home' : pathname.replaceAll('/', '');
  await writeFile(`${output}/source/${slug}.json`, JSON.stringify(result, null, 2));
  pages.push({ pathname, title: result.title, fonts: result.fonts, widgets: result.widgets.map(({ id, type, text, images }) => ({ id, type, text, images })), backgrounds: result.containers.filter((container) => container.background !== 'none'), links: result.links });
  console.log(JSON.stringify({ pathname, title: result.title, fonts: result.fonts, widgetCount: result.widgets.length, images: result.images.length, backgrounds: result.containers.filter((container) => container.background !== 'none') }));
  if (pathname === '/') {
    for (const width of [390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: width < 1000 ? 900 : 1100 });
      await page.evaluate(async () => {
        for (let top = 0; top < document.body.scrollHeight; top += 600) { window.scrollTo(0, top); await new Promise((resolve) => setTimeout(resolve, 100)); }
        document.querySelectorAll('.elementor-invisible').forEach((element) => element.classList.remove('elementor-invisible'));
        window.scrollTo(0, 0);
      });
      await page.screenshot({ path: `${output}/source/home-${width}.png`, fullPage: true, animations: 'disabled' });
    }
  }
  await page.close();
}
await writeFile(`${output}/source-inventory.json`, JSON.stringify(pages, null, 2));
await browser.close();
