import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

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
    await page.goto(ROOT, { waitUntil:'domcontentloaded', timeout:30000 });
    await page.locator('.ripple-booking-page').waitFor({timeout:16000});
    if(await page.locator('.ripple-booking-wheel').getAttribute('data-view') !== 'year')
      findings.push({size:size.id,kind:'v8-not-date-first'});
    if(await page.locator('.ripple-booking-month').count()!==12)
      findings.push({size:size.id,kind:'v8-calendar-months-missing'});
    if(await page.getByText('Disponibilité à confirmer').count())
      findings.push({size:size.id,kind:'v8-premature-availability'});
    if(['desktop-1600','mobile-390'].includes(size.id))
      await page.screenshot({path:OUTPUT+'/'+size.id+'-v8-booking-start.png',fullPage:true,animations:'disabled',timeout:15000});
    const bookingYear = new Date().getFullYear()+1;
    await page.getByRole('button',{name:'Juin '+bookingYear}).click();
    if(await page.locator('.ripple-booking-day').count()!==30)
      findings.push({size:size.id,kind:'v8-calendar-days-missing'});
    await page.getByRole('button',{name:'12 Juin '+bookingYear}).click();
    if(!await page.getByText('Disponibilité à confirmer').count())
      findings.push({size:size.id,kind:'v8-availability-misrepresented'});
    await page.locator('#ripple-booking-first').fill('Camille');
    await page.locator('#ripple-booking-city').fill('Lille');
    await page.locator('#ripple-booking-moment').selectOption('Cocktail');
    const mailHref=await page.locator('[data-testid="booking-request"]').getAttribute('href');
    if(!mailHref?.startsWith('mailto:bookingmattmezsax@gmail.com')
      || !decodeURIComponent(mailHref).includes(bookingYear+'-06-12')
      || !decodeURIComponent(mailHref).includes('Lille'))
      findings.push({size:size.id,kind:'v8-request-mail-incorrect'});
    if(['desktop-1600','mobile-390'].includes(size.id))
      await page.screenshot({path:OUTPUT+'/'+size.id+'-v8-booking-selected.png',fullPage:true,animations:'disabled',timeout:15000});
    const bookingOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    if(bookingOverflow>2)findings.push({size:size.id,kind:'v8-booking-overflow',pixels:bookingOverflow});
    await page.getByRole('link',{name:'Découvrir le cadran'}).click();
    await page.locator('.ripple-watch-column').waitFor({timeout:16000});
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

    // V7 — one framing button cycles full → half → selected quarter → full.
    const framingButton = page.locator('.ripple-v7-frame-btn');
    const fixedDock = page.locator('.ripple-v7-dock');
    if(await framingButton.count() !== 1) findings.push({size:size.id,kind:'v7-frame-button-missing'});
    const dockPos = await fixedDock.evaluate(el => ({
      position:getComputedStyle(el).position,
      bottom:el.getBoundingClientRect().bottom,
      y:el.getBoundingClientRect().y
    }));
    if(dockPos.position !== 'fixed' || dockPos.bottom > size.height + 1)
      findings.push({size:size.id,kind:'v7-bottom-dock-not-fixed'});
    const fullDial = await page.locator('[role="application"]').boundingBox();
    if(fullDial && dockPos.y < fullDial.y + fullDial.height - 4)
      findings.push({size:size.id,kind:'v7-dock-overlaps-full-circle'});
    if (await page.locator('.ripple-watch-wrap').getAttribute('data-framing') !== 'full')
      findings.push({size:size.id,kind:'v7-wrong-default-frame'});
    await framingButton.click();
    const halfWindow=page.locator('.ripple-watch-wrap[data-framing="half"]');
    await halfWindow.waitFor();
    const halfWindowBox=await halfWindow.boundingBox();
    if(!halfWindowBox || Math.abs(halfWindowBox.width / 2 - halfWindowBox.height) > 4)
      findings.push({size:size.id,kind:'v7-half-missing-crop',rect:halfWindowBox});
    if (['desktop-1600','mobile-390'].includes(size.id))
      await page.screenshot({path:OUTPUT+'/'+size.id+'-v7-half.png',fullPage:true,animations:'disabled',timeout:15000});
    await framingButton.click();
    const quarter=page.locator('.ripple-watch-wrap[data-framing="quarter"]');
    await quarter.waitFor();
    const viewBox=await page.locator('.ripple-watch-wrap svg').getAttribute('viewBox');
    if(!viewBox || Math.abs(Number(viewBox.trim().split(/\s+/)[2]) - 530)>1)
      findings.push({size:size.id,kind:'v7-quarter-zoom-invalid',viewBox});
    if (['desktop-1600','mobile-390'].includes(size.id))
      await page.screenshot({path:OUTPUT+'/'+size.id+'-v7-quarter.png',fullPage:true,animations:'disabled',timeout:15000});
    await framingButton.click();
    if (await page.locator('.ripple-watch-wrap').getAttribute('data-framing') !== 'full')
      findings.push({size:size.id,kind:'v7-cycle-not-reversible'});
    await page.locator('[role="application"]').dblclick({position:{x:65,y:65}});
    if (await page.locator('.ripple-watch-wrap').getAttribute('data-framing') !== 'half')
      findings.push({size:size.id,kind:'v7-doubleclick-framing-failed'});
    await framingButton.click();
    await page.getByRole('button',{name:'Recentrer le cadran'}).count(); // present in disclosure, not visible until opened
    await framingButton.click();
    // V6 — THREE primary modes and no seven-button strip at rest.
    const topbar = page.locator('.ripple-v6-topbar');
    if (await topbar.count() !== 1) findings.push({size:size.id,kind:'v6-modebar-missing'});
    if (await topbar.locator('.ripple-v6-mode').count() !== 3)
      findings.push({size:size.id,kind:'v6-not-three-modes'});
    if (await page.locator('.ripple-v6-layers').getAttribute('open') !== null)
      findings.push({size:size.id,kind:'v6-layers-open-at-rest'});
    if (await page.locator('.ripple-v6-layers .ripple-orbit-nav').isVisible())
      findings.push({size:size.id,kind:'v6-hidden-layers-visible'});
    if (await page.locator('.ripple-v6-inspector .ripple-context-steps').count())
      findings.push({size:size.id,kind:'v6-verbose-inspector-still-shown'});
    if (await page.locator('.ripple-v6-context-details[open]').count())
      findings.push({size:size.id,kind:'v6-details-open-at-rest'});
    if (await page.locator('.ripple-v6-watch-settings[open]').count())
      findings.push({size:size.id,kind:'v6-settings-open-at-rest'});
    if (await page.locator('.ripple-v6-watch-settings .ripple-watch-controls').isVisible())
      findings.push({size:size.id,kind:'v6-hidden-controls-visible'});
    await page.locator('.ripple-v6-watch-settings > summary').click();
    await page.getByRole('button',{name:'Zoomer',exact:true}).click();
    await page.getByRole('button',{name:'Recentrer le cadran'}).click();
    await page.locator('.ripple-v6-watch-settings > summary').click();
    await topbar.getByRole('button',{name:'Et si ?'}).click();
    await page.locator('.ripple-demo-explorer').waitFor();
    if (!await page.getByText('00:10',{exact:true}).count())
      findings.push({size:size.id,kind:'scenario-10-failed'});
    await page.getByRole('button',{name:'+18 min',exact:true}).click();
    if (!await page.getByText('00:18',{exact:true}).count())
      findings.push({size:size.id,kind:'scenario-18-failed'});
    await page.getByRole('button',{name:'Réparer le planning'}).click();
    if (await page.locator('.ripple-repair-option').count()!==3)
      findings.push({size:size.id,kind:'repair-options-missing'});
    if (['desktop-1600','mobile-390'].includes(size.id)) {
      await page.screenshot({path:OUTPUT+'/'+size.id+'-v6-repair.png',fullPage:true,animations:'disabled',timeout:15000});
    }
    await page.locator('.ripple-repair-option').first().click();
    if (!await page.getByText(/Plan sélectionné dans la simulation/).count())
      findings.push({size:size.id,kind:'repair-selection-failed'});
    await page.getByRole('button',{name:'Trouver la première cause'}).click();
    if (await page.locator('.ripple-root-chain li').count()!==5)
      findings.push({size:size.id,kind:'root-chain-missing'});
    await topbar.getByRole('button',{name:'Explorer',exact:true}).click();
    if (await page.locator('.ripple-demo-explorer').count())
      findings.push({size:size.id,kind:'close-simulation-failed'});
    const toolDetails=page.locator('.ripple-v6-advanced-tools');
    await toolDetails.locator('summary').click();
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
    if (await page.locator('.ripple-v4-assignment').count() !== 3) findings.push({ size:size.id, kind:'v4-action-drafts-failed' });
    await page.locator('.ripple-v4-assignment .ripple-v4-ready').first().click();
    if (!await page.locator('.ripple-v4-ready[aria-pressed="true"]').count()) findings.push({ size:size.id, kind:'v4-local-action-confirmation-failed' });
    if (['desktop-1600', 'mobile-390'].includes(size.id)) {
      await page.screenshot({ path: OUTPUT + '/' + size.id + '-dispatch.png', fullPage:true, animations:'disabled', timeout:15000 });
    }
    await toolsNav.getByRole('button', { name: 'Rejouer' }).click();
    if (await page.locator('.ripple-v4-frame').count() !== 7) findings.push({ size:size.id, kind:'v4-replay-frames-failed' });
    await page.locator('.ripple-v4-frame').nth(1).click();
    try {
      await page.waitForFunction(
        () => document.querySelector('[data-testid="explored-time"]')?.textContent?.trim() === '21:08',
        null, { timeout: 4000 }
      );
    } catch { findings.push({ size:size.id, kind:'v4-replay-dial-unsynced' }); }
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
    // V5 : pas de verso, portraits en regard de leur contenu dans l'inspecteur.
    if (await page.getByRole('button',{name:'Voir les photos au verso'}).count() !== 0)
      findings.push({size:size.id,kind:'v5-back-face-still-present'});
    if (await page.locator('.ripple-effect-avatar').count() < 2)
      findings.push({size:size.id,kind:'v5-impact-portraits-missing'});
    if (await page.locator('.ripple-context-person').count() < 1)
      findings.push({size:size.id,kind:'v5-context-portraits-missing'});
    await page.locator('.ripple-context-person').first().click();
    await page.locator('.ripple-v6-summary-heading [data-testid="person-portrait"]').waitFor();
    const selectedName=await page.locator('.ripple-v6-summary-heading h2').textContent();
    if (!selectedName || !selectedName.trim())
      findings.push({size:size.id,kind:'v5-person-focus-missing'});
    if (['desktop-1600','mobile-390'].includes(size.id)){
      await page.screenshot({path:OUTPUT+'/'+size.id+'-people-single-face.png',
        fullPage:true,animations:'disabled',timeout:15000});
    }
    await page.locator('.ripple-v6-layers > summary').click();
    await page.getByRole('button',{name:'Personnes et relations'}).click();
    if (await page.locator('.ripple-v6-summary-heading [data-testid="person-portrait"]').count() !== 1)
      findings.push({size:size.id,kind:'v5-people-layer-portrait-missing'});
    await page.locator('.ripple-v6-more > summary').click();
    await page.getByText('Explorer les éléments de cette couche').click();
    if (await page.locator('.ripple-context-fold').last().locator('[data-testid="person-portrait"]').count() < 2)
      findings.push({size:size.id,kind:'v5-directory-portraits-missing'});
    await page.locator('.ripple-v6-layers > summary').click();
    const nav = page.getByRole('button', { name: 'Musique' });
    await nav.click();
    if (!page.url().includes('#playlist')) findings.push({ size: size.id, kind: 'navigation-failed' });
    await page.getByRole('button', { name: 'Compte', exact: true }).click();
    if (!page.url().includes('#account')) findings.push({size:size.id,kind:'account-failed'});
    if (await page.getByRole('button', { name:/Mode nuit|Affichage/i }).count())
      findings.push({size:size.id,kind:'night-option-still-visible'});
    await page.getByRole('navigation',{name:'Réglages du compte'}).waitFor({state:'visible',timeout:8000});
    const accountTabs=page.getByRole('navigation',{name:'Réglages du compte'}).getByRole('button');
    if (await accountTabs.count()!==4) findings.push({size:size.id,kind:'account-tabs-invalid'});
    const tabRects = await page.locator('.account-settings-tab').evaluateAll(items =>
      items.map(el => ({ left:el.getBoundingClientRect().left, right:el.getBoundingClientRect().right })));
    if (tabRects.some(r => r.left < -1 || r.right > size.width + 1))
      findings.push({size:size.id,kind:'account-tabs-clipped'});
    await page.getByLabel('Prénom').fill('Profil QA');
    await page.getByRole('button', { name:'RSVP', exact:true }).click();
    await page.getByRole('button', { name:'Je confirme bientôt' }).click();
    if (await page.getByRole('button', { name:'Je confirme bientôt' }).getAttribute('aria-pressed')!=='true')
      findings.push({size:size.id,kind:'rsvp-selection-failed'});
    await page.getByRole('button', { name:'Parcours', exact:true }).click();
    if (!await page.getByText('Ajouter une étape de vie').count())
      findings.push({size:size.id,kind:'journey-tab-missing'});
    await page.getByRole('button', { name:'Mes données' }).click();
    const downloadPromise=page.waitForEvent('download');
    await page.getByRole('button', { name:'Télécharger mes données' }).click();
    const download=await downloadPromise;
    try {
      const data=JSON.parse(await readFile(await download.path(),'utf8'));
      if (download.suggestedFilename()!=='ripplecircle-mes-donnees.json'
        || data.account.first!=='Profil QA'||data.account.rsvp!=='maybe'
        || Object.hasOwn(data.account,'theme')) {
        findings.push({size:size.id,kind:'account-export-invalid'});
      }
    } catch {findings.push({size:size.id,kind:'account-export-unreadable'});}
    await page.getByRole('button', { name:'Rétablir le profil de démonstration' }).click();
    await page.getByRole('button', { name:'Annuler' }).click();
    if (!await page.getByText('Profil QA', {exact:false}).count())
      findings.push({size:size.id,kind:'account-reset-cancel-failed'});
    await page.getByRole('button', { name:'Rétablir le profil de démonstration' }).click();
    await page.getByRole('button', { name:'Oui, remplacer' }).click();
    await page.getByRole('button', { name:'Profil', exact:true }).click();
    if (await page.getByLabel('Prénom').inputValue()!=='Antoine')
      findings.push({size:size.id,kind:'account-reset-failed'});
    if (['desktop-1600','mobile-390'].includes(size.id)){
      await page.waitForTimeout(2750); // capture the settled account, not a transient reset toast
      await page.evaluate(() => scrollTo(0,0));
      await page.screenshot({path:OUTPUT+'/'+size.id+'-account.png',fullPage:true,animations:'disabled',timeout:15000});
    }
    if(size.id==='mobile-390'){
      await page.evaluate(()=>{
        const key='regie.account.v2';
        const saved=JSON.parse(localStorage.getItem(key));
        saved.theme='night';saved.first='Personne QA';saved.rsvp='no';
        localStorage.setItem(key,JSON.stringify(saved));
      });
      await page.reload();
      try {
        await page.waitForFunction(()=>{
          const v=JSON.parse(localStorage.getItem('regie.account.v2'));
          return v.first==='Personne QA'&&v.rsvp==='no'&&!Object.hasOwn(v,'theme');
        },null,{timeout:6000});
      } catch {findings.push({size:size.id,kind:'legacy-night-migration-failed'});}
      const rootBackground=await page.locator('.ripple-app').evaluate(el=>getComputedStyle(el).backgroundColor);
      if(rootBackground!=='rgb(255, 255, 255)') findings.push({size:size.id,kind:'not-light-after-migration',color:rootBackground});
    }
    await page.getByRole('button', { name: 'Retour à l’accueil' }).click();
    await page.locator('.ripple-booking-page').waitFor();
    console.log('VISUAL_QA ' + JSON.stringify({ id: size.id, ...result, pageErrors }));
    await context.close();
  }
  await writeFile(OUTPUT + '/findings.json', JSON.stringify({ findings }, null, 2));
  console.log('VISUAL_FINDINGS ' + JSON.stringify(findings));
  if (findings.some(x => ['v8-not-date-first','v8-calendar-months-missing','v8-premature-availability','v8-calendar-days-missing','v8-availability-misrepresented','v8-request-mail-incorrect','v8-booking-overflow','v7-frame-button-missing','v7-bottom-dock-not-fixed','v7-dock-overlaps-full-circle','v7-wrong-default-frame','v7-half-missing-crop','v7-quarter-zoom-invalid','v7-cycle-not-reversible','v7-doubleclick-framing-failed','v6-modebar-missing','v6-not-three-modes','v6-layers-open-at-rest','v6-verbose-inspector-still-shown','v6-details-open-at-rest', 'v6-settings-open-at-rest', 'v6-hidden-layers-visible', 'v6-hidden-controls-visible', 'console-errors', 'horizontal-overflow', 'orbit-control-clipped', 'dial-inspector-overlap', 'header-controls', 'navigation-failed', 'account-failed', 'hero-missing', 'scenario-10-failed', 'scenario-18-failed', 'repair-options-missing', 'repair-selection-failed', 'root-chain-missing', 'close-simulation-failed', 'v4-toolbar-missing', 'v4-indirect-graph-failed', 'v4-evidence-missing', 'v4-action-drafts-failed', 'v4-local-action-confirmation-failed', 'v4-replay-frames-failed', 'v4-replay-dial-unsynced', 'v4-replay-autoplay-failed', 'v4-close-replay-failed', 'night-option-still-visible', 'account-tabs-invalid', 'account-tabs-clipped', 'rsvp-selection-failed', 'journey-tab-missing', 'account-export-invalid', 'account-export-unreadable', 'account-reset-cancel-failed', 'account-reset-failed', 'legacy-night-migration-failed', 'not-light-after-migration', 'v5-back-face-still-present', 'v5-impact-portraits-missing', 'v5-context-portraits-missing', 'v5-person-focus-missing', 'v5-people-layer-portrait-missing', 'v5-directory-portraits-missing'].includes(x.kind))) {
    process.exitCode = 1;
  }
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
