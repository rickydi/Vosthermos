(() => {
  const canvas = document.querySelector('[data-window-canvas]');
  const sheet = document.querySelector('[data-measure-sheet]');
  const toast = document.querySelector('[data-toast]');
  if (!canvas || !sheet) return;
  const draggableDividers = document.body.dataset.draggableDividers === 'true';
  const initialPaneCount = Number(document.body.dataset.initialPanes || 3);
  const initialOrientation = document.body.dataset.initialOrientation || 'vertical';

  const state = {
    paneCount: initialPaneCount,
    orientation: initialOrientation,
    selectedPane: Number(document.body.dataset.initialPane || 2),
    dividerPositions: [],
    decorative: { vertical: 0, horizontal: 0 },
    measurements: {
      1: { width: '32', widthFraction: '1/4', height: '48', heightFraction: '1/2', thickness: '1', thicknessFraction: '0' },
      2: { width: '', widthFraction: '', height: '', heightFraction: '', thickness: '', thicknessFraction: '' },
      3: { width: '31', widthFraction: '7/8', height: '48', heightFraction: '1/2', thickness: '1', thicknessFraction: '0' },
    },
  };

  let toastTimer;
  const fractions = ['', '0', '1/16', '1/8', '3/16', '1/4', '5/16', '3/8', '7/16', '1/2', '9/16', '5/8', '11/16', '3/4', '13/16', '7/8', '15/16'];

  function directionIconMarkup(orientation) {
    const path = orientation === 'vertical'
      ? '<path d="M4 12h16M7.5 8.5 4 12l3.5 3.5M16.5 8.5 20 12l-3.5 3.5"/>'
      : '<path d="M12 4v16M8.5 7.5 12 4l3.5 3.5M8.5 16.5 12 20l3.5-3.5"/>';
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  }

  function checkIconMarkup() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 12.5 4 4L18.5 8"/></svg>';
  }

  function equalDividerPositions(count = state.paneCount) {
    return Array.from({ length: Math.max(0, count - 1) }, (_, index) => ((index + 1) / count) * 100);
  }

  function ensureDividerPositions() {
    if (state.dividerPositions.length !== Math.max(0, state.paneCount - 1)) {
      state.dividerPositions = equalDividerPositions();
    }
  }

  function paneTrackTemplate() {
    ensureDividerPositions();
    const edges = [0, ...state.dividerPositions, 100];
    return edges.slice(1).map((edge, index) => `${Math.max(.1, edge - edges[index])}fr`).join(' ');
  }

  function applyPaneTracks() {
    const tracks = paneTrackTemplate();
    canvas.style.gridTemplateColumns = state.orientation === 'vertical' ? tracks : '';
    canvas.style.gridTemplateRows = state.orientation === 'horizontal' ? tracks : '';
  }

  function markDirty() {
    document.querySelectorAll('[data-dirty]').forEach((node) => { node.hidden = false; });
  }

  function showToast(message, tone = 'success') {
    if (!toast) return;
    toast.textContent = message;
    toast.dataset.tone = tone;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }

  function measurementFor(index) {
    state.measurements[index] ||= { width: '', widthFraction: '', height: '', heightFraction: '', thickness: '', thicknessFraction: '' };
    return state.measurements[index];
  }

  function formattedDimension(whole, fraction) {
    const parts = [whole, fraction].filter((value) => value !== '' && value !== '0');
    return parts.length ? parts.join(' ') : whole === '0' ? '0' : '';
  }

  function paneSummary(index) {
    const value = measurementFor(index);
    const width = formattedDimension(value.width, value.widthFraction);
    const height = formattedDimension(value.height, value.heightFraction);
    const thickness = formattedDimension(value.thickness, value.thicknessFraction);
    if (!width && !height && !thickness) return '';
    return `${width || '—'} × ${height || '—'} × ${thickness || '—'} po`;
  }

  function paneIsComplete(index) {
    const value = measurementFor(index);
    return Boolean(formattedDimension(value.width, value.widthFraction) && formattedDimension(value.height, value.heightFraction));
  }

  function renderDecorativeLines(pane, index) {
    if (index !== state.selectedPane) return;
    for (let i = 0; i < state.decorative.vertical; i += 1) {
      const line = document.createElement('span');
      line.className = 'decorative-line decorative-line-v';
      line.style.left = `${((i + 1) / (state.decorative.vertical + 1)) * 100}%`;
      pane.appendChild(line);
    }
    for (let i = 0; i < state.decorative.horizontal; i += 1) {
      const line = document.createElement('span');
      line.className = 'decorative-line decorative-line-h';
      line.style.top = `${((i + 1) / (state.decorative.horizontal + 1)) * 100}%`;
      pane.appendChild(line);
    }
  }

  function positionDividerHandles() {
    if (!draggableDividers) return;
    const canvasRect = canvas.getBoundingClientRect();
    const canvasOriginLeft = canvasRect.left + canvas.clientLeft;
    const canvasOriginTop = canvasRect.top + canvas.clientTop;
    const panes = [...canvas.querySelectorAll('.pane')];
    canvas.querySelectorAll('[data-divider-index]').forEach((handle) => {
      const index = Number(handle.dataset.dividerIndex);
      const paneRect = panes[index]?.getBoundingClientRect();
      const nextPaneRect = panes[index + 1]?.getBoundingClientRect();
      if (!paneRect || !nextPaneRect) return;
      if (state.orientation === 'vertical') {
        handle.style.left = `${((paneRect.right + nextPaneRect.left) / 2) - canvasOriginLeft}px`;
        handle.style.top = `${((paneRect.top + paneRect.bottom) / 2) - canvasOriginTop}px`;
      } else {
        handle.style.left = `${((paneRect.left + paneRect.right) / 2) - canvasOriginLeft}px`;
        handle.style.top = `${((paneRect.bottom + nextPaneRect.top) / 2) - canvasOriginTop}px`;
      }
      const spacing = minimumPanePercent();
      const previous = index === 0 ? 0 : state.dividerPositions[index - 1];
      const next = index === state.dividerPositions.length - 1 ? 100 : state.dividerPositions[index + 1];
      handle.setAttribute('aria-valuemin', String(Math.ceil(previous + spacing)));
      handle.setAttribute('aria-valuemax', String(Math.floor(next - spacing)));
      handle.setAttribute('aria-valuenow', String(Math.round(state.dividerPositions[index])));
      handle.setAttribute('aria-valuetext', `${Math.round(state.dividerPositions[index])} %`);
    });
  }

  function minimumPanePercent() {
    return Math.min(16, Math.max(7, 72 / state.paneCount));
  }

  function moveDividerTo(index, requestedPosition) {
    const spacing = minimumPanePercent();
    const previous = index === 0 ? 0 : state.dividerPositions[index - 1];
    const next = index === state.dividerPositions.length - 1 ? 100 : state.dividerPositions[index + 1];
    state.dividerPositions[index] = Math.round(Math.min(next - spacing, Math.max(previous + spacing, requestedPosition)) * 10) / 10;
    applyPaneTracks();
    positionDividerHandles();
    markDirty();
  }

  function startDividerDrag(event, index) {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    handle.classList.add('is-dragging');
    handle.focus({ preventScroll: true });
    handle.setPointerCapture?.(event.pointerId);
    const startingCoordinate = state.orientation === 'vertical' ? event.clientX : event.clientY;
    const startingPosition = state.dividerPositions[index];
    const canvasRect = canvas.getBoundingClientRect();
    const axisLength = state.orientation === 'vertical' ? canvasRect.width : canvasRect.height;

    const move = (moveEvent) => {
      const currentCoordinate = state.orientation === 'vertical' ? moveEvent.clientX : moveEvent.clientY;
      moveDividerTo(index, startingPosition + ((currentCoordinate - startingCoordinate) / axisLength) * 100);
    };
    const finish = (finishEvent) => {
      handle.classList.remove('is-dragging');
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', finish);
      handle.removeEventListener('pointercancel', finish);
      handle.removeEventListener('lostpointercapture', finish);
      if (finishEvent.type !== 'lostpointercapture' && handle.hasPointerCapture?.(finishEvent.pointerId)) handle.releasePointerCapture(finishEvent.pointerId);
    };

    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
    handle.addEventListener('lostpointercapture', finish);
  }

  function moveDividerWithKeyboard(event, index) {
    const previousKey = state.orientation === 'vertical' ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = state.orientation === 'vertical' ? 'ArrowRight' : 'ArrowDown';
    if (![previousKey, nextKey, 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const spacing = minimumPanePercent();
    const previous = index === 0 ? 0 : state.dividerPositions[index - 1];
    const next = index === state.dividerPositions.length - 1 ? 100 : state.dividerPositions[index + 1];
    if (event.key === 'Home') {
      moveDividerTo(index, previous + spacing);
      return;
    }
    if (event.key === 'End') {
      moveDividerTo(index, next - spacing);
      return;
    }
    const direction = event.key === previousKey ? -1 : 1;
    moveDividerTo(index, state.dividerPositions[index] + direction * (event.shiftKey ? 5 : 1));
  }

  function appendDividerHandles() {
    if (!draggableDividers) return;
    state.dividerPositions.forEach((position, index) => {
      const handle = document.createElement('div');
      handle.className = 'divider-handle';
      handle.dataset.dividerIndex = String(index);
      handle.tabIndex = 0;
      handle.innerHTML = directionIconMarkup(state.orientation);
      handle.setAttribute('role', 'separator');
      handle.setAttribute('aria-orientation', state.orientation);
      handle.setAttribute('aria-label', `Séparation entre T${index + 1} et T${index + 2}`);
      handle.setAttribute('aria-valuemin', '0');
      handle.setAttribute('aria-valuemax', '100');
      handle.setAttribute('aria-valuenow', String(Math.round(position)));
      handle.setAttribute('aria-valuetext', `${Math.round(position)} %`);
      handle.title = state.orientation === 'vertical' ? 'Glisser à gauche ou à droite' : 'Glisser vers le haut ou le bas';
      handle.addEventListener('pointerdown', (event) => startDividerDrag(event, index));
      handle.addEventListener('keydown', (event) => moveDividerWithKeyboard(event, index));
      canvas.appendChild(handle);
    });
    requestAnimationFrame(positionDividerHandles);
  }

  function renderPanes() {
    state.selectedPane = Math.min(Math.max(1, state.selectedPane), state.paneCount);
    canvas.innerHTML = '';
    canvas.dataset.orientation = state.orientation;
    canvas.style.setProperty('--pane-count', state.paneCount);
    applyPaneTracks();
    for (let index = 1; index <= state.paneCount; index += 1) {
      const pane = document.createElement('button');
      pane.type = 'button';
      pane.className = 'pane';
      pane.dataset.pane = String(index);
      pane.setAttribute('aria-pressed', index === state.selectedPane ? 'true' : 'false');
      pane.setAttribute('aria-label', `Thermos T${index}. Ouvrir largeur, hauteur et épaisseur.`);
      const summary = paneSummary(index);
      pane.innerHTML = `${summary ? `<span class="pane-value">${summary}</span>` : ''}<span class="pane-code">T${index}</span><span class="pane-hint">Toucher pour mesurer</span>`;
      renderDecorativeLines(pane, index);
      if (!draggableDividers && index < state.paneCount) {
        const handle = document.createElement('span');
        handle.className = 'divider-handle';
        handle.setAttribute('aria-hidden', 'true');
        handle.innerHTML = directionIconMarkup(state.orientation);
        pane.appendChild(handle);
      }
      pane.addEventListener('click', () => openPane(index));
      canvas.appendChild(pane);
    }
    appendDividerHandles();
    renderPaneStrip();
    const completedPaneCount = Array.from({ length: state.paneCount }, (_, index) => index + 1).filter(paneIsComplete).length;
    document.querySelectorAll('[data-pane-count-output]').forEach((output) => { output.textContent = String(state.paneCount); });
    document.querySelectorAll('[data-complete-pane-output]').forEach((output) => { output.textContent = String(completedPaneCount); });
    document.querySelectorAll('[data-progress-label]').forEach((progress) => { progress.setAttribute('aria-label', `${completedPaneCount} thermos sur ${state.paneCount} mesurés`); });
    document.querySelectorAll('[data-divider-count-output]').forEach((output) => { output.textContent = String(Math.max(0, state.paneCount - 1)); });
    document.querySelectorAll('[data-split]').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.split === state.orientation)); });
    document.querySelectorAll('[data-direction-icon]').forEach((icon) => { icon.innerHTML = directionIconMarkup(icon.dataset.directionIcon); });
    document.querySelectorAll('[data-move-symbol]').forEach((symbol) => { symbol.innerHTML = directionIconMarkup(state.orientation); });
    document.querySelectorAll('[data-move-copy]').forEach((copy) => { copy.textContent = 'Glissez les poignées pour ajuster.'; });
    renderProgressSteps();
  }

  function renderPaneStrip() {
    document.querySelectorAll('[data-pane-strip]').forEach((strip) => {
      strip.innerHTML = '';
      for (let index = 1; index <= state.paneCount; index += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'pane-pill';
        button.setAttribute('aria-pressed', index === state.selectedPane ? 'true' : 'false');
        button.textContent = paneIsComplete(index) ? `T${index} ✓` : `T${index} •`;
        button.addEventListener('click', () => openPane(index));
        strip.appendChild(button);
      }
    });
  }

  function renderProgressSteps() {
    document.querySelectorAll('[data-progress-steps]').forEach((progress) => {
      progress.innerHTML = '';
      for (let index = 1; index <= state.paneCount; index += 1) {
        const complete = paneIsComplete(index);
        const current = index === state.selectedPane;
        const step = document.createElement('button');
        step.type = 'button';
        step.className = `progress-step${complete ? ' is-complete' : ''}${current ? ' is-current' : ''}${index === state.paneCount ? ' is-last' : ''}`;
        step.setAttribute('aria-label', `T${index}, ${complete ? 'mesuré' : 'à mesurer'}${current ? ', sélectionné' : ''}`);
        if (current) step.setAttribute('aria-current', 'step');

        const node = document.createElement('span');
        node.className = 'progress-node';
        if (complete) node.innerHTML = checkIconMarkup();
        else node.textContent = String(index);

        const label = document.createElement('span');
        label.className = 'progress-label';
        label.textContent = `T${index}`;
        step.append(node, label);
        step.addEventListener('click', () => openPane(index));
        progress.appendChild(step);
      }
    });
  }

  function fillSheet(index) {
    const data = measurementFor(index);
    document.querySelectorAll('[data-active-pane]').forEach((node) => { node.textContent = `T${index}`; });
    sheet.querySelectorAll('[data-measure-key]').forEach((field) => {
      field.value = data[field.dataset.measureKey] ?? '';
    });
  }

  function openPane(index) {
    state.selectedPane = index;
    renderPanes();
    fillSheet(index);
    sheet.hidden = false;
    sheet.classList.add('is-open');
    document.body.classList.add('measure-open');
    const firstInput = sheet.querySelector('[data-measure-key="width"]');
    firstInput?.focus();
    firstInput?.select();
  }

  function closeSheet() {
    sheet.classList.remove('is-open');
    sheet.hidden = true;
    document.body.classList.remove('measure-open');
  }

  function setSections(orientation) {
    const selector = document.querySelector('[data-section-count]');
    state.paneCount = Math.min(12, Math.max(2, Number(selector?.value || 3)));
    state.orientation = orientation;
    state.dividerPositions = equalDividerPositions();
    state.selectedPane = Math.min(state.selectedPane, state.paneCount);
    renderPanes();
    markDirty();
    showToast(`${state.paneCount} thermos égaux créés. Touchez une section pour inscrire ses mesures.`);
  }

  function equalizeDividers() {
    state.dividerPositions = equalDividerPositions();
    applyPaneTracks();
    positionDividerHandles();
    markDirty();
    showToast(`${state.paneCount} thermos répartis également.`);
  }

  function resetDrawing() {
    const confirmation = draggableDividers ? 'Revenir au dessin initial?' : 'Réinitialiser le dessin et revenir à un seul thermos?';
    if (!window.confirm(confirmation)) return;
    if (draggableDividers) {
      state.paneCount = initialPaneCount;
      state.selectedPane = Math.min(Number(document.body.dataset.initialPane || 1), initialPaneCount);
      state.orientation = initialOrientation;
      state.dividerPositions = equalDividerPositions(initialPaneCount);
      const selector = document.querySelector('[data-section-count]');
      if (selector) selector.value = String(initialPaneCount);
    } else {
      state.paneCount = 1;
      state.selectedPane = 1;
      state.orientation = 'vertical';
      state.dividerPositions = [];
    }
    state.decorative = { vertical: 0, horizontal: 0 };
    document.querySelectorAll('[data-counter] output').forEach((output) => { output.textContent = '0'; });
    renderPanes();
    closeSheet();
    markDirty();
    showToast(draggableDividers ? 'Dessin initial rétabli.' : 'Dessin réinitialisé.');
  }

  sheet.querySelectorAll('[data-measure-key]').forEach((field) => {
    if (field.tagName === 'SELECT' && !field.options.length) {
      fractions.forEach((fraction) => field.add(new Option(fraction || 'Fraction', fraction)));
    }
    field.addEventListener('input', () => {
      measurementFor(state.selectedPane)[field.dataset.measureKey] = field.value;
      renderPanes();
      document.querySelectorAll('[data-dirty]').forEach((node) => { node.hidden = false; });
    });
  });

  document.querySelectorAll('[data-close-sheet]').forEach((button) => button.addEventListener('click', closeSheet));
  document.querySelectorAll('[data-split]').forEach((button) => button.addEventListener('click', () => setSections(button.dataset.split)));
  document.querySelectorAll('[data-equalize]').forEach((button) => button.addEventListener('click', equalizeDividers));
  document.querySelectorAll('[data-reset]').forEach((button) => button.addEventListener('click', resetDrawing));
  document.querySelectorAll('[data-section-count]').forEach((select) => select.addEventListener('change', () => {
    if (draggableDividers) setSections(state.orientation);
    else showToast(`${select.value} sections choisies. Sélectionnez le sens.`);
  }));

  document.querySelectorAll('[data-counter]').forEach((counter) => {
    const key = counter.dataset.counter;
    const output = counter.querySelector('output');
    counter.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      state.decorative[key] = Math.max(0, Math.min(8, state.decorative[key] + Number(button.dataset.delta)));
      output.textContent = String(state.decorative[key]);
      renderPanes();
    }));
  });

  document.querySelectorAll('[data-photo]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.window-stage').forEach((stage) => stage.classList.add('has-photo'));
    document.querySelectorAll('[data-detect]').forEach((detect) => { detect.disabled = false; });
    button.textContent = 'Changer la photo';
    showToast('Photo ajoutée. Vous pouvez maintenant détecter les divisions.');
  }));
  document.querySelectorAll('[data-detect]').forEach((button) => button.addEventListener('click', () => {
    state.paneCount = 3;
    state.orientation = 'vertical';
    state.dividerPositions = equalDividerPositions(3);
    state.selectedPane = 2;
    const selector = document.querySelector('[data-section-count]');
    if (selector) selector.value = '3';
    renderPanes();
    markDirty();
    showToast('3 thermos détectés. Vérifiez les lignes avant de mesurer.');
  }));

  document.querySelectorAll('[data-window-tab]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-window-tab]').forEach((tab) => tab.setAttribute('aria-selected', 'false'));
    button.setAttribute('aria-selected', 'true');
    showToast(`${button.textContent.trim()} ouverte.`);
  }));
  document.querySelectorAll('[data-add-window]').forEach((button) => button.addEventListener('click', () => showToast('Nouvelle fenêtre ajoutée au prototype.')));
  document.querySelectorAll('[data-save-draft]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-dirty]').forEach((node) => { node.hidden = true; });
    showToast('Brouillon enregistré localement.');
  }));
  document.querySelectorAll('[data-finalize]').forEach((button) => button.addEventListener('click', () => showToast('Prototype seulement : les mesures seraient validées ici.')));
  document.querySelectorAll('[data-apply-measure]').forEach((button) => button.addEventListener('click', () => {
    const data = { ...measurementFor(state.selectedPane) };
    for (let index = 1; index <= state.paneCount; index += 1) state.measurements[index] = { ...data };
    renderPanes();
    showToast(`Mesures de T${state.selectedPane} appliquées aux ${state.paneCount} thermos.`);
  }));

  if (draggableDividers && 'ResizeObserver' in window) {
    new ResizeObserver(() => requestAnimationFrame(positionDividerHandles)).observe(canvas);
  }
  renderPanes();
})();
