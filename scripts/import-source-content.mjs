// Extract content from the audited WordPress DOM without rewriting Spanish copy.
import { chromium } from '@playwright/test';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const pages = [];
const media = new Map();
const home = JSON.parse(await readFile('docs/audit/source/home.json', 'utf8'));
await writeFile('src/data/source-home.json', JSON.stringify({ title: home.title, meta: home.meta }, null, 2));
for (const slug of ['nosotros', 'auditoria', 'legal', 'asesoria-infonavit', 'gestor-de-pensiones']) {
  const source = JSON.parse(await readFile(`docs/audit/source/${slug}.json`, 'utf8'));
  const page = await browser.newPage();
  await page.route('**/*', (route) => route.abort());
  await page.setContent(source.mainHTML, { waitUntil: 'domcontentloaded' });
  const pageId = await page.locator('[data-elementor-type="wp-page"]').getAttribute('data-elementor-id');
  let css = '';
  try { css = (await exec('curl', ['-fL', '--retry', '1', '--max-time', '20', '-A', 'Mozilla/5.0', '-sS', `https://estenio.com.mx/wp-content/uploads/elementor/css/post-${pageId}.css`])).stdout; }
  catch (error) { console.log(`CSS unavailable for ${slug}: ${error.message}`); }
  const data = await page.evaluate(({ slug, css, title, meta }) => {
    const cssText = css + [...document.querySelectorAll('style')].map((style) => style.textContent).join('\n');
    const esc = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
    const text = (element) => element ? element.textContent.replace(/\s+/g, ' ').trim() : '';
    const widget = (id) => document.querySelector(`[data-id="${id}"]`);
    const link = (href) => href.replace(/^https:\/\/estenio\.com\.mx(?=\/|$)/, '') || '/';
    const clean = (element) => [...element.childNodes].map((node) => {
      if (node.nodeType === Node.TEXT_NODE) return esc(node.textContent);
      if (node.nodeType !== Node.ELEMENT_NODE || ['STYLE', 'SCRIPT', 'SVG'].includes(node.tagName)) return '';
      const tag = node.tagName.toLowerCase();
      if (tag === 'br') return '<br />';
      if (tag === 'a') return `<a href="${esc(link(node.getAttribute('href') || '#'))}">${clean(node)}</a>`;
      if (['p', 'ul', 'ol', 'li', 'strong', 'em', 'b'].includes(tag)) return `<${tag}>${clean(node)}</${tag}>`;
      return clean(node);
    }).join('');
    const rich = (element) => clean(element.querySelector('.elementor-heading-title') || element.querySelector('.elementor-widget-container') || element).trim();
    const byId = (id) => rich(widget(id));
    const local = (url) => '/assets/original/' + url.split('/').pop().split('?')[0];
    const allURLs = new Set();
    const image = (url, alt = '') => { if (!url) return null; allURLs.add(url); return { src: local(url), source: url, alt }; };
    const imgById = (id) => { const img = widget(id).querySelector('img'); return image(img.getAttribute('src'), img.alt); };
    const background = (element) => {
      if (!element) return null;
      const ids = [element, ...element.querySelectorAll('[data-id]')].map((element) => element.getAttribute('data-id')).filter(Boolean);
      let url;
      for (const rule of cssText.split('}')) {
        if (ids.some((id) => rule.split('{')[0].includes(`elementor-element-${id}`))) {
          const match = rule.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/);
          if (match) url = match[1];
        }
      }
      return url ? image(url) : null;
    };
    const tabsElement = document.querySelector('[data-widget_type="nested-tabs.default"]');
    const tabs = tabsElement ? [...tabsElement.querySelectorAll('[role="tabpanel"]')].map((panel, index) => {
      const headings = [...panel.querySelectorAll('[data-widget_type="heading.default"]')];
      const button = tabsElement.querySelectorAll('[role="tab"]')[index];
      const label = text(button.querySelector('.e-n-tab-title-text'));
      return { label, id: button.id, title: text(headings[0]), html: rich(headings[1]), image: background(panel) };
    }) : [];
    const cards = [...document.querySelectorAll('[data-widget_type="flip-box.default"]')].map((element) => {
      const back = element.querySelector('.elementor-flip-box__back');
      const loop = element.closest('.e-loop-item');
      const loopClass = [...loop.classList].find((name) => /^e-loop-item-\d+$/.test(name));
      const rule = cssText.split('}').find((rule) => rule.includes(`.${loopClass} `) && rule.includes('background-image'));
      const url = rule?.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
      const front = element.querySelector('.elementor-flip-box__front');
      return { title: text(back.querySelector('h3')), frontTitle: text(front.querySelector('h3')), frontLabel: text(front.querySelector('.elementor-flip-box__layer__description')), html: clean(back.querySelector('.elementor-flip-box__layer__description')).trim(), image: image(url) };
    });
    const accordion = (element) => [...element.querySelectorAll('details.e-n-accordion-item')].map((item) => ({ title: text(item.querySelector('.e-n-accordion-item-title-text')), html: [...item.querySelectorAll('[data-widget_type="text-editor.default"]')].map(rich).join('') }));
    const result = { path: slug, title, meta, heading: '', leadTitle: '', leadSubtitle: '', introHTML: '', tabs, cards, extraTitle: '', heroImage: null, historyImages: [], values: [], team: [], closing: '', stepTitle: '', stepIntro: '', steps: [], webinar: null, servicesHeading: '', servicesImage: null, services: [], features: [], testimonials: [], faq: [], contactExtra: '' };
    if (slug === 'nosotros') {
      result.heading = text(widget('6711308'));
      result.leadTitle = text(widget('6c6ac0e'));
      result.leadSubtitle = text(widget('eb9e854'));
      result.introHTML = byId('628d476');
      result.historyImages = [imgById('09e132d'), imgById('26f06c4')];
      const headings = [...document.querySelectorAll('[data-widget_type="heading.default"]')];
      const valuesStart = headings.findIndex((element) => text(element) === 'VALORES');
      result.valuesIntro = byId('ee2ea6d');
      result.values = headings.slice(valuesStart + 1, valuesStart + 9).map((element) => {
        const container = element.parentElement;
        return { title: text(element), html: rich(container.querySelector('[data-widget_type="text-editor.default"]')), image: image(container.querySelector('img').getAttribute('src'), container.querySelector('img').alt) };
      });
      const teamStart = headings.findIndex((element) => text(element) === 'NUESTRO EQUIPO');
      result.team = headings.slice(teamStart + 1, teamStart + 17).map((element) => ({ name: text(element), role: text(element.parentElement.querySelector('[data-widget_type="text-editor.default"]')), image: background(element.parentElement) }));
      result.teamImage = image(cssText.match(/url\(["']([^"']+equipo-estenio\.jpg)["']\)/)?.[1]);
      result.closing = text(widget('eea7ea3'));
      result.contactExtra = text(widget('5f0725c3'));
    } else if (slug === 'auditoria' || slug === 'legal') {
      const ids = slug === 'auditoria' ? ['30ef2df', '9302a68', '173a9b9', 'bee938a'] : ['8d953d1', '60ff5486', '53cee33a', '7a2bd2e4'];
      [result.heading, result.leadTitle] = ids.slice(0, 2).map((id) => text(widget(id)));
      result.introHTML = byId(ids[2]);
      result.extraTitle = text(widget(ids[3]));
      result.heroImage = background(widget(ids[0]).closest('.e-parent'));
    } else if (slug === 'asesoria-infonavit') {
      result.heading = text(widget('19a21b38'));
      result.leadTitle = text(widget('5b942fa8'));
      result.introHTML = byId('d596653');
      result.introImage = imgById('355c2146');
      result.heroImage = background(widget('19a21b38').closest('.e-parent'));
      result.stepTitle = text(widget('50506719'));
      result.stepIntro = byId('2098f44e');
      result.steps = [['cd6d2af','b7b080b','27dab51'],['0ebeed7','cadbeb4','0505ed6'],['775b725','8fed2f9','0d467ee'],['3569098','fff15e0','025d12d'],['1a1b847','9952195','f7c873c']].map(([number, title, body]) => ({ number: text(widget(number)), title: text(widget(title)), html: byId(body) }));
      result.webinar = { title: text(widget('aaf8499')), href: widget('f2492ae').querySelector('a').getAttribute('href'), image: imgById('e8cdec5') };
      result.servicesHeading = text(widget('9b1956b'));
      result.servicesImage = imgById('b1129a9');
      result.services = accordion(widget('2e2b6a3'));
    } else {
      result.heading = text(widget('444380a1'));
      result.leadTitle = text(widget('bebab99'));
      result.introHTML = byId('3bc8c23');
      result.heroImage = background(widget('444380a1').closest('.e-parent'));
      result.features = [['48b80823','a15364e'],['c125abc','ee9be21'],['56f51df6','4b8544ec']].map(([title, body]) => ({ title: text(widget(title)), html: byId(body), image: background(widget(title).parentElement) }));
      result.webinar = { title: text(widget('6b84738c')), href: widget('2015a83c').querySelector('a').getAttribute('href'), image: imgById('25c1cacc') };
      result.testimonials = [...widget('9d4fdc6').querySelectorAll('.elementor-testimonial')].map((element) => ({ quote: text(element.querySelector('.elementor-testimonial__text')), name: text(element.querySelector('.elementor-testimonial__name')), role: text(element.querySelector('.elementor-testimonial__title')), image: image(element.querySelector('img').getAttribute('src'), element.querySelector('img').alt) }));
      result.faq = [...accordion(widget('e69d1b1')), ...accordion(widget('04f5b6d'))];
      result.contactExtra = text(widget('7d23fd4e'));
    }
    return { ...result, media: [...allURLs] };
  }, { slug, css, title: source.title, meta: source.meta });
  for (const url of data.media) media.set(url, 'public/assets/original/' + url.split('/').pop().split('?')[0]);
  delete data.media;
  pages.push(data);
  console.log(`Imported ${slug}: ${data.tabs.length} tabs, ${data.cards.length} cards, ${data.team.length} portraits, ${data.faq.length} FAQ`);
  await page.close();
}
await browser.close();
await writeFile('src/data/source-pages.json', JSON.stringify(pages, null, 2));
const inventory = [];
for (const slug of ['home', ...pages.map((page) => page.path)]) {
  const source = JSON.parse(await readFile(`docs/audit/source/${slug}.json`, 'utf8'));
  inventory.push({ pathname: slug === 'home' ? '/' : `/${slug}/`, title: source.title, meta: source.meta, links: source.links, widgets: source.widgets.map(({ id, type }) => ({ id, type })) });
}
await writeFile('docs/audit/source-inventory.json', JSON.stringify(inventory, null, 2));
const queue = [...media.entries()];
const results = [];
while (queue.length) {
  await Promise.all(queue.splice(0, 4).map(async ([url, file]) => {
    try {
      try { await stat(file); } catch { await exec('curl', ['-fL', '--retry', '1', '--max-time', '35', '-A', 'Mozilla/5.0', '-sS', url, '-o', file]); }
      results.push({ url, file, size: (await stat(file)).size });
      console.log(`Media ready: ${file.split('/').pop()}`);
    } catch (error) { results.push({ url, file, error: error.message }); console.log(`Unavailable ${url}: ${error.message}`); }
  }));
}
await writeFile('docs/audit/page-media.json', JSON.stringify(results, null, 2));
