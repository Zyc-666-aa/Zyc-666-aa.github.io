(() => {
  let base = '';
  let configuration = null;

  function configuredBase() {
    const value = document.querySelector('meta[name="albert-voice-api"]')?.content.trim();
    if (!value) return '';
    const url = new URL(value, document.baseURI);
    const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    if (url.username || url.password || url.search || url.hash ||
        (url.protocol !== 'https:' && !(url.protocol === 'http:' && local))) {
      throw new Error('语音服务地址无效。');
    }
    return url.href.replace(/\/+$/, '');
  }

  async function request(path, options = {}) {
    if (!base) throw new Error('语音服务尚未配置。');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const response = await fetch(base + path, {
        credentials: 'include',
        cache: 'no-store',
        redirect: 'error',
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        signal: controller.signal,
      });
      let body = {};
      try { body = await response.json(); } catch (_) { /* Treat malformed responses as failures. */ }
      if (!response.ok) throw new Error(body.message || '语音服务请求未完成。');
      return body;
    } finally {
      clearTimeout(timer);
    }
  }

  function validPrivacyUrl(value) {
    try { return new URL(value).protocol === 'https:'; } catch (_) { return false; }
  }

  async function initialize() {
    base = configuredBase();
    if (!base) {
      configuration = { mode: 'local-mock', aiCallsEnabled: false, microphoneEnabled: false };
      return configuration;
    }
    const config = await request('/api/config');
    if (!['mock', 'admin', 'public', 'local-admin'].includes(config.mode)) throw new Error('语音服务配置无效。');
    if (config.mode === 'local-admin') {
      const serviceUrl = new URL(base);
      const pageUrl = new URL(document.baseURI);
      if (serviceUrl.hostname !== '127.0.0.1' || serviceUrl.protocol !== 'http:' || serviceUrl.origin !== pageUrl.origin) {
        throw new Error('本机测试服务地址无效。');
      }
    }
    if (['public', 'local-admin'].includes(config.mode) && config.aiCallsEnabled === true &&
        (!config.aiDisclosure || !validPrivacyUrl(config.aiPrivacyPolicyUrl) || !validPrivacyUrl(config.ttsPrivacyPolicyUrl))) {
      throw new Error('AI 服务说明尚未完整配置。');
    }
    if (config.microphoneEnabled === true &&
        (!config.microphoneDisclosure || !validPrivacyUrl(config.audioPrivacyPolicyUrl))) {
      throw new Error('录音处理说明尚未完整配置。');
    }
    await request('/api/guest', { method: 'POST', body: '{}' });
    configuration = config;
    return configuration;
  }

  function requestId() {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID().replace(/-/g, '');
    if (typeof crypto.getRandomValues !== 'function') throw new Error('当前浏览器无法安全生成请求编号。');
    return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async function ask(input, consent = {}) {
    if (!configuration || configuration.mode === 'admin') throw new Error('当前网页未开放真实模型调用。');
    if (configuration.mode === 'mock') {
      return request('/api/voice', { method: 'POST', body: JSON.stringify({ text: input.text || '' }) });
    }
    if (!['public', 'local-admin'].includes(configuration.mode) || configuration.aiCallsEnabled !== true || consent.ai !== true) {
      throw new Error('请先阅读并同意 AI 服务说明。');
    }
    if (input.audioBase64 && (configuration.microphoneEnabled !== true || consent.audio !== true)) {
      throw new Error('请先阅读并同意录音处理说明。');
    }
    const id = requestId();
    return request('/api/voice', {
      method: 'POST',
      headers: { 'Idempotency-Key': id },
      body: JSON.stringify({
        ...input,
        requestId: id,
        aiConsentAccepted: true,
        audioConsentAccepted: Boolean(input.audioBase64 && consent.audio),
      }),
    });
  }

  async function pair() {
    if (!configuration || configuration.mode !== 'public' || !configuration.miniProgramPublicEnabled) {
      throw new Error('微信额度绑定尚未启用。');
    }
    return request('/api/pair/start', { method: 'POST', body: '{}' });
  }

  async function usage() {
    if (!configuration || configuration.mode !== 'local-admin') throw new Error('本机管理接口不可用。');
    return request('/api/local/usage', { method: 'POST', body: '{}' });
  }

  async function setBudget(stopCny) {
    if (!configuration || configuration.mode !== 'local-admin') throw new Error('本机管理接口不可用。');
    return request('/api/local/budget', { method: 'POST', body: JSON.stringify({ stopCny }) });
  }

  function recordingSeconds(startedAt, stoppedAt) {
    const elapsed = stoppedAt - startedAt;
    if (!Number.isFinite(elapsed) || elapsed <= 0 || elapsed > 20000) throw new Error('录音超过 20 秒或时长无效，已丢弃，请重新录制。');
    return Math.ceil(elapsed / 1000);
  }

  window.AlbertVoiceAPI = Object.freeze({ initialize, ask, pair, usage, setBudget, recordingSeconds });
})();
