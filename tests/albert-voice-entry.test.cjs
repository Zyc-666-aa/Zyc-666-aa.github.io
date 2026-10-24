const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const siteScript = readFileSync(path.join(root, 'lush-portfolio', 'LUSH-portfolio-preview_files', 'albert-voice.js'), 'utf8');
const liquidScript = readFileSync(path.join(root, 'lush-portfolio', 'LUSH-portfolio-preview_files', 'LUSH-liquid-candidate.js'), 'utf8');

for (const htmlPath of ['index.html', 'lush-portfolio/index.html']) {
  test(`${htmlPath} mounts Albert Voice inside the existing welcome orb`, () => {
    const html = readFileSync(path.join(root, htmlPath), 'utf8');
    assert.match(html, /albert-voice\.css\?v=20261024-orb-entry-v1/);
    assert.match(html, /albert-voice\.js\?v=20261024-orb-entry-v1/);
    assert.match(html, /LUSH-liquid-candidate\.js\?v=20261024-orb-voice-v1/);
    assert.match(html, /class="welcome-idle-hint"[^>]*>点击光球体验语音，上滑展开作品入口</);
    assert.match(html, /id="welcomeDome"[^>]*aria-label="点击光球体验语音，上滑展开作品入口"/);
    assert.match(html, /id="albertVoiceDialog"[^>]*role="dialog"/);
    assert.match(html, /id="enterButton"[^>]*>查看作品</);
  });
}

test('a tap or keyboard activation opens voice while drag still controls the portfolio orb', () => {
  const pointerUpStart = liquidScript.indexOf("welcomeDome.addEventListener('pointerup',()=>{");
  const pointerUpEnd = liquidScript.indexOf('});', pointerUpStart);
  assert.ok(pointerUpStart >= 0 && pointerUpEnd > pointerUpStart);
  const pointerUp = liquidScript.slice(pointerUpStart, pointerUpEnd);
  assert.match(pointerUp, /const tapped=!!motion\.drag&&!motion\.drag\.moved/);
  assert.match(pointerUp, /if\(tapped\)\{motion\.release\(performance\.now\(\),true\);document\.dispatchEvent\(new CustomEvent\('albertvoice:open'\)\);return;\}motion\.release\(performance\.now\(\)\)/);
  assert.match(liquidScript, /e\.key==='Enter'\|\|e\.key===' '/);
  assert.match(liquidScript, /motion\.release\(performance\.now\(\)\);/);
});

test('portfolio hints distinguish revealing the works entry from entering the portfolio', () => {
  assert.match(liquidScript, /向上拖动展开作品入口/);
  assert.match(liquidScript, /上滑展开作品入口/);
  assert.match(liquidScript, /使用查看作品按钮进入作品集/);
});

test('Mock responses are local, bounded, and do not request microphone or call a provider', () => {
  assert.match(siteScript, /function answerFor\(question\)/);
  assert.match(siteScript, /question\.trim\(\)\.slice\(0, 100\)/);
  assert.match(siteScript, /textContent = text/);
  assert.match(siteScript, /SpeechSynthesisUtterance/);
  assert.doesNotMatch(siteScript, /getUserMedia|SpeechRecognition|MediaRecorder|navigator\.mediaDevices|fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
});

test('the dialog supports close, Escape, focus restoration, and a bounded message list', () => {
  assert.match(siteScript, /event\.key === 'Escape'/);
  assert.match(siteScript, /focusTarget\.focus\(\)/);
  assert.match(siteScript, /while \(messages\.children\.length > 9\)/);
  assert.match(siteScript, /window\.speechSynthesis\.cancel\(\)/);
});
