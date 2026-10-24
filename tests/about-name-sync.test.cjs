const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const bundlePath = path.join(root, 'lush-portfolio', 'LUSH-portfolio-preview_files', 'LUSH-liquid-candidate.js');
const bundle = readFileSync(bundlePath, 'utf8');

for (const htmlPath of ['index.html', 'lush-portfolio/index.html']) {
  test(`${htmlPath} loads About-name data and three-state glass bundles`, () => {
    const html = readFileSync(path.join(root, htmlPath), 'utf8');
    assert.match(html, /LUSH-current-data\.js\?v=[^"']+/);
    assert.match(html, /LUSH-ocean-glass\.css\?v=20261019-wabi-welcome-v1/);
    assert.match(html, /LUSH-sheet-physics\.js\?v=20261013-detents-v3/);
    assert.match(html, /LUSH-ocean-glass\.js\?v=20261014-optical-model-v5/);
    assert.match(html, /LUSH-liquid-candidate\.js\?v=[^"']+/);
    assert.doesNotMatch(html, /LUSH-yuxiaobing-detail\.css/);
    assert.match(html, /LUSH-about-actions\.css\?v=[^"']+/);
  });
}

test('both website About templates show the resume name and Albert', () => {
  const views = [...bundle.matchAll(/function aboutView\(\)\{[^\r\n]*/g)].map(match => match[0]);
  assert.equal(views.length, 2, 'both website rendering variants must be checked');
  for (const view of views) {
    assert.match(view, /class="about-name">'\+escapeMarkup\(data\.resume\.name\)\+'<\/div>/);
    assert.match(view, /class="about-name-en">'\+escapeMarkup\(data\.resume\.english\)\+'<\/p>/);
    assert.match(view, /class="about-role">'\+data\.resume\.role\+'<\/p>/);
  }
});

test('website Bottom Sheet mounts and routes open and close through the three-state controller', () => {
  assert.match(bundle, /const oceanSheet=window\.LushOceanGlass\?\.mount\(/);
  assert.match(bundle, /renderMenu\(\);if\(oceanSheet\)oceanSheet\.open\(\)/);
  assert.match(bundle, /if\(oceanSheet\)oceanSheet\.close\(finish\)/);
  assert.match(bundle, /if\(!oceanSheet\)\{\$\('#menuSheet'\)\.addEventListener\('pointerdown'/);
  assert.match(bundle, /function closeInfo\(afterClose\)\{closeMenu\(\(\)=>\{renderMenu\(\)/);
});
