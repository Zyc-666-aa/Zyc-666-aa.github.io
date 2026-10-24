(() => {
  const dialog = document.getElementById('albertVoiceDialog');
  const dome = document.getElementById('welcomeDome');
  const closeButton = document.getElementById('albertVoiceClose');
  const form = document.getElementById('albertVoiceForm');
  const input = document.getElementById('albertVoiceInput');
  const messages = document.getElementById('albertVoiceMessages');
  const status = document.getElementById('albertVoiceStatus');
  if (!dialog || !dome || !closeButton || !form || !input || !messages || !status) return;

  let lastAssistantText = messages.querySelector('.is-assistant p')?.textContent || '';
  let previousFocus = null;

  function openDialog() {
    if (!dialog.hidden) return;
    previousFocus = document.activeElement;
    dialog.hidden = false;
    dome.setAttribute('aria-expanded', 'true');
    closeButton.focus();
  }

  function closeDialog() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    dome.setAttribute('aria-expanded', 'false');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const focusTarget = previousFocus && previousFocus.isConnected ? previousFocus : dome;
    focusTarget.focus();
  }

  function appendMessage(kind, text, speakable = false) {
    const article = document.createElement('article');
    article.className = `albert-voice-message ${kind === 'user' ? 'is-user' : 'is-assistant'}`;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    article.appendChild(paragraph);
    if (speakable) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'albert-voice-speak';
      button.textContent = '播放语音';
      button.addEventListener('click', () => speak(text));
      article.appendChild(button);
    }
    messages.appendChild(article);
    while (messages.children.length > 9) messages.firstElementChild.remove();
    messages.scrollTop = messages.scrollHeight;
  }

  function answerFor(question) {
    const text = question.toLowerCase();
    if (/你是谁|介绍|albert|阿尔伯特/.test(text)) {
      return '我是 Albert 的作品集语音演示。这里展示服装设计、视觉创作，以及我对 AI 与设计的兴趣。';
    }
    if (/作品|设计|服装|作品集/.test(text)) {
      return '我的作品集围绕服装设计、视觉表达和交互原型展开。点击查看作品，可以继续浏览项目。';
    }
    if (/ai|人工智能|模型/.test(text)) {
      return '我喜欢探索 AI 与设计的结合。目前这个页面使用预设回复，还没有连接真实 AI 模型。';
    }
    return '收到你的问题了。这是零 API 的 Mock 演示，目前只使用预设回复；可以问我关于设计、作品集或 AI 的问题。';
  }

  function speak(text) {
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== 'function') {
      status.textContent = '当前设备不支持浏览器语音朗读，仍可阅读文字回复。';
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text.slice(0, 100));
    utterance.lang = 'zh-CN';
    utterance.rate = 0.98;
    utterance.onstart = () => {
      status.textContent = '正在使用当前浏览器或设备朗读。具体音色与处理方式由设备系统决定。';
    };
    utterance.onend = () => {
      status.textContent = '问题只在当前页面内存处理，不向 4zyc 后端发送。朗读音色与处理方式由设备系统决定。';
    };
    utterance.onerror = () => {
      status.textContent = '设备语音朗读暂不可用，仍可阅读文字回复。';
    };
    window.speechSynthesis.speak(utterance);
  }

  function submitQuestion(question, shouldSpeak = true) {
    const normalized = question.trim().slice(0, 100);
    if (!normalized) return;
    appendMessage('user', normalized);
    lastAssistantText = answerFor(normalized);
    appendMessage('assistant', lastAssistantText, true);
    if (shouldSpeak) speak(lastAssistantText);
  }

  document.addEventListener('albertvoice:open', openDialog);
  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const question = input.value;
    if (!question.trim()) {
      input.focus();
      return;
    }
    submitQuestion(question);
    input.value = '';
    input.focus();
  });
  dialog.querySelectorAll('[data-prompt]').forEach(button => {
    button.addEventListener('click', () => submitQuestion(button.dataset.prompt || ''));
  });
  dialog.querySelectorAll('[data-speak-current]').forEach(button => {
    button.addEventListener('click', () => speak(lastAssistantText));
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.speechSynthesis) window.speechSynthesis.cancel();
  });
})();
