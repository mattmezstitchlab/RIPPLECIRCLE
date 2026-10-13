import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const PORT = 4175;
const ROOT = 'http://127.0.0.1:' + PORT;
const OUTPUT = 'artifacts/visual-review';
const sizes = [
  { id: 'desktop-1600', width: 1600, height: 900 },
  { id: 'laptop-1366', width: 1366, height: 768 },
  { id: 'tablet-1024', width: 1024, height: 768 },
  { id: 'mobile-390', width: 390, height: 844 },
  { id: 'mobile-360', width: 360, height: 740 }
];
await mkdir(OUTPUT, { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  stdio: 'pipe', env: { ...process.env, BROWSER: 'none' }
});
server.stdout.on('data', (b) => process.stdout.write('vite: ' + String(b)));
server.stderr.on('data', (b) => process.stderr.write('vite: ' + String(b)));
let browser;
const findings = [];
const rect = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), width: +r.width.toFixed(1),
    height: +r.height.toFixed(1), bottom: +r.bottom.toFixed(1), right: +r.right.toFixed(1) };
};
try {
  let ready = false;
  for (let i = 0; i < 65; i++) {
    try {
      const response = await fetch(ROOT);
      if (response.ok) { ready = true; break; }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  if (!ready) throw new Error('Vite did not start');
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  for (const size of sizes) {
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    // Audit local : ni CDN, ni images distantes, ni attente de fontes externes.
    await page.route('**/*', route => {
      if (route.request().url().startsWith(ROOT)) return route.continue();
      return route.abort();
    });
    page.setDefaultTimeout(12000);
    console.log('VISUAL_START ' + size.id);
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(String(err.message)));
    await page.goto(ROOT, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('.ripple-watch-column').waitFor({ timeout: 16000 });
    await page.screenshot({ path: OUTPUT + '/' + size.id + '.png', fullPage: true, animations: 'disabled', timeout: 15000 });
    const result = await page.evaluate(() => {
      const r = (el) => {
        if (!el) return null;
        const a = el.getBoundingClientRect();
        return { x: +a.x.toFixed(1), y: +a.y.toFixed(1), width: +a.width.toFixed(1), height: +a.height.toFixed(1), right: +a.right.toFixed(1), bottom: +a.bottom.toFixed(1) };
      };
      const q = s => document.querySelector(s);
      const all = s => [...document.querySelectorAll(s)];
      const dial = r(q('[role="application"]'));
      const inspector = r(q('.ripple-inspector'));
      const cause = r(q('.ripple-context-panel'));
      const stage = r(q('.ripple-stage'));
      return {
        viewport: { width: innerWidth, height: innerHeight },
        doc: { scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight },
        stage, dial, inspector, cause,
        orbit: r(q('.ripple-orbit-nav')),
        navButtons: all('.ripple-orbit-button').map(el => ({ label: el.getAttribute('aria-label'), rect: r(el) })),
        controls: r(q('.ripple-watch-controls')),
        headerAccountCount: all('header button').length,
        svgCount: all('[role="application"] svg').length,
        bodyBackground: getComputedStyle(document.body).backgroundColor,
        inspectorOverflow: q('.ripple-inspector') ? getComputedStyle(q('.ripple-inspector')).overflowY : '',
        circleCenterDelta: dial ? +((dial.x + dial.width / 2) - innerWidth / 2).toFixed(1) : null,
        causeInitiallyVisible: cause ? cause.y < innerHeight && cause.bottom > 0 : null
      };
    });
    if (pageErrors.length) findings.push({ size: size.id, kind: 'console-errors', errors: pageErrors });
    if (result.doc.scrollWidth > size.width + 2) findings.push({ size: size.id, kind: 'horizontal-overflow', pixels: result.doc.scrollWidth - size.width });
    if (!result.dial || result.dial.width < 230) findings.push({ size: size.id, kind: 'dial-too-small', width: result.dial?.width });
    if (size.width >= 1280 && (!result.causeInitiallyVisible || !result.inspector)) findings.push({ size: size.id, kind: 'causality-not-visible' });
    if (size.width < 1280 && !result.causeInitiallyVisible) findings.push({ size: size.id, kind: 'causality-below-fold' });
    if (result.navButtons.some(n => n.rect.x < -3 || n.rect.right > size.width + 3)) findings.push({ size: size.id, kind: 'orbit-control-clipped' });
    if (result.headerAccountCount !== 1) findings.push({ size: size.id, kind: 'header-controls', count: result.headerAccountCount });
    if (size.width >= 1280 && result.dial && result.inspector && result.dial.right > result.inspector.x + 1) findings.push({ size: size.id, kind: 'dial-inspector-overlap' });

    // Réelle interaction utilisateur : trois fonctions de démonstration, pas des CTA inertes.
    const hero = page.locator('.ripple-public-hero');
    if (await hero.count() !== 1) findings.push({size:size.id,kind:'hero-missing'});
    await hero.getByRole('button', { name: 'Simuler un imprévu' }).click();
    await page.locator('.ripple-demo-explorer').waitFor();
    if (!await page.getByText('00:10', { exact: true }).count()) findings.push({size:size.id,kind:'scenario-10-failed'});
    await page.getByRole('button', { name: '+18 min', exact: true }).click();
    if (!await page.getByText('00:18', { exact: true }).count()) findings.push({size:size.id,kind:'scenario-18-failed'});
    await hero.getByRole('button',{name:'Réparer le planning'}).click();
    if (await page.locator('.ripple-repair-option').count() !== 3) findings.push({size:size.id,kind:'repair-options-missing'});
    await page.screenshot({ path: OUTPUT + '/' + size.id + '-repair.png', fullPage: true, animations: 'disabled', timeout: 15000 });
    await page.locator('.ripple-repair-option').first().click();
    if (!await page.getByText(/Plan sélectionné dans la simulation/).count()) findings.push({size:size.id,kind:'repair-selection-failed'});
    await hero.getByRole('button',{name:'Trouver la première cause'}).click();
    if (await page.locator('.ripple-root-chain li').count() !== 5) findings.push({size:size.id,kind:'root-chain-missing'});
    await hero.getByRole('button',{name:'Fermer'}).click();
    if (await page.locator('.ripple-demo-explorer').count()) findings.push({size:size.id,kind:'close-simulation-failed'});
    // V4 — trois nouveaux outils réellement interactifs sur données fictives.
    const toolsNav = page.locator('.ripple-v4-nav');
    if (await toolsNav.getByRole('button').count() !== 3) findings.push({ size:size.id, kind:'v4-toolbar-missing' });
    await toolsNav.getByRole('button', { name: 'Impacts cachés' }).click();
    if (await page.locator('.ripple-v4-impacts li').count() !== 7) findings.push({ size:size.id, kind:'v4-indirect-graph-failed' });
    if (!await page.getByText('Hypothèse', { exact:true }).count()) findings.push({ size:size.id, kind:'v4-evidence-missing' });
    if (['desktop-1600', 'mobile-390'].includes(size.id)) {
      await page.screenshot({ path: OUTPUT + '/' + size.id + '-indirect.png', fullPage:true, animations:'disabled', timeout:15000 });
    }
    await toolsNav.getByRole('button', { name: 'Répartir les actions' }).click();
    if (await page.locator('.ripple-v4-assignment').count() !== 2) findings.push({ size:size.id, kind:'v4-action-drafts-failed' });
    await page.locator('.ripple-v4-assignment .ripple-v4-ready').first().click();
    if (!await page.locator('.ripple-v4-ready[aria-pressed="true"]').count()) findings.push({ size:size.id, kind:'v4-local-action-confirmation-failed' });
    if (['desktop-1600', 'mobile-390'].includes(size.id)) {
      await page.screenshot({ path: OUTPUT + '/' + size.id + '-dispatch.png', fullPage:true, animations:'disabled', timeout:15000 });
    }
    await toolsNav.getByRole('button', { name: 'Rejouer' }).click();
    if (await page.locator('.ripple-v4-frame').count() !== 7) findings.push({ size:size.id, kind:'v4-replay-frames-failed' });
    await page.locator('.ripple-v4-frame').nth(1).click();
    if ((await page.locator('[data-testid="explored-time"]').innerText()) !== '21:08') findings.push({ size:size.id, kind:'v4-replay-dial-unsynced' });
    await page.getByRole('button',{name:'Revenir au début'}).click();
    await page.getByRole('button',{name:'Lancer le rejeu'}).click();
    try {
      await page.waitForFunction(
        () => document.querySelector('.ripple-v4-frame-counter')?.textContent?.trim() !== '1/7',
        null, { timeout:5000 }
      );
    } catch { findings.push({ size:size.id, kind:'v4-replay-autoplay-failed' }); }
    await page.getByRole('button',{name:'Mettre le rejeu en pause'}).click();
    if (['desktop-1600', 'mobile-390'].includes(size.id)) {
      await page.screenshot({ path: OUTPUT + '/' + size.id + '-replay.png', fullPage:true, animations:'disabled', timeout:15000 });
    }
    await toolsNav.getByRole('button', { name: 'Rejouer' }).click();
    if (await page.locator('.ripple-v4-frames').count()) findings.push({ size:size.id, kind:'v4-close-replay-failed' });
    const nav = page.getByRole('button', { name: 'Musique' });
    await nav.click();
    if (!page.url().includes('#playlist')) findings.push({ size: size.id, kind: 'navigation-failed' });
    await page.getByRole('button', { name: 'Compte', exact: true }).click();
    if (!page.url().includes('#account')) findings.push({ size: size.id, kind: 'account-failed' });
    await page.getByRole('button', { name: 'Retour au Ripple' }).click();
    await page.locator('.ripple-watch-column').waitFor();
    if (size.id === 'mobile-390') {
      await page.getByRole('button', { name: 'Compte', exact: true }).click();
      await page.getByRole('button', { name: /Affichage/ }).click();
      await page.getByRole('button', { name: /Mode nuit/ }).click();
      await page.getByRole('button', { name: 'Retour au Ripple' }).click();
      await page.waitForTimeout(2800); // ne pas capturer le toast temporaire
      await page.screenshot({ path: OUTPUT + '/mobile-390-night.png', fullPage: true, animations: 'disabled', timeout: 15000 });
    }
    console.log('VISUAL_QA ' + JSON.stringify({ id: size.id, ...result, pageErrors }));
    await context.close();
  }
  await writeFile(OUTPUT + '/findings.json', JSON.stringify({ findings }, null, 2));
  console.log('VISUAL_FINDINGS ' + JSON.stringify(findings));
  if (findings.some(x => ['console-errors', 'horizontal-overflow', 'orbit-control-clipped', 'dial-inspector-overlap', 'header-controls', 'navigation-failed', 'account-failed', 'hero-missing', 'scenario-10-failed', 'scenario-18-failed', 'repair-options-missing', 'repair-selection-failed', 'root-chain-missing', 'close-simulation-failed', 'v4-toolbar-missing', 'v4-indirect-graph-failed', 'v4-evidence-missing', 'v4-action-drafts-failed', 'v4-local-action-confirmation-failed', 'v4-replay-frames-failed', 'v4-replay-dial-unsynced', 'v4-replay-autoplay-failed', 'v4-close-replay-failed'].includes(x.kind))) {
    process.exitCode = 1;
  }
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
