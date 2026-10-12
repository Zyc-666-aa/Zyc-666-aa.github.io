const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const bundlePath = path.join(root, 'lush-portfolio', 'LUSH-portfolio-preview_files', 'LUSH-liquid-candidate.js');
const bundle = readFileSync(bundlePath, 'utf8');

for (const htmlPath of ['index.html', 'lush-portfolio/index.html']) {
  test(`${htmlPath} loads matching About-name data and view bundles`, () => {
    const html = readFileSync(path.join(root, htmlPath), 'utf8');
    assert.match(html, /LUSH-current-data\.js\?v=20261012-about-name-v1/);
    assert.match(html, /LUSH-liquid-candidate\.js\?v=20261012-about-name-v1/);
  });
}

test('both website About templates show the resume name and Albert', () => {
  const views = [...bundle.matchAll(/function aboutView\(\)\{[^\r\n]*/g)].map(match => match[0]);
  assert.equal(views.length, 2, 'both website rendering variants must be checked');
  for (const view of views) {
    assert.match(view, /class="about-name">'\+escapeMarkup\(data\.resume\.name\)\+' \/ Albert<\/div>/);
    assert.match(view, /class="about-role">'\+data\.resume\.role\+'<\/p>/);
  }
});
