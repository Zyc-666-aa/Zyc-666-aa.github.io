(() => {
  const dialog = document.getElementById('albertVoiceDialog');
  const trigger = document.getElementById('menuButton');
  const portfolio = document.getElementById('portfolioLayer');
  const panel = dialog?.querySelector('.albert-voice-panel');
  const visual = document.getElementById('albertVoiceVisual');
  const closeButton = document.getElementById('albertVoiceClose');
  const form = document.getElementById('albertVoiceForm');
  const input = document.getElementById('albertVoiceInput');
  const messages = document.getElementById('albertVoiceMessages');
  const status = document.getElementById('albertVoiceStatus');
  const stateLabel = document.getElementById('albertVoiceStateLabel');
  const latestText = document.getElementById('albertVoiceLatestText');
  const speakButton = document.getElementById('albertVoiceSpeakCurrent');
  const stopSpeakButton = document.getElementById('albertVoiceStopSpeaking');
  const micButton = document.getElementById('albertVoiceMic');
  const micNote = document.getElementById('albertVoiceMicNote');
  const meterFill = document.getElementById('albertVoiceMeterFill');
  const meterReading = document.getElementById('albertVoiceMeterReading');
  const history = document.getElementById('albertVoiceHistory');
  const historyCount = document.getElementById('albertVoiceHistoryCount');
  const historyEmpty = document.getElementById('albertVoiceHistoryEmpty');
  const openPortfolioButton = document.getElementById('albertVoiceOpenPortfolio');
  const identityLabel = document.getElementById('albertVoiceIdentityLabel');
  const footnote = document.getElementById('albertVoiceFootnote');
  const aiPanel = document.getElementById('albertVoiceAiConsent');
  const aiCheck = document.getElementById('albertVoiceAiConsentCheck');
  const audioPanel = document.getElementById('albertVoiceAudioConsent');
  const audioCheck = document.getElementById('albertVoiceAudioConsentCheck');
  const adminPanel = document.getElementById('albertVoiceAdmin');
  const usageButton = document.getElementById('albertVoiceUsage');
  const usageOutput = document.getElementById('albertVoiceUsageOutput');
  const budgetInput = document.getElementById('albertVoiceBudget');
  const budgetButton = document.getElementById('albertVoiceBudgetApply');
  const budgetOutput = document.getElementById('albertVoiceBudgetOutput');
  const pairPanel = document.getElementById('albertVoicePair');
  const pairButton = document.getElementById('albertVoicePairButton');
  const pairCode = document.getElementById('albertVoicePairCode');
  const services = document.getElementById('albertVoiceServices');
  const openingText = '想聊什么？设计、作品或者 AI 都可以。';
  const liveOpeningText = '想聊什么？设计、作品或者 AI 都可以。';

  if (!dialog || !trigger || !portfolio || !panel || !visual || !closeButton || !form || !input || !messages || !status || !stateLabel || !latestText || !speakButton || !stopSpeakButton || !micButton || !micNote || !meterFill || !meterReading || !history || !historyCount || !historyEmpty || !openPortfolioButton || !identityLabel || !footnote || !services || !aiPanel || !aiCheck || !audioPanel || !audioCheck || !adminPanel || !usageButton || !usageOutput || !budgetInput || !budgetButton || !budgetOutput || !pairPanel || !pairButton || !pairCode || !window.AlbertVoicePersona?.answerFor || !window.AlbertVoiceAPI) return;

  const labels = { idle: '待机', recording: '录音中', thinking: '思考中', speaking: '播放中', error: '需处理' };
  const messageAudio = new WeakMap();
  let config = { mode: 'local-mock' };
  let apiInitialized = false;
  let apiInitializing = false;
  let responsePending = false;
  let conversationEpoch = 0;
  let previousBodyOverflow = '';
  let previousPortfolioInert = false;
  let activeStream = null;
  let audioContext = null;
  let analyser = null;
  let sourceNode = null;
  let meterFrame = 0;
  let meterSamples = null;
  let lastMeterFrameAt = 0;
  let microphoneLimitTimer = 0;
  let microphoneGeneration = 0;
  let recording = null;
  let preparingAudio = false;
  let microphoneStarting = false;
  let playback = null;
  let playbackGeneration = 0;
  let latestAudio = null;
  let responseFrame = 0;

  function setState(next, message) {
    panel.dataset.state = next;
    visual.dataset.state = next;
    stateLabel.textContent = labels[next] || labels.idle;
    visual.setAttribute('aria-label', 'Albert 语音主体，当前' + (labels[next] || labels.idle));
    status.textContent = message;
  }

  function updateViewport() {
    if (dialog.hidden || !window.visualViewport) return;
    dialog.style.setProperty('--voice-viewport-height', Math.max(260, window.visualViewport.height) + 'px');
    dialog.style.setProperty('--voice-viewport-top', Math.max(0, window.visualViewport.offsetTop) + 'px');
  }

  function publicMode() {
    return ['public', 'local-admin'].includes(config.mode) && config.aiCallsEnabled === true;
  }

  function recordingMimeType() {
    const Recorder = window.MediaRecorder;
    if (typeof Recorder !== 'function' || typeof Recorder.isTypeSupported !== 'function') return '';
    return ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/wav']
      .find(type => Recorder.isTypeSupported(type)) || '';
  }

  function remoteRecordingAvailable() {
    return publicMode() && config.microphoneEnabled === true && Boolean(recordingMimeType());
  }

  function setBusy() {
    const busy = apiInitializing || responsePending || preparingAudio || microphoneStarting;
    const submit = form.querySelector('button[type="submit"]');
    if (submit) submit.disabled = busy;
    dialog.querySelectorAll('[data-prompt]').forEach(button => { button.disabled = busy; });
    micButton.disabled = busy && !activeStream;
  }

  function renderConfiguration() {
    const isPublic = publicMode();
    if (!messages.children.length) latestText.textContent = isPublic ? liveOpeningText : openingText;
    aiPanel.hidden = !isPublic;
    audioPanel.hidden = !(isPublic && config.microphoneEnabled === true);
    pairPanel.hidden = !(isPublic && config.miniProgramPublicEnabled === true);
    adminPanel.hidden = !(isPublic && config.mode === 'local-admin');
    identityLabel.textContent = isPublic ? 'AI 语音' : '语音对话';
    if (isPublic) {
      document.getElementById('albertVoiceAiDisclosure').textContent = config.aiDisclosure;
      document.getElementById('albertVoiceAiPrivacy').href = config.aiPrivacyPolicyUrl;
      document.getElementById('albertVoiceTtsPrivacy').href = config.ttsPrivacyPolicyUrl;
      if (!audioPanel.hidden) {
        document.getElementById('albertVoiceAudioDisclosure').textContent = config.microphoneDisclosure;
        document.getElementById('albertVoiceAudioPrivacy').href = config.audioPrivacyPolicyUrl;
      }
      footnote.textContent = '回答由 AI 生成，语音为 AI 合成。';
    } else {
      footnote.textContent = '当前是本地 Mock 版本，尚未接入真实 AI 或语音服务。';
    }
    if (!activeStream) {
      micButton.textContent = remoteRecordingAvailable() ? '开始说话' : '体验麦克风';
      micNote.textContent = remoteRecordingAvailable()
        ? '录音最长 20 秒，提交后识别为文字。'
        : publicMode() && config.microphoneEnabled === true
          ? '浏览器暂不支持语音识别，请改用文字。'
          : '仅本地音量可视化，不会保存或上传声音。';
    }
  }

  function initializeApi() {
    if (apiInitialized || apiInitializing) return;
    apiInitializing = true;
    setBusy();
    if (!dialog.hidden) setState('thinking', '正在检查语音服务配置。');
    window.AlbertVoiceAPI.initialize().then(value => {
      config = value;
      apiInitialized = true;
      renderConfiguration();
      if (!dialog.hidden && !responsePending) {
        setState('idle', publicMode()
          ? '阅读服务说明后开始。'
          : config.mode === 'admin'
            ? '管理员测试模式。'
            : '可直接提问。');
      }
    }).catch(() => {
      config = { mode: 'local-mock' };
      renderConfiguration();
      if (!dialog.hidden && !responsePending) setState('error', '语音服务暂不可用，当前使用本地预设；关闭后可重试连接。');
    }).finally(() => {
      apiInitializing = false;
      setBusy();
    });
  }

  function stopSpeech(updateState = false) {
    playbackGeneration += 1;
    const current = playback;
    playback = null;
    stopSpeakButton.hidden = true;
    if (current) {
      cancelAnimationFrame(current.frame);
      current.audio.pause();
      current.audio.src = '';
      if (current.context && current.context.state !== 'closed') current.context.close().catch(() => {});
      URL.revokeObjectURL(current.url);
    }
    panel.style.setProperty('--voice-level-scale', '1');
    meterFill.style.width = '0';
    if (updateState && !dialog.hidden) setState('idle', '播放已停止，回答文字仍可查看。');
  }

  function drawLevel(meter, samples, caption, onFrame) {
    if (!meter || dialog.hidden) return;
    const now = performance.now();
    if (now - lastMeterFrameAt >= 33) {
      meter.getByteTimeDomainData(samples);
      let total = 0;
      for (const value of samples) {
        const centered = (value - 128) / 128;
        total += centered * centered;
      }
      const level = Math.max(0, Math.min(1, (Math.sqrt(total / samples.length) - .006) * 4.6));
      panel.style.setProperty('--voice-level-scale', (1 + level * .13).toFixed(3));
      meterFill.style.width = Math.round(level * 100) + '%';
      meterReading.textContent = caption + Math.round(level * 100) + '%';
      lastMeterFrameAt = now;
    }
    onFrame(requestAnimationFrame(() => drawLevel(meter, samples, caption, onFrame)));
  }

  function validAudio(audio) {
    return Boolean(audio && audio.synthetic === true && typeof audio.base64 === 'string' &&
      audio.base64.length > 0 && audio.base64.length <= 2000000 &&
      /^[A-Za-z0-9+/]*={0,2}$/.test(audio.base64) &&
      ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'].includes(audio.mimeType));
  }

  async function playAudio(audioData) {
    if (!validAudio(audioData)) return;
    if (activeStream || recording) stopMicrophone(false);
    stopSpeech();
    const currentGeneration = playbackGeneration;
    try {
      const bytes = Uint8Array.from(atob(audioData.base64), character => character.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: audioData.mimeType }));
      const audio = new Audio(url);
      const state = { audio, url, context: null, analyser: null, frame: 0 };
      playback = state;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        try {
          state.context = new AudioContextClass();
          const source = state.context.createMediaElementSource(audio);
          state.analyser = state.context.createAnalyser();
          state.analyser.fftSize = 256;
          source.connect(state.analyser);
          state.analyser.connect(state.context.destination);
          if (state.context.state === 'suspended') {
            await Promise.race([state.context.resume(), new Promise((_, reject) => setTimeout(() => reject(new Error('Audio activation timed out')), 1000))]);
            if (state.context.state !== 'running') throw new Error('Audio context is not running');
          }
        } catch (error) {
          if (state.context && state.context.state !== 'closed') state.context.close().catch(() => {});
          if (state.analyser) throw error;
          state.context = null;
          state.analyser = null;
        }
      }
      if (currentGeneration !== playbackGeneration || dialog.hidden) { stopSpeech(); return; }
      audio.onplaying = () => {
        if (currentGeneration !== playbackGeneration || dialog.hidden) return;
        stopSpeakButton.hidden = false;
        setState('speaking', state.analyser ? '正在播放 AI 合成语音，声波跟随播放音量。' : '正在播放 AI 合成语音；当前浏览器无法显示播放音量。');
        if (state.analyser) {
          lastMeterFrameAt = 0;
          const samples = new Uint8Array(state.analyser.fftSize);
          drawLevel(state.analyser, samples, '播放音量约 ', frame => { state.frame = frame; });
        }
      };
      audio.onended = () => {
        if (currentGeneration !== playbackGeneration || dialog.hidden) return;
        stopSpeech();
        setState('idle', 'AI 语音已播放完毕。');
      };
      audio.onerror = () => {
        if (currentGeneration !== playbackGeneration || dialog.hidden) return;
        stopSpeech();
        setState('error', '语音播放失败，可以再次点击播放。');
      };
      await audio.play();
    } catch (_) {
      if (currentGeneration !== playbackGeneration || dialog.hidden) return;
      stopSpeech();
      setState('error', '浏览器未开始播放，请点击“播放 AI 语音”重试。');
    }
  }

  function closeAudioResources() {
    cancelAnimationFrame(meterFrame);
    meterFrame = 0;
    clearTimeout(microphoneLimitTimer);
    microphoneLimitTimer = 0;
    if (sourceNode) {
      try { sourceNode.disconnect(); } catch (_) { /* The audio graph may already be closed. */ }
    }
    sourceNode = null;
    analyser = null;
    meterSamples = null;
    lastMeterFrameAt = 0;
    if (activeStream) activeStream.getTracks().forEach(track => track.stop());
    activeStream = null;
    if (audioContext && audioContext.state !== 'closed') audioContext.close().catch(() => {});
    audioContext = null;
    panel.style.setProperty('--voice-level-scale', '1');
    meterFill.style.width = '0';
    micButton.setAttribute('aria-pressed', 'false');
    meterReading.textContent = '麦克风未开启';
    renderConfiguration();
    setBusy();
  }

  function stopMicrophone(send = false, message = '') {
    microphoneGeneration += 1;
    microphoneStarting = false;
    const capture = recording;
    if (capture) {
      capture.discard = !send;
      preparingAudio = Boolean(send);
      capture.stoppedAt = performance.now();
      if (capture.recorder.state !== 'inactive') capture.recorder.stop();
    }
    closeAudioResources();
    if (!dialog.hidden && message) setState(send ? 'thinking' : 'idle', message);
  }

  function closeDialog() {
    if (dialog.hidden) return;
    conversationEpoch += 1;
    if (responseFrame) {
      cancelAnimationFrame(responseFrame);
      responseFrame = 0;
      responsePending = false;
    }
    stopSpeech();
    stopMicrophone(false);
    dialog.hidden = true;
    dialog.style.removeProperty('--voice-viewport-height');
    dialog.style.removeProperty('--voice-viewport-top');
    trigger.setAttribute('aria-expanded', 'false');
    portfolio.inert = previousPortfolioInert;
    document.body.style.overflow = previousBodyOverflow;
    trigger.focus({ preventScroll: true });
  }

  function openDialog() {
    if (!dialog.hidden && !dialog.hasAttribute('data-loading')) return;
    previousBodyOverflow = document.body.style.overflow;
    previousPortfolioInert = portfolio.inert;
    portfolio.inert = true;
    document.body.style.overflow = 'hidden';
    dialog.removeAttribute('data-loading');
    dialog.removeAttribute('style');
    panel.removeAttribute('style');
    dialog.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    setState('idle', responsePending ? '上一请求仍在处理中。' : '可以先提问。');
    setBusy();
    updateViewport();
    closeButton.focus({ preventScroll: true });
    initializeApi();
  }

  function updateHistory() {
    historyCount.textContent = String(Math.floor(messages.children.length / 2));
    history.hidden = messages.children.length === 0;
    historyEmpty.hidden = messages.children.length > 0;
  }

  function appendMessage(kind, text) {
    const article = document.createElement('article');
    article.className = 'albert-voice-message ' + (kind === 'user' ? 'is-user' : 'is-assistant');
    const label = document.createElement('span');
    label.className = 'albert-voice-message-label';
    label.textContent = kind === 'user' ? 'YOU' : publicMode() ? 'ALBERT / AI' : 'ALBERT';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    article.append(label, paragraph);
    if (kind === 'assistant') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'albert-voice-text-action';
      button.textContent = '播放 AI 语音';
      button.hidden = true;
      button.addEventListener('click', () => playAudio(messageAudio.get(paragraph)));
      article.appendChild(button);
    }
    messages.appendChild(article);
    while (messages.children.length > 10) {
      messages.firstElementChild.remove();
      if (messages.firstElementChild) messages.firstElementChild.remove();
    }
    updateHistory();
    return paragraph;
  }

  function attachAudio(paragraph, audio) {
    latestAudio = validAudio(audio) ? audio : null;
    speakButton.hidden = !latestAudio;
    if (latestAudio) messageAudio.set(paragraph, latestAudio);
    const button = paragraph.parentElement.querySelector('button');
    if (button) button.hidden = !latestAudio;
  }

  function finishResponse(answer, historyParagraph, audio) {
    responseFrame = 0;
    historyParagraph.textContent = answer;
    latestText.textContent = answer;
    attachAudio(historyParagraph, audio);
    responsePending = false;
    setBusy();
    if (latestAudio) playAudio(latestAudio);
    else setState('idle', '回答整理好了，可以继续聊。');
  }

  function revealAnswer(answer, historyParagraph, audio) {
    const characters = Array.from(answer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishResponse(answer, historyParagraph, audio);
      return;
    }
    let shown = 0;
    let lastTick = 0;
    function tick(now) {
      if (dialog.hidden) return;
      if (now - lastTick >= 24) {
        shown = Math.min(characters.length, shown + 2);
        const text = characters.slice(0, shown).join('');
        latestText.textContent = text;
        historyParagraph.textContent = text;
        lastTick = now;
      }
      if (shown < characters.length) responseFrame = requestAnimationFrame(tick);
      else finishResponse(answer, historyParagraph, audio);
    }
    responseFrame = requestAnimationFrame(tick);
  }

  function consentReady(needsAudio) {
    if (!publicMode()) return true;
    if (needsAudio && !audioCheck.checked) {
      setState('error', '请先阅读并同意录音处理说明。');
      revealServiceConsent(audioCheck);
      return false;
    }
    if (!aiCheck.checked) {
      setState('error', '请先阅读并同意 AI 服务说明。');
      revealServiceConsent(aiCheck);
      return false;
    }
    return true;
  }

  function revealServiceConsent(control) {
    services.open = true;
    control.focus({ preventScroll: true });
    control.scrollIntoView?.({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  async function submitRequest(payload, displayQuestion) {
    if (responsePending || apiInitializing || microphoneStarting || !consentReady(Boolean(payload.audioBase64))) return;
    stopSpeech();
    responsePending = true;
    setBusy();
    const epoch = conversationEpoch;
    panel.classList.add('has-conversation');
    const userParagraph = appendMessage('user', displayQuestion);
    const answerParagraph = appendMessage('assistant', '');
    latestAudio = null;
    speakButton.hidden = true;
    latestText.textContent = '';
    openPortfolioButton.hidden = !/(作品|设计|服装)/.test(displayQuestion);
    setState('thinking', publicMode() ? '正在提交本次请求，不会自动重复调用。' : '我整理一下。');
    try {
      let result;
      if (publicMode()) {
        result = await window.AlbertVoiceAPI.ask(payload, { ai: aiCheck.checked, audio: audioCheck.checked });
      } else {
        result = { answer: window.AlbertVoicePersona.answerFor(payload.text || ''), audio: null };
      }
      if (epoch !== conversationEpoch || dialog.hidden) return;
      if (payload.audioBase64 && result.transcript) userParagraph.textContent = String(result.transcript).slice(0, 100);
      const answer = Array.from(String(result.answer || '').trim()).slice(0, 100).join('');
      if (!answer) throw new Error('没有收到可显示的回答。');
      if (typeof result.roundsRemaining === 'number') {
        footnote.textContent = 'AI 合成语音。当前身份剩余体验次数：' + result.roundsRemaining + '。';
      }
      revealAnswer(answer, answerParagraph, result.audio);
      return;
    } catch (error) {
      if (epoch !== conversationEpoch || dialog.hidden) return;
      const message = (error?.message || '请求未完成。') + ' 本次不会自动重试。';
      answerParagraph.textContent = message;
      latestText.textContent = message;
      setState('error', message);
    } finally {
      if (epoch !== conversationEpoch || dialog.hidden || panel.dataset.state === 'error') {
        responsePending = false;
        setBusy();
        if (epoch !== conversationEpoch && !dialog.hidden && !apiInitializing) {
          setState('idle', '上一请求已结束，可以继续对话。');
        }
      }
    }
  }

  function submitQuestion(question) {
    const normalized = Array.from(String(question || '').trim()).slice(0, 100).join('');
    if (!normalized || responsePending || apiInitializing || preparingAudio || microphoneStarting || !consentReady(false)) return false;
    if (activeStream || recording) stopMicrophone(false, '麦克风已关闭，可以继续文字对话。');
    submitRequest({ text: normalized }, normalized);
    return true;
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(new Error('录音读取失败。'));
      reader.readAsDataURL(blob);
    });
  }

  async function startMicrophone() {
    if (responsePending || apiInitializing || preparingAudio || microphoneStarting || !consentReady(remoteRecordingAvailable())) return;
    stopSpeech();
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('error', '当前环境没有可用的麦克风接口。可以直接使用文字输入。');
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      setState('error', '当前浏览器不支持本地音量分析。可以直接使用文字输入。');
      return;
    }
    const currentGeneration = ++microphoneGeneration;
    microphoneStarting = true;
    setBusy();
    let stream = null;
    let context = null;
    micButton.disabled = true;
    meterReading.textContent = '等待麦克风授权';
    setState('idle', '请在浏览器提示中选择麦克风权限。');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
      if (currentGeneration !== microphoneGeneration || dialog.hidden) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      activeStream = stream;
      context = new AudioContextClass();
      audioContext = context;
      if (context.state === 'suspended') await Promise.race([context.resume(), new Promise((_, reject) => setTimeout(() => reject(new Error('Audio activation timed out')), 1500))]);
      if (currentGeneration !== microphoneGeneration || dialog.hidden) {
        if (activeStream === stream) closeAudioResources();
        else {
          stream.getTracks().forEach(track => track.stop());
          if (context.state !== 'closed') context.close().catch(() => {});
        }
        return;
      }
      const meter = context.createAnalyser();
      meter.fftSize = 256;
      meter.smoothingTimeConstant = .72;
      const source = context.createMediaStreamSource(stream);
      source.connect(meter);
      analyser = meter;
      sourceNode = source;
      meterSamples = new Uint8Array(meter.fftSize);
      micButton.setAttribute('aria-pressed', 'true');
      if (remoteRecordingAvailable()) {
        const recorder = new window.MediaRecorder(stream, { mimeType: recordingMimeType() });
        const capture = { recorder, chunks: [], discard: false, startedAt: performance.now(), stoppedAt: 0, epoch: conversationEpoch };
        recording = capture;
        recorder.ondataavailable = event => { if (event.data && event.data.size) capture.chunks.push(event.data); };
        recorder.onstop = async () => {
          if (recording === capture) recording = null;
          const chunks = capture.chunks;
          capture.chunks = [];
          if (capture.discard || dialog.hidden || capture.epoch !== conversationEpoch) {
            preparingAudio = false;
            setBusy();
            return;
          }
          try {
            if (!consentReady(true)) return;
            const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
            if (!blob.size || blob.size > 1500000) throw new Error('录音为空或超过 1.5 MB。');
            const mimeType = blob.type.split(';')[0];
            const seconds = window.AlbertVoiceAPI.recordingSeconds(capture.startedAt, capture.stoppedAt);
            const base64 = await blobToBase64(blob);
            if (capture.epoch !== conversationEpoch || dialog.hidden) return;
            preparingAudio = false;
            await submitRequest({ audioBase64: base64, audioMime: mimeType, durationSeconds: seconds }, '语音提问');
          } catch (error) {
            if (!dialog.hidden) setState('error', (error?.message || '录音未完成。') + ' 可以改用文字输入。');
          } finally {
            preparingAudio = false;
            setBusy();
          }
        };
        recorder.start(250);
        micButton.textContent = '停止并发送';
        setState('recording', '正在录音；停止后会按已同意的说明发送，最长 20 秒。');
      } else {
        micButton.textContent = '结束体验';
        setState('recording', '正在本地读取麦克风音量，不录制或上传声音。');
      }
      lastMeterFrameAt = 0;
      drawLevel(analyser, meterSamples, '本地麦克风音量约 ', frame => { meterFrame = frame; });
      microphoneLimitTimer = window.setTimeout(() => {
        stopMicrophone(Boolean(recording), recording ? '录音已结束，正在准备提交。' : '20 秒体验时间已结束，声音没有被保存或上传。');
      }, 19000);
      stream.getAudioTracks().forEach(track => track.addEventListener('ended', () => {
        if (activeStream === stream) {
          stopMicrophone(false);
          if (!dialog.hidden) setState('error', '麦克风已断开。可以重新尝试，或改用文字输入。');
        }
      }, { once: true }));
    } catch (error) {
      if (activeStream === stream && stream) {
        if (recording) {
          recording.discard = true;
          if (recording.recorder.state !== 'inactive') recording.recorder.stop();
          recording = null;
        }
        closeAudioResources();
      } else {
        if (stream) stream.getTracks().forEach(track => track.stop());
        if (context && context.state !== 'closed') context.close().catch(() => {});
      }
      if (currentGeneration !== microphoneGeneration || dialog.hidden) return;
      const message = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError'
        ? '麦克风权限未开放。可以在浏览器设置中调整，或直接使用文字输入。'
        : error?.name === 'NotFoundError'
          ? '没有检测到可用麦克风。可以直接使用文字输入。'
          : '麦克风暂时不可用。可以重新尝试，或直接使用文字输入。';
      setState('error', message);
      meterReading.textContent = '麦克风未开启';
    } finally {
      if (currentGeneration === microphoneGeneration) {
        microphoneStarting = false;
        renderConfiguration();
        setBusy();
      }
    }
  }

  function clearConversation() {
    conversationEpoch += 1;
    if (responseFrame) {
      cancelAnimationFrame(responseFrame);
      responseFrame = 0;
      responsePending = false;
    }
    stopSpeech();
    if (activeStream || recording) stopMicrophone(false);
    messages.replaceChildren();
    updateHistory();
    history.open = false;
    panel.classList.remove('has-conversation');
    latestText.textContent = publicMode() ? liveOpeningText : openingText;
    latestAudio = null;
    speakButton.hidden = true;
    openPortfolioButton.hidden = true;
    setState('idle', responsePending ? '本页记录已清除；已提交的请求仍在处理。' : '本页会话已清除。');
    input.focus();
  }

  document.addEventListener('albertvoice:open-ready', openDialog);
  closeButton.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), summary, a[href]')]
      .filter(element => element.getClientRects().length > 0);
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
    if (!input.value.trim()) { input.focus(); return; }
    const question = input.value;
    if (submitQuestion(question)) input.value = '';
  });
  dialog.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => submitQuestion(button.dataset.prompt || '')));
  micButton.addEventListener('click', () => {
    if (activeStream) stopMicrophone(Boolean(recording), recording ? '录音已结束，正在准备提交。' : '麦克风已关闭，声音没有被保存或上传。');
    else startMicrophone();
  });
  speakButton.addEventListener('click', () => playAudio(latestAudio));
  stopSpeakButton.addEventListener('click', () => stopSpeech(true));
  document.getElementById('albertVoiceClear')?.addEventListener('click', clearConversation);
  usageButton.addEventListener('click', async () => {
    usageButton.disabled = true;
    try {
      const result = await window.AlbertVoiceAPI.usage();
      usageOutput.textContent = '账期 ' + result.month + '；已结算估算 ¥' + result.spentCny.toFixed(6) + '；在途预留 ¥' + result.reservedCny.toFixed(6) + '；不确定费用 ¥' + result.conservativeUnknownCny.toFixed(6) + '；成功 ' + result.completedRequests + ' 次；失败 ' + result.failedRequests + ' 次；目标 ¥' + result.monthlyGoalCny + '；停止上限 ¥' + result.newRequestStopCny + '。';
      budgetInput.value = String(result.newRequestStopCny);
    } catch (error) { usageOutput.textContent = error?.message || '用量暂不可用。'; }
    finally { usageButton.disabled = false; }
  });
  budgetButton.addEventListener('click', async () => {
    budgetButton.disabled = true;
    try {
      const amount = Number(budgetInput.value);
      if (!budgetInput.value || !Number.isFinite(amount) || amount < 1 || amount > 100) throw new Error('请输入 1 至 100 元之间的金额。');
      const result = await window.AlbertVoiceAPI.setBudget(amount);
      budgetOutput.textContent = '应用停止上限已从 ¥' + result.previousCny + ' 调整为 ¥' + result.stopCny + '；不会自动充值。';
    } catch (error) { budgetOutput.textContent = error?.message || '预算调整未完成。'; }
    finally { budgetButton.disabled = false; }
  });
  pairButton.addEventListener('click', async () => {
    pairButton.disabled = true;
    try {
      const result = await window.AlbertVoiceAPI.pair();
      pairCode.textContent = result.code || '未收到绑定码。';
    } catch (error) {
      pairCode.textContent = error?.message || '绑定码暂不可用。';
    } finally { pairButton.disabled = false; }
  });
  openPortfolioButton.addEventListener('click', () => {
    closeDialog();
    const worksButton = document.getElementById('worksButton');
    worksButton?.click();
    worksButton?.focus({ preventScroll: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopSpeech();
      if (activeStream || recording || microphoneStarting) stopMicrophone(false, '页面离开前已关闭麦克风。');
    }
  });
  window.visualViewport?.addEventListener('resize', updateViewport);
  window.addEventListener('pagehide', () => {
    conversationEpoch += 1;
    stopSpeech();
    stopMicrophone(false);
  });
})();
