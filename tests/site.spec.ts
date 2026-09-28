import { expect, test } from '@playwright/test';

const routes = ['/', '/nosotros/', '/auditoria/', '/legal/', '/asesoria-infonavit/', '/gestor-de-pensiones/'];
const viewports = [
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
];

for (const route of routes) {
  test(`${route}: noindex, recursos y layout`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedResources: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('response', (response) => { if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`); });

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(route);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
      await expect(page.locator('header')).toBeVisible();
      await page.locator('body').evaluate(async () => {
        for (const image of document.querySelectorAll('img')) image.loading = 'eager';
        await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
      });
      const brokenImages = await page.locator('img').evaluateAll((images) => images.map((image) => image as HTMLImageElement).filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src));
      expect(brokenImages).toEqual([]);
      const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    }

    expect(consoleErrors).toEqual([]);
    expect(failedResources).toEqual([]);
  });
}

test('la navigation expose les routes originales', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'NOSOTROS' })).toHaveAttribute('href', '/nosotros/');
  await page.locator('.nav-group summary').click();
  await expect(page.getByRole('link', { name: 'Auditoría' })).toHaveAttribute('href', '/auditoria/');
  await expect(page.getByRole('link', { name: 'Legal' })).toHaveAttribute('href', '/legal/');
  await expect(page.getByRole('link', { name: 'Asesoría INFONAVIT' })).toHaveAttribute('href', '/asesoria-infonavit/');
  await expect(page.getByRole('link', { name: 'Pensión' }).first()).toHaveAttribute('href', '/gestor-de-pensiones/');
});

test('le menu mobile se ferme au clavier', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('.menu-toggle');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#site-nav')).toHaveClass(/is-open/);
  await menu.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
});

test('le formulaire reste inerte sans JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL + '/');
  const button = page.getByRole('button', { name: 'Enviar' });
  await expect(button).toHaveAttribute('type', 'button');
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await button.click();
  expect(requests.filter((url) => url.includes('name=') || url.includes('message='))).toEqual([]);
  await expect(page.locator('.form-status')).toBeEmpty();
  await context.close();
});

test('le formulaire est local et n’affiche pas de fausse confirmation', async ({ page }) => {
  const mutations: string[] = [];
  page.on('request', (request) => { if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) mutations.push(request.method()); });
  await page.goto('/');
  const form = page.locator('#contact-form');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.locator('.form-status')).toBeEmpty();
  await page.getByLabel('Nombre*').fill('María Test');
  await page.getByLabel('Email*').fill('maria@example.com');
  await page.getByLabel('Mensaje*', { exact: true }).fill('Prueba de previsualización.');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.locator('.form-status')).toHaveText('Previsualización únicamente: no se ha enviado ninguna solicitud.');
  expect(mutations).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  expect(await form.evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(false);
});

test('la vidéo originale se lit et le mode réduit reste statique', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('.hero-video');
  await expect(video).toHaveAttribute('autoplay', '');
  await expect(video).toHaveAttribute('muted', '');
  await expect(video).toHaveAttribute('loop', '');
  await expect(video).toHaveAttribute('playsinline', '');
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime), { timeout: 20000 }).toBeGreaterThan(0);
  await expect(page.locator('.home-hero a')).toHaveCount(0);
  await page.getByRole('button', { name: 'Pausar video' }).click();
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(video).toBeHidden();
  await expect(page.locator('.hero-poster')).toBeVisible();
  expect(await video.getAttribute('src')).toBeNull();
});

test('les logos ont des proportions préservées', async ({ page }) => {
  await page.goto('/');
  const logos = page.locator('.about-logo, .client-logo img, .logo img, .footer-logo');
  await expect(logos).toHaveCount(13);
  const invalid = await logos.evaluateAll((images) => images.map((image) => image as HTMLImageElement).filter((image) => {
    const style = getComputedStyle(image);
    return style.objectFit !== 'contain' || style.clipPath !== 'none';
  }).map((image) => image.src));
  expect(invalid).toEqual([]);
  await expect(page.locator('.about-logo')).toHaveAttribute('width', '260');
  await expect(page.locator('.about-logo')).toHaveAttribute('height', '116');
});

test('les onglets des services fonctionnent au clavier', async ({ page }) => {
  await page.goto('/auditoria/');
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(5);
  await tabs.first().press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('Dictamen INFONAVIT');
  await tabs.nth(1).press('End');
  await expect(tabs.last()).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('Dictamen por Contribuciones Locales');
});

test('les contenus critiques du site original sont présents', async ({ page }) => {
  await page.goto('/nosotros/');
  await expect(page.locator('body')).toContainText('Jesús Estenio López');
  await page.goto('/gestor-de-pensiones/');
  await expect(page.locator('body')).toContainText('PREGUNTAS FRECUENTES');
  await expect(page.locator('body')).toContainText('¿Qué es la Ley 73 del Seguro Social?');
  await page.goto('/asesoria-infonavit/');
  await expect(page.locator('body')).toContainText('Diagnóstico personalizado');
});
