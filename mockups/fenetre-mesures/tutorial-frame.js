(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('tutorialEmbed') !== '1') return;

  const scene = Math.max(0, Math.min(6, Number(params.get('tutorialScene')) || 0));
  const language = (params.get('clientLang') || params.get('lang') || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const channel = 'vosthermos-measure-tutorial';
  const TUTORIAL_SPEED_RATIO = 0.7;
  const TUTORIAL_TIME_FACTOR = 1 / TUTORIAL_SPEED_RATIO;
  const baseDurations = [6500, 5600, 6800, 6800, 6800, 6400, 6200];
  const durations = baseDurations.map((duration) => Math.round(duration * TUTORIAL_TIME_FACTOR));
  let runId = '';
  let events = [];
  let nextEventIndex = 0;
  let elapsed = 0;
  let startedAt = 0;
  let timer = null;
  let paused = true;
  let cursor = null;
  let currentTarget = null;

  document.body.classList.add('tutorial-embed');
  document.documentElement.lang = language;

  function post(type, detail = {}) {
    window.parent.postMessage({ channel, type, scene, runId, ...detail }, window.location.origin);
  }

  function dispatch(node, type) {
    node?.dispatchEvent(new Event(type, { bubbles: true }));
  }

  function translateEnglish() {
    if (language !== 'en') return;
    document.documentElement.lang = 'en';
  }

  function ensureCursor() {
    if (cursor?.isConnected) return cursor;
    cursor = document.createElement('span');
    cursor.className = 'tutorial-frame-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 3 10 9-5 1 3 6-3 2-3-6-4 4L7 3Z"/></svg>';
    document.body.appendChild(cursor);
    return cursor;
  }

  function updateCursor() {
    if (!currentTarget?.isConnected || !cursor) return;
    const rect = currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      cursor.style.opacity = '0';
      return;
    }
    cursor.style.left = rect.left + rect.width * .72 + 'px';
    cursor.style.top = rect.top + rect.height * .55 + 'px';
  }

  function clearTarget() {
    currentTarget?.classList.remove('tutorial-frame-target');
    currentTarget = null;
  }

  function focusTarget(target, block = 'center') {
    const node = typeof target === 'string' ? document.querySelector(target) : target;
    if (!node) {
      post('STEP_ERROR', { reason: 'missing-target', target: typeof target === 'string' ? target : 'element' });
      return null;
    }
    clearTarget();
    currentTarget = node;
    node.classList.add('tutorial-frame-target');
    node.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block, inline: 'nearest' });
    ensureCursor().style.opacity = '1';
    window.requestAnimationFrame(updateCursor);
    return node;
  }

  function clickTarget(target, block = 'center') {
    const node = focusTarget(target, block);
    if (!node) return;
    cursor.classList.remove('is-clicking');
    void cursor.offsetWidth;
    cursor.classList.add('is-clicking');
    node.click();
    translateEnglish();
    window.requestAnimationFrame(updateCursor);
  }

  function setInput(selector, value) {
    const input = focusTarget(selector);
    if (!input) return;
    input.focus({ preventScroll: true });
    input.value = value;
    dispatch(input, 'input');
    translateEnglish();
    window.requestAnimationFrame(updateCursor);
  }

  function selectValue(selector, value) {
    const select = focusTarget(selector);
    if (!select) return;
    select.value = value;
    dispatch(select, 'change');
    translateEnglish();
    window.requestAnimationFrame(updateCursor);
  }

  function paneAt(index) {
    return document.querySelectorAll('[data-window-canvas] .pane')[index] || null;
  }

  function buildSceneEvents() {
    const complete = () => post('STEP_DONE', { duration: durations[scene] });
    const scaleEvents = (items) => items.map((item) => ({ ...item, at: Math.round(item.at * TUTORIAL_TIME_FACTOR) }));
    if (scene === 0) return scaleEvents([
      { at: 0, run: () => focusTarget('.layout-presets-menu summary', 'center') },
      { at: 850, run: () => clickTarget('.layout-presets-menu summary') },
      { at: 1900, run: () => focusTarget('[data-layout-preset="2x2"]') },
      { at: 2850, run: () => clickTarget('[data-layout-preset="2x2"]') },
      { at: 4200, run: () => focusTarget('[data-window-canvas]') },
      { at: baseDurations[scene], run: complete },
    ]);
    if (scene === 1) return scaleEvents([
      { at: 0, run: () => focusTarget(paneAt(1), 'center') },
      { at: 950, run: () => clickTarget(paneAt(1)) },
      { at: 2600, run: () => focusTarget('[data-thermos-editor]', 'center') },
      { at: baseDurations[scene], run: complete },
    ]);
    if (scene === 2) return scaleEvents([
      { at: 0, run: () => focusTarget('input[data-measure-dimension="width"]', 'center') },
      { at: 700, run: () => setInput('input[data-measure-dimension="width"]', '3') },
      { at: 1050, run: () => setInput('input[data-measure-dimension="width"]', '32') },
      { at: 1450, run: () => selectValue('select[data-measure-dimension="width"]', '1/4') },
      { at: 2100, run: () => setInput('input[data-measure-dimension="height"]', '4') },
      { at: 2450, run: () => setInput('input[data-measure-dimension="height"]', '48') },
      { at: 2850, run: () => selectValue('select[data-measure-dimension="height"]', '7/8') },
      { at: 3550, run: () => setInput('input[data-measure-dimension="thickness"]', '1') },
      { at: 4650, run: () => focusTarget('[data-editor-state]') },
      { at: baseDurations[scene], run: complete },
    ]);
    if (scene === 3) return scaleEvents([
      { at: 0, run: () => focusTarget('[data-edit-selected-thermos]', 'center') },
      { at: 850, run: () => clickTarget('[data-edit-selected-thermos]') },
      { at: 1750, run: () => focusTarget('[data-modal-axis="vertical"]') },
      { at: 2400, run: () => clickTarget('[data-modal-axis="vertical"]') },
      { at: 3150, run: () => focusTarget('[data-section-count="2"]') },
      { at: 3650, run: () => clickTarget('[data-section-count="2"]') },
      { at: 4300, run: () => focusTarget('[data-create-sections]') },
      { at: 4900, run: () => clickTarget('[data-create-sections]') },
      { at: 5750, run: () => focusTarget('[data-window-canvas]') },
      { at: baseDurations[scene], run: complete },
    ]);
    if (scene === 4) return scaleEvents([
      { at: 0, run: () => focusTarget('.thermos-option-grid', 'center') },
      { at: 650, run: () => clickTarget('input[data-measure-key="lowE"]') },
      { at: 1150, run: () => clickTarget('input[data-measure-key="argon"]') },
      { at: 1750, run: () => selectValue('select[data-measure-key="spacer"]', 'black') },
      { at: 2350, run: () => selectValue('select[data-measure-key="glazing"]', 'double') },
      { at: 2900, run: () => selectValue('select[data-measure-key="access"]', 'without_ladder') },
      { at: 3450, run: () => clickTarget('[data-decorative-enabled]') },
      { at: 4200, run: () => clickTarget('[data-counter="vertical"] [data-delta="1"]') },
      { at: 4900, run: () => clickTarget('[data-counter="horizontal"] [data-delta="1"]') },
      { at: 5700, run: () => focusTarget('[data-decorative-options]') },
      { at: baseDurations[scene], run: complete },
    ]);
    if (scene === 5) return scaleEvents([
      { at: 0, run: () => focusTarget('[data-add-window]', 'center') },
      { at: 1000, run: () => clickTarget('[data-add-window]') },
      { at: 1800, run: () => focusTarget('[data-window-incomplete-continue]') },
      { at: 2450, run: () => clickTarget('[data-window-incomplete-continue]') },
      { at: 3600, run: () => focusTarget('[data-window-plan]:last-child .plan-head', 'start') },
      { at: 4950, run: () => focusTarget('[data-window-plan]:last-child [data-window-canvas]') },
      { at: baseDurations[scene], run: complete },
    ]);
    return scaleEvents([
      { at: 0, run: () => focusTarget('input[data-measure-key="lowE"]', 'center') },
      { at: 650, run: () => clickTarget('input[data-measure-key="lowE"]') },
      { at: 1350, run: () => focusTarget('[data-undo]') },
      { at: 1900, run: () => clickTarget('[data-undo]') },
      { at: 2700, run: () => focusTarget('[data-redo]') },
      { at: 3250, run: () => clickTarget('[data-redo]') },
      { at: 4100, run: () => focusTarget('[data-finalize]') },
      { at: 4750, run: () => clickTarget('[data-finalize]') },
      { at: 5550, run: () => focusTarget('.sticky-actions') },
      { at: baseDurations[scene], run: complete },
    ]);
  }

  function clearTimeline() {
    if (timer) window.clearTimeout(timer);
    timer = null;
    startedAt = 0;
  }

  function runNextEvent() {
    clearTimeline();
    if (paused || nextEventIndex >= events.length) return;
    const event = events[nextEventIndex];
    const delay = Math.max(0, event.at - elapsed);
    startedAt = performance.now();
    timer = window.setTimeout(() => {
      timer = null;
      startedAt = 0;
      elapsed = event.at;
      event.run();
      nextEventIndex += 1;
      runNextEvent();
    }, delay);
  }

  function prepare(nextRunId) {
    clearTimeline();
    clearTarget();
    runId = String(nextRunId || '');
    events = buildSceneEvents();
    nextEventIndex = 0;
    elapsed = 0;
    paused = true;
    document.body.classList.add('is-tutorial-paused');
    while (events[nextEventIndex]?.at === 0) {
      events[nextEventIndex].run();
      nextEventIndex += 1;
    }
    post('PREPARED', { duration: durations[scene] });
  }

  function pause() {
    if (paused) return;
    if (startedAt) elapsed = Math.min(durations[scene], elapsed + performance.now() - startedAt);
    clearTimeline();
    paused = true;
    document.body.classList.add('is-tutorial-paused');
    window.scrollTo({ top: window.scrollY, left: window.scrollX, behavior: 'auto' });
  }

  function resume() {
    if (!paused) return;
    paused = false;
    document.body.classList.remove('is-tutorial-paused');
    runNextEvent();
  }

  window.addEventListener('scroll', updateCursor, { passive: true });
  window.addEventListener('resize', updateCursor);
  window.addEventListener('message', (message) => {
    if (message.origin !== window.location.origin || message.source !== window.parent || message.data?.channel !== channel) return;
    if (message.data.type === 'START') {
      prepare(message.data.runId);
      if (message.data.playing) resume();
    } else if (message.data.runId === runId && message.data.type === 'PAUSE') pause();
    else if (message.data.runId === runId && message.data.type === 'RESUME') resume();
    else if (message.data.runId === runId && message.data.type === 'STOP') {
      pause();
      clearTarget();
      ensureCursor().style.opacity = '0';
    }
  });

  document.addEventListener('keydown', (event) => {
    if (!['Escape', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) return;
    event.preventDefault();
    post('KEY_COMMAND', { key: event.key });
  });

  translateEnglish();
  ensureCursor().style.opacity = '0';
  post('FRAME_READY', { duration: durations[scene] });
})();
