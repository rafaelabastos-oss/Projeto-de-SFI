// Converte SVGs em PNG com o Chromium do Playwright
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const files = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1.6 });
  for (const f of files) {
    const svg = fs.readFileSync(f, 'utf8');
    const m = svg.match(/width="(\d+)" height="(\d+)"/);
    const w = +m[1], h = +m[2];
    await page.setViewportSize({ width: Math.ceil(w), height: Math.ceil(h) });
    await page.setContent(`<html><body style="margin:0;background:#fff">${svg}</body></html>`);
    await page.screenshot({ path: f.replace(/\.svg$/, '.png'), clip: { x: 0, y: 0, width: w, height: h } });
  }
  await browser.close();
})();
