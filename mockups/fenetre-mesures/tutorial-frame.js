(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('tutorialEmbed') !== '1') return;

  const scene = Math.max(0, Math.min(6, Number(params.get('tutorialScene')) || 0));
  const language = (params.get('clientLang') || params.get('lang') || 'fr').toLowerCase().startsWith('en') ? 'en' : 'fr';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const channel = 'vosthermos-measure-tutorial';
  const durations = [6500, 5600, 6800, 6800, 6800, 6400, 6200];
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

  function setText(selector, text, root = document) {
    const node = root.querySelector(selector);
    if (node) node.textContent = text;
  }

  function translateEnglish() {
    if (language !== 'en') return;
    setText('.mode-chip', 'Final measurements');
    setText('.progress-head > span', 'Measurement steps');
    document.querySelectorAll('.plan-status').forEach((node) => {
      const complete = node.querySelector('[data-complete-pane-output]')?.textContent || '0';
      const total = node.querySelector('[data-pane-count-output]')?.textContent || '0';
      node.innerHTML = '<strong data-complete-pane-output>' + complete + '</strong>&nbsp;/&nbsp;<span data-pane-count-output>' + total + '</span>&nbsp;measured';
    });
    document.querySelectorAll('.layout-presets-summary').forEach((node) => {
      const selected = node.querySelector('[data-preset-summary]')?.textContent || 'Four equal';
      node.innerHTML = '<strong>Choose a window type</strong><small>Selected: <span data-preset-summary>' + selected + '</span></small>';
    });
    const presets = {
      '1x1': ['Single pane', '1 glass unit'], '2x1-narrow-left': ['Small left pane', '2 glass units'], '2x1': ['Two side by side', '2 glass units'],
      '1x2': ['Two stacked', '2 glass units'], '3x1': ['Three side by side', '3 glass units'], '2x2': ['Four equal', '4 glass units'],
      '3x2': ['Six equal', '6 glass units'], '3x3': ['Nine equal', '9 glass units'], 'top-3-bottom-1': ['Three on top', '4 glass units'],
      'top-1-bottom-3': ['Three on bottom', '4 glass units'], 'left-1-right-3': ['Large pane on left', '4 glass units'], 'left-3-right-1': ['Large pane on right', '4 glass units'],
    };
    Object.entries(presets).forEach(([key, labels]) => {
      const button = document.querySelector('[data-layout-preset="' + key + '"]');
      if (!button) return;
      setText('.preset-copy strong', labels[0], button);
      setText('.preset-copy small', labels[1], button);
    });
    document.querySelectorAll('[data-photo-label]').forEach((node) => { node.textContent = 'Take a photo'; });
    document.querySelectorAll('[data-photo-help]').forEach((node) => { node.textContent = 'Divisions are detected automatically'; });
    document.querySelectorAll('[data-edit-selected-thermos] strong').forEach((node) => { node.textContent = 'Edit selected glass unit'; });
    document.querySelectorAll('[data-edit-selected-thermos] small').forEach((node) => { node.textContent = 'Split vertically or horizontally'; });
    document.querySelectorAll('.thermos-editor-kicker').forEach((node) => { node.textContent = 'Selected glass unit'; });
    document.querySelectorAll('[data-editor-state]').forEach((node) => {
      node.textContent = node.dataset.state === 'complete' ? 'Measurements complete' : node.dataset.state === 'progress' ? 'Measurements in progress' : 'To measure';
    });
    setText('#thermos-measure-title', 'Measurements');
    setText('#thermos-options-title', 'Glass options');
    document.querySelectorAll('[data-measure-dimension="width"]').forEach((node) => {
      const label = node.closest('.dimension')?.querySelector('.field-label');
      if (label) label.textContent = 'Width *';
    });
    document.querySelectorAll('[data-measure-dimension="height"]').forEach((node) => {
      const label = node.closest('.dimension')?.querySelector('.field-label');
      if (label) label.textContent = 'Height *';
    });
    document.querySelectorAll('[data-measure-dimension="thickness"]').forEach((node) => {
      const label = node.closest('.dimension')?.querySelector('.field-label');
      if (label) label.textContent = 'Thickness *';
    });
    setText('#decorative-title', 'Decorative grilles');
    document.querySelectorAll('[data-decorative-enabled] small').forEach((node) => { node.textContent = 'Add lines without creating new glass units'; });
    document.querySelectorAll('[data-add-window] strong').forEach((node) => { node.textContent = 'Add another window'; });
    document.querySelectorAll('[data-add-window] small').forEach((node) => { node.textContent = 'Create a new glazing plan'; });
    document.querySelectorAll('[data-save-draft]').forEach((node) => { node.textContent = 'Save'; });
    document.querySelectorAll('[data-finalize]').forEach((node) => { node.textContent = 'Confirm final measurements'; });
    setText('#pane-action-title', 'Split this glass unit');
    document.querySelectorAll('[data-pane-action-modal] .pane-action-head p').forEach((node) => { node.textContent = 'Create 2 to 4 glass units in the selected section.'; });
    document.querySelectorAll('[data-modal-axis="vertical"] strong').forEach((node) => { node.textContent = 'Vertical'; });
    document.querySelectorAll('[data-modal-axis="horizontal"] strong').forEach((node) => { node.textContent = 'Horizontal'; });
    document.querySelectorAll('[data-create-sections]').forEach((node) => {
      if (!node.disabled) node.textContent = 'Create glass units';
    });
    const toast = document.querySelector('[data-toast]');
    if (toast?.textContent.includes('Prototype seulement')) toast.textContent = 'Prototype only: final measurements would be confirmed here.';
    else if (toast?.textContent.includes('enregistr')) toast.textContent = 'Draft saved.';
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
    if (scene === 0) return [
      { at: 0, run: () => focusTarget('.layout-presets-menu summary', 'center') },
      { at: 850, run: () => clickTarget('.layout-presets-menu summary') },
      { at: 1900, run: () => focusTarget('[data-layout-preset="2x2"]') },
      { at: 2850, run: () => clickTarget('[data-layout-preset="2x2"]') },
      { at: 4200, run: () => focusTarget('[data-window-canvas]') },
      { at: durations[scene], run: complete },
    ];
    if (scene === 1) return [
      { at: 0, run: () => focusTarget(paneAt(1), 'center') },
      { at: 950, run: () => clickTarget(paneAt(1)) },
      { at: 2600, run: () => focusTarget('[data-thermos-editor]', 'center') },
      { at: durations[scene], run: complete },
    ];
    if (scene === 2) return [
      { at: 0, run: () => focusTarget('input[data-measure-dimension="width"]', 'center') },
      { at: 700, run: () => setInput('input[data-measure-dimension="width"]', '3') },
      { at: 1050, run: () => setInput('input[data-measure-dimension="width"]', '32') },
      { at: 1450, run: () => selectValue('select[data-measure-dimension="width"]', '1/4') },
      { at: 2100, run: () => setInput('input[data-measure-dimension="height"]', '4') },
      { at: 2450, run: () => setInput('input[data-measure-dimension="height"]', '48') },
      { at: 2850, run: () => selectValue('select[data-measure-dimension="height"]', '7/8') },
      { at: 3550, run: () => setInput('input[data-measure-dimension="thickness"]', '1') },
      { at: 4650, run: () => focusTarget('[data-editor-state]') },
      { at: durations[scene], run: complete },
    ];
    if (scene === 3) return [
      { at: 0, run: () => focusTarget('[data-edit-selected-thermos]', 'center') },
      { at: 850, run: () => clickTarget('[data-edit-selected-thermos]') },
      { at: 1750, run: () => focusTarget('[data-modal-axis="vertical"]') },
      { at: 2400, run: () => clickTarget('[data-modal-axis="vertical"]') },
      { at: 3150, run: () => focusTarget('[data-section-count="2"]') },
      { at: 3650, run: () => clickTarget('[data-section-count="2"]') },
      { at: 4300, run: () => focusTarget('[data-create-sections]') },
      { at: 4900, run: () => clickTarget('[data-create-sections]') },
      { at: 5750, run: () => focusTarget('[data-window-canvas]') },
      { at: durations[scene], run: complete },
    ];
    if (scene === 4) return [
      { at: 0, run: () => focusTarget('.thermos-option-grid', 'center') },
      { at: 650, run: () => clickTarget('input[data-measure-key="lowE"]') },
      { at: 1150, run: () => clickTarget('input[data-measure-key="argon"]') },
      { at: 1750, run: () => selectValue('select[data-measure-key="spacer"]', 'Noir') },
      { at: 2350, run: () => selectValue('select[data-measure-key="glazing"]', 'Double') },
      { at: 3000, run: () => clickTarget('[data-decorative-enabled]') },
      { at: 3850, run: () => clickTarget('[data-counter="vertical"] [data-delta="1"]') },
      { at: 4550, run: () => clickTarget('[data-counter="horizontal"] [data-delta="1"]') },
      { at: 5450, run: () => focusTarget('[data-decorative-options]') },
      { at: durations[scene], run: complete },
    ];
    if (scene === 5) return [
      { at: 0, run: () => focusTarget('[data-add-window]', 'center') },
      { at: 1000, run: () => clickTarget('[data-add-window]') },
      { at: 2850, run: () => focusTarget('[data-window-plan]:last-child .plan-head', 'start') },
      { at: 4300, run: () => focusTarget('[data-window-plan]:last-child [data-window-canvas]') },
      { at: durations[scene], run: complete },
    ];
    return [
      { at: 0, run: () => focusTarget('[data-save-draft]', 'center') },
      { at: 850, run: () => clickTarget('[data-save-draft]') },
      { at: 2100, run: () => focusTarget('[data-finalize]') },
      { at: 3000, run: () => clickTarget('[data-finalize]') },
      { at: 4050, run: () => focusTarget('.sticky-actions') },
      { at: durations[scene], run: complete },
    ];
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
