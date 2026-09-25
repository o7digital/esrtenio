import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'laptop-1024', width: 1024, height: 900 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
];

for (const viewport of viewports) {
  test(`${viewport.name}: rendu sans débordement ni ressource manquante`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    const failedResources: string[] = [];

    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) failedResources.push(`${response.status()} ${response.url()}`);
    });

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Certeza para');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

    const missingAnchors = await page.locator('a[href^="#"]').evaluateAll((links) =>
      links
        .map((link) => link.getAttribute('href'))
        .filter((href): href is string => Boolean(href && !document.querySelector(href))),
    );
    expect(missingAnchors).toEqual([]);
    expect(errors).toEqual([]);
    expect(failedResources).toEqual([]);

    await page.screenshot({ path: testInfo.outputPath(`${viewport.name}.png`), fullPage: true });
  });
}

test('les quatre spécialités répondent au clic et au clavier', async ({ page }) => {
  await page.goto('/');
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(4);

  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Una defensa a la altura');

  await tabs.nth(1).press('ArrowDown');
  await expect(tabs.nth(2)).toBeFocused();
  await expect(tabs.nth(2)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Más claridad en cada obligación');

  await tabs.nth(2).press('End');
  await expect(tabs.nth(3)).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('Un retiro que empieza');

  await tabs.nth(3).press('Home');
  await expect(tabs.nth(0)).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('Anticiparse es la mejor forma');
});

test('les trois profils affichent leur contenu', async ({ page }) => {
  await page.goto('/');
  const profiles = [
    ['Soy empresa', 'La tranquilidad de una operación en orden.'],
    ['Soy particular', 'Tu historia laboral merece una mirada completa.'],
    ['Sector construcción', 'Construir con una base de cumplimiento.'],
  ];

  for (const [button, title] of profiles) {
    const control = page.getByRole('button', { name: button });
    await control.click();
    await expect(control).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.audience-content h3')).toHaveText(title);
  }
});

test('le menu mobile s’ouvre, se ferme et conserve ses attributs ARIA', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('.menu');

  await expect(menu).toHaveAccessibleName('Abrir menú');

  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toHaveAccessibleName('Cerrar menú');
  await expect(page.locator('#navlinks')).toHaveClass(/open/);

  await menu.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toHaveAccessibleName('Abrir menú');
  await expect(menu).toBeFocused();
});

test('le formulaire valide localement sans requête ni stockage', async ({ page }) => {
  const mutatingRequests: string[] = [];
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) {
      mutatingRequests.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto('/');
  const form = page.locator('#contact-form');
  expect(await form.evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(false);
  await page.getByRole('button', { name: 'Probar solicitud de contacto' }).click();
  await expect(page.getByRole('status')).toBeEmpty();

  await page.getByLabel('Nombre').fill('María Test');
  await page.getByLabel('Correo electrónico').fill('maria@example.com');
  await page.getByLabel('¿En qué podemos ayudarte?').fill('Prueba de validación local.');
  await page.getByRole('button', { name: 'Probar solicitud de contacto' }).click();

  await expect(page.getByRole('status')).toHaveText('Demostración completada. No se ha enviado ninguna solicitud.');
  expect(mutatingRequests).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});
