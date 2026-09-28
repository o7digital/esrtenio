import { expect, test } from '@playwright/test';

const routes = ['/', '/nosotros/', '/auditoria/', '/legal/', '/asesoria-infonavit/', '/gestor-de-pensiones/'];
const viewports = [
  { width: 1440, height: 1000 },
  { width: 1024, height: 900 },
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

test('le formulaire est local et n’affiche pas de fausse confirmation', async ({ page }) => {
  const mutations: string[] = [];
  page.on('request', (request) => { if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) mutations.push(request.method()); });
  await page.goto('/');
  const form = page.locator('#contact-form');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.locator('.form-status')).toBeEmpty();
  await page.getByLabel('Nombre*').fill('María Test');
  await page.getByLabel('Email*').fill('maria@example.com');
  await page.getByLabel('Mensaje').fill('Prueba de previsualización.');
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.locator('.form-status')).toHaveText('Previsualización únicamente: no se ha enviado ninguna solicitud.');
  expect(mutations).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  expect(await form.evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(false);
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
