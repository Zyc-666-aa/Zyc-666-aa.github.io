(() => {
  const baseUrl = new URL('.', document.currentScript.src);
  const assetVersion = '20261028-persona-v2';
  const trigger = document.getElementById('menuButton');
  const dialog = document.getElementById('albertVoiceDialog');
  const portfolio = document.getElementById('portfolioLayer');
  const status = document.getElementById('albertVoiceStatus');
  const close = document.getElementById('albertVoiceClose');
  if (!trigger || !dialog || !portfolio || !status || !close) return;

  const holdDuration = 3000;
  const moveTolerance = 16;
  let ready = false;
  let loading = null;
  let pendingOpen = false;
  let activePress = null;
  let holdTimer = 0;
  let suppressClick = false;
  let suppressTimer = 0;
  let loadingPageLocked = false;
  let previousPortfolioInert = false;
  let previousBodyOverflow = '';

  function beginHold(press) {
    if (activePress) return;
    activePress = press;
    trigger.classList.add('voice-holding');
    holdTimer = window.setTimeout(() => {
      if (activePress !== press || press.cancelled) return;
      press.triggered = true;
      if (press.kind === 'pointer') suppressClick = true;
      document.dispatchEvent(new CustomEvent('albertvoice:open'));
    }, holdDuration);
  }

  function finishHold() {
    const press = activePress;
    if (!press) return null;
    clearTimeout(holdTimer);
    holdTimer = 0;
    activePress = null;
    trigger.classList.remove('voice-holding');
    if (press.kind === 'pointer' && press.triggered) {
      suppressClick = true;
      clearTimeout(suppressTimer);
      suppressTimer = window.setTimeout(() => { suppressClick = false; }, 1000);
    }
    return press;
  }

  trigger.addEventListener('pointerdown', event => {
    if (event.isPrimary === false || event.button !== 0 || activePress) return;
    beginHold({ kind: 'pointer', id: event.pointerId, x: event.clientX, y: event.clientY, cancelled: false, triggered: false });
  }, true);
  trigger.addEventListener('pointermove', event => {
    const press = activePress;
    if (!press || press.kind !== 'pointer' || press.id !== event.pointerId || press.triggered) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > moveTolerance) {
      press.cancelled = true;
      clearTimeout(holdTimer);
      holdTimer = 0;
      trigger.classList.remove('voice-holding');
    }
  }, true);
  function finishPointer(event) {
    if (activePress?.kind === 'pointer' && activePress.id === event.pointerId) finishHold();
  }
  trigger.addEventListener('pointerup', finishPointer, true);
  trigger.addEventListener('pointercancel', finishPointer, true);
  trigger.addEventListener('lostpointercapture', event => {
    if (activePress?.kind === 'pointer' && activePress.id === event.pointerId && !activePress.triggered) finishHold();
  }, true);
  document.addEventListener('pointerup', finishPointer, true);
  document.addEventListener('pointercancel', finishPointer, true);
  trigger.addEventListener('contextmenu', event => {
    if (activePress?.kind === 'pointer') event.preventDefault();
  });
  trigger.addEventListener('click', event => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    suppressClick = false;
    clearTimeout(suppressTimer);
  }, true);

  trigger.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (event.repeat || activePress) return;
    beginHold({ kind: 'keyboard', key: event.key, cancelled: false, triggered: false });
  }, true);
  trigger.addEventListener('keyup', event => {
    const press = activePress;
    if (!press || press.kind !== 'keyboard' || press.key !== event.key) return;
    event.preventDefault();
    finishHold();
    if (!press.triggered && !press.cancelled) trigger.click();
  }, true);
  trigger.addEventListener('blur', () => {
    if (activePress?.kind === 'keyboard') finishHold();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finishHold();
  });
  window.addEventListener('blur', () => finishHold());

  function loadStyle() {
    if (document.querySelector('[data-albert-voice-style]')) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      const assetUrl = new URL('albert-voice.css', baseUrl);
      assetUrl.searchParams.set('v', assetVersion);
      link.href = assetUrl.href;
      link.dataset.albertVoiceStyle = 'true';
      link.onload = resolve;
      link.onerror = () => {
        link.remove();
        reject(new Error('Voice interface styles could not load.'));
      };
      document.head.appendChild(link);
    });
  }

  function loadScript(file) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const assetUrl = new URL(file, baseUrl);
      assetUrl.searchParams.set('v', assetVersion);
      script.src = assetUrl.href;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        script.remove();
        reject(new Error('Voice interface script could not load.'));
      };
      document.head.appendChild(script);
    });
  }

  function removeLoadingHandlers() {
    close.removeEventListener('click', closePending);
    dialog.removeEventListener('keydown', pendingKeydown);
  }

  function unlockLoadingPage() {
    if (!loadingPageLocked) return;
    portfolio.inert = previousPortfolioInert;
    document.body.style.overflow = previousBodyOverflow;
    loadingPageLocked = false;
  }

  function closePending() {
    pendingOpen = false;
    removeLoadingHandlers();
    dialog.hidden = true;
    dialog.removeAttribute('data-loading');
    dialog.removeAttribute('style');
    dialog.querySelector('.albert-voice-panel')?.removeAttribute('style');
    unlockLoadingPage();
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus({ preventScroll: true });
  }

  function pendingKeydown(event) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    closePending();
  }

  function showLoading() {
    const panel = dialog.querySelector('.albert-voice-panel');
    if (!panel) return;
    pendingOpen = true;
    previousPortfolioInert = portfolio.inert;
    previousBodyOverflow = document.body.style.overflow;
    portfolio.inert = true;
    document.body.style.overflow = 'hidden';
    loadingPageLocked = true;
    dialog.hidden = false;
    dialog.dataset.loading = 'true';
    dialog.style.cssText = 'position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:16px;background:rgba(2,6,12,.88)';
    panel.style.cssText = 'width:min(100%,560px);padding:28px;border:1px solid rgba(173,199,231,.25);border-radius:24px;background:#08111d;color:#edf3fa';
    status.textContent = '正在载入 Albert 语音界面。';
    trigger.setAttribute('aria-expanded', 'true');
    close.addEventListener('click', closePending);
    dialog.addEventListener('keydown', pendingKeydown);
    close.focus({ preventScroll: true });
  }

  function showLoadError() {
    if (!pendingOpen) return;
    status.textContent = '语音界面加载失败。关闭后可长按 3 秒重试，也可以继续浏览作品集。';
    close.focus({ preventScroll: true });
  }

  document.addEventListener('albertvoice:open', () => {
    if (ready) {
      document.dispatchEvent(new CustomEvent('albertvoice:open-ready'));
      return;
    }
    if (loading) return;
    showLoading();
    loading = Promise.all([
      loadStyle(),
      loadScript('albert-voice-persona.js'),
      loadScript('albert-voice-api.js')
    ]).then(() => loadScript('albert-voice.js'))
      .then(() => {
        ready = true;
        removeLoadingHandlers();
        unlockLoadingPage();
        if (pendingOpen) {
          pendingOpen = false;
          document.dispatchEvent(new CustomEvent('albertvoice:open-ready'));
        }
      })
      .catch(showLoadError)
      .finally(() => { loading = null; });
  });
})();
