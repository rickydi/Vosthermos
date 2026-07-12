(() => {
  const canvas = document.querySelector('[data-window-canvas]');
  const sheet = document.querySelector('[data-measure-sheet]');
  const toast = document.querySelector('[data-toast]');
  if (!canvas || !sheet) return;

  const MAX_PANES = 12;
  const MIN_CHILD_PX = 52;
  const MIN_SPLIT_PX = 42;
  const PRESETS = {
    '1x1': { columns: 1, rows: 1 },
    '2x1': { columns: 2, rows: 1 },
    '3x1': { columns: 3, rows: 1 },
    '2x2': { columns: 2, rows: 2 },
    '3x2': { columns: 3, rows: 2 },
  };
  const fractions = ['', '0', '1/16', '1/8', '3/16', '1/4', '5/16', '3/8', '7/16', '1/2', '9/16', '5/8', '11/16', '3/4', '13/16', '7/8', '15/16'];

  let paneSequence = 0;
  let splitSequence = 0;
  let toastTimer;
  let lastFocusedPaneId = null;

  function blankMeasurement() {
    return {
      width: '', widthFraction: '', height: '', heightFraction: '', thickness: '', thicknessFraction: '',
      lowE: false, argon: false, tempered: false, laminated: false,
      spacer: '', glazing: '', access: '', notes: '',
    };
  }

  function createPane(measurement = blankMeasurement()) {
    paneSequence += 1;
    return {
      type: 'pane',
      id: `p${paneSequence}`,
      measurement: { ...blankMeasurement(), ...measurement },
      decorative: { vertical: 0, horizontal: 0 },
    };
  }

  function createSplit(axis, children, sizes = null, linkId = null) {
    splitSequence += 1;
    return {
      type: 'split',
      id: `s${splitSequence}`,
      axis,
      sizes: sizes || children.map(() => 100 / children.length),
      children,
      linkId,
    };
  }

  function buildPresetLayout(key, { resetIds = false } = {}) {
    const preset = PRESETS[key];
    if (!preset) return null;
    if (resetIds) {
      paneSequence = 0;
      splitSequence = 0;
    }

    const linkedColumns = preset.rows > 1 && preset.columns > 1 ? `preset-${key}-columns` : null;
    const buildRow = () => {
      const panes = Array.from({ length: preset.columns }, () => createPane());
      return panes.length === 1 ? panes[0] : createSplit('vertical', panes, null, linkedColumns);
    };

    const rows = Array.from({ length: preset.rows }, buildRow);
    return rows.length === 1 ? rows[0] : createSplit('horizontal', rows);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getLeafEntries(root) {
    const entries = [];
    const visit = (node, bounds) => {
      if (node.type === 'pane') {
        entries.push({ node, bounds });
        return;
      }

      const total = node.sizes.reduce((sum, size) => sum + size, 0) || 1;
      let offset = 0;
      node.children.forEach((child, index) => {
        const ratio = node.sizes[index] / total;
        if (node.axis === 'vertical') {
          visit(child, {
            left: bounds.left + bounds.width * offset,
            top: bounds.top,
            width: bounds.width * ratio,
            height: bounds.height,
          });
        } else {
          visit(child, {
            left: bounds.left,
            top: bounds.top + bounds.height * offset,
            width: bounds.width,
            height: bounds.height * ratio,
          });
        }
        offset += ratio;
      });
    };

    visit(root, { left: 0, top: 0, width: 1, height: 1 });
    return entries.sort((a, b) => {
      if (Math.abs(a.bounds.top - b.bounds.top) > .0001) return a.bounds.top - b.bounds.top;
      if (Math.abs(a.bounds.left - b.bounds.left) > .0001) return a.bounds.left - b.bounds.left;
      return a.node.id.localeCompare(b.node.id);
    });
  }

  function findNode(root, id) {
    if (!root || root.id === id) return root || null;
    if (root.type !== 'split') return null;
    for (const child of root.children) {
      const match = findNode(child, id);
      if (match) return match;
    }
    return null;
  }

  function findLinkedSplits(root, linkId, matches = []) {
    if (!root || root.type !== 'split') return matches;
    if (linkId && root.linkId === linkId) matches.push(root);
    root.children.forEach((child) => findLinkedSplits(child, linkId, matches));
    return matches;
  }

  function replaceNode(root, id, replacement) {
    if (root.id === id) return replacement;
    if (root.type === 'split') {
      root.children = root.children.map((child) => replaceNode(child, id, replacement));
    }
    return root;
  }

  function equalizeNode(node) {
    if (node.type !== 'split') return;
    node.sizes = node.children.map(() => 100 / node.children.length);
    node.children.forEach(equalizeNode);
  }

  function countSeparators(node) {
    if (node.type !== 'split') return 0;
    return Math.max(0, node.children.length - 1) + node.children.reduce((sum, child) => sum + countSeparators(child), 0);
  }

  const initialLayout = buildPresetLayout('3x2', { resetIds: true });
  const initialEntries = getLeafEntries(initialLayout);
  Object.assign(initialEntries[0].node.measurement, { width: '32', widthFraction: '1/4', height: '48', heightFraction: '1/2', thickness: '1', thicknessFraction: '0' });
  Object.assign(initialEntries[2].node.measurement, { width: '31', widthFraction: '7/8', height: '48', heightFraction: '1/2', thickness: '1', thicknessFraction: '0' });

  const initialSnapshot = {
    layout: clone(initialLayout),
    selectedPaneId: initialEntries[1].node.id,
    activePreset: '3x2',
    topologyPreset: '3x2',
    paneSequence,
    splitSequence,
  };

  const state = {
    layout: initialLayout,
    selectedPaneId: initialSnapshot.selectedPaneId,
    activePreset: initialSnapshot.activePreset,
    topologyPreset: initialSnapshot.topologyPreset,
  };

  function directionIconMarkup(axis) {
    const path = axis === 'vertical'
      ? '<path d="M4 12h16M7.5 8.5 4 12l3.5 3.5M16.5 8.5 20 12l-3.5 3.5"/>'
      : '<path d="M12 4v16M8.5 7.5 12 4l3.5 3.5M8.5 16.5 12 20l3.5-3.5"/>';
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  }

  function checkIconMarkup() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 12.5 4 4L18.5 8"/></svg>';
  }

  function formattedDimension(whole, fraction) {
    const parts = [whole, fraction].filter((value) => value !== '' && value !== '0');
    return parts.length ? parts.join(' ') : whole === '0' ? '0' : '';
  }

  function paneSummary(pane) {
    const value = pane.measurement;
    const width = formattedDimension(value.width, value.widthFraction);
    const height = formattedDimension(value.height, value.heightFraction);
    const thickness = formattedDimension(value.thickness, value.thicknessFraction);
    if (!width && !height && !thickness) return '';
    return `${width || '—'} × ${height || '—'} × ${thickness || '—'} po`;
  }

  function paneIsComplete(pane) {
    const value = pane.measurement;
    return Boolean(
      formattedDimension(value.width, value.widthFraction)
      && formattedDimension(value.height, value.heightFraction)
      && formattedDimension(value.thickness, value.thicknessFraction)
    );
  }

  function paneHasData(pane) {
    const hasMeasurement = Object.values(pane.measurement).some((value) => value === true || (typeof value === 'string' && value !== ''));
    return hasMeasurement || pane.decorative.vertical > 0 || pane.decorative.horizontal > 0;
  }

  function layoutHasData() {
    return getLeafEntries(state.layout).some(({ node }) => paneHasData(node));
  }

  function displayIndexMap(entries = getLeafEntries(state.layout)) {
    return new Map(entries.map(({ node }, index) => [node.id, index + 1]));
  }

  function selectedDisplayLabel() {
    return `T${displayIndexMap().get(state.selectedPaneId) || 1}`;
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
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  function renderDecorativeLines(element, pane) {
    for (let index = 0; index < pane.decorative.vertical; index += 1) {
      const line = document.createElement('span');
      line.className = 'decorative-line decorative-line-v';
      line.style.left = `${((index + 1) / (pane.decorative.vertical + 1)) * 100}%`;
      element.appendChild(line);
    }
    for (let index = 0; index < pane.decorative.horizontal; index += 1) {
      const line = document.createElement('span');
      line.className = 'decorative-line decorative-line-h';
      line.style.top = `${((index + 1) / (pane.decorative.horizontal + 1)) * 100}%`;
      element.appendChild(line);
    }
  }

  function renderNode(node, indexes) {
    if (node.type === 'pane') {
      const index = indexes.get(node.id);
      const pane = document.createElement('button');
      pane.type = 'button';
      pane.className = 'pane';
      pane.dataset.paneId = node.id;
      pane.setAttribute('aria-pressed', String(node.id === state.selectedPaneId));
      pane.setAttribute('aria-label', `Thermos T${index}. Ouvrir largeur, hauteur et épaisseur.`);
      const summary = paneSummary(node);
      pane.innerHTML = `${summary ? `<span class="pane-value">${summary}</span>` : ''}<span class="pane-code">T${index}</span><span class="pane-hint">Toucher pour mesurer</span>`;
      renderDecorativeLines(pane, node);
      pane.addEventListener('click', () => openPane(node.id));
      return pane;
    }

    const split = document.createElement('div');
    split.className = 'layout-split';
    split.dataset.axis = node.axis;
    split.dataset.splitId = node.id;

    node.children.forEach((child, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'layout-child';
      wrapper.dataset.childIndex = String(index);
      wrapper.style.flex = `${node.sizes[index]} 1 0px`;
      wrapper.appendChild(renderNode(child, indexes));
      split.appendChild(wrapper);
    });

    node.children.slice(0, -1).forEach((_, index) => {
      const handle = document.createElement('div');
      handle.className = 'divider-handle';
      handle.dataset.splitId = node.id;
      handle.dataset.dividerIndex = String(index);
      handle.tabIndex = 0;
      handle.innerHTML = directionIconMarkup(node.axis);
      handle.setAttribute('role', 'separator');
      handle.setAttribute('aria-orientation', node.axis);
      handle.setAttribute('aria-label', `${node.axis === 'vertical' ? 'Séparation verticale' : 'Séparation horizontale'} ${index + 1}`);
      handle.title = node.axis === 'vertical' ? 'Glisser à gauche ou à droite' : 'Glisser vers le haut ou le bas';
      handle.addEventListener('pointerdown', (event) => startDividerDrag(event, node.id, index));
      handle.addEventListener('keydown', (event) => moveDividerWithKeyboard(event, node.id, index));
      split.appendChild(handle);
    });
    return split;
  }

  function renderLayout() {
    const entries = getLeafEntries(state.layout);
    if (!entries.some(({ node }) => node.id === state.selectedPaneId)) state.selectedPaneId = entries[0]?.node.id || null;
    const indexes = displayIndexMap(entries);
    canvas.innerHTML = '';
    canvas.removeAttribute('data-orientation');
    canvas.appendChild(renderNode(state.layout, indexes));
    renderPaneStrip(entries, indexes);
    renderSummaryList(entries, indexes);
    renderProgressSteps(entries, indexes);
    updateLayoutMeta(entries, indexes);
    syncDecorativeCounters();
    requestAnimationFrame(positionDividerHandles);
  }

  function renderPaneStrip(entries, indexes) {
    document.querySelectorAll('[data-pane-strip]').forEach((strip) => {
      strip.innerHTML = '';
      entries.forEach(({ node }) => {
        const index = indexes.get(node.id);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'pane-pill';
        button.setAttribute('aria-pressed', String(node.id === state.selectedPaneId));
        button.setAttribute('aria-label', `Sélectionner le thermos T${index}`);
        button.textContent = paneIsComplete(node) ? `T${index} ✓` : `T${index} •`;
        button.addEventListener('click', () => selectPane(node.id));
        strip.appendChild(button);
      });
    });
  }

  function renderSummaryList(entries, indexes) {
    document.querySelectorAll('[data-summary-list]').forEach((list) => {
      list.innerHTML = '';
      entries.forEach(({ node }) => {
        const complete = paneIsComplete(node);
        const row = document.createElement('div');
        row.className = `summary-row${complete ? '' : ' pending'}`;
        row.innerHTML = `<code>T${indexes.get(node.id)}</code><small>${complete ? 'Mesuré' : 'À compléter'}</small><span class="state"></span>`;
        list.appendChild(row);
      });
    });
  }

  function renderProgressSteps(entries, indexes) {
    document.querySelectorAll('[data-progress-steps]').forEach((progress) => {
      progress.innerHTML = '';
      entries.forEach(({ node }, entryIndex) => {
        const index = indexes.get(node.id);
        const complete = paneIsComplete(node);
        const current = node.id === state.selectedPaneId;
        const step = document.createElement('button');
        step.type = 'button';
        step.className = `progress-step${complete ? ' is-complete' : ''}${current ? ' is-current' : ''}${entryIndex === entries.length - 1 ? ' is-last' : ''}`;
        step.setAttribute('aria-label', `T${index}, ${complete ? 'mesuré' : 'à mesurer'}${current ? ', sélectionné' : ''}`);
        if (current) step.setAttribute('aria-current', 'step');
        const marker = document.createElement('span');
        marker.className = 'progress-node';
        marker.innerHTML = complete ? checkIconMarkup() : String(index);
        const label = document.createElement('span');
        label.className = 'progress-label';
        label.textContent = `T${index}`;
        step.append(marker, label);
        step.addEventListener('click', () => openPane(node.id));
        progress.appendChild(step);
      });
    });
  }

  function layoutSummary(entries) {
    const preset = PRESETS[state.activePreset];
    if (!preset) return `Disposition personnalisée · ${entries.length} thermos`;
    const columnLabel = preset.columns > 1 ? 'colonnes' : 'colonne';
    const rowLabel = preset.rows > 1 ? 'rangées' : 'rangée';
    return `${preset.columns} ${columnLabel} × ${preset.rows} ${rowLabel} · ${entries.length} thermos`;
  }

  function updateLayoutMeta(entries = getLeafEntries(state.layout), indexes = displayIndexMap(entries)) {
    const completed = entries.filter(({ node }) => paneIsComplete(node)).length;
    const selectedLabel = `T${indexes.get(state.selectedPaneId) || 1}`;
    document.querySelectorAll('[data-pane-count-output]').forEach((output) => { output.textContent = String(entries.length); });
    document.querySelectorAll('[data-complete-pane-output]').forEach((output) => { output.textContent = String(completed); });
    document.querySelectorAll('[data-progress-label]').forEach((progress) => { progress.setAttribute('aria-label', `${completed} thermos sur ${entries.length} mesurés`); });
    document.querySelectorAll('[data-divider-count-output]').forEach((output) => { output.textContent = String(countSeparators(state.layout)); });
    document.querySelectorAll('[data-layout-summary]').forEach((output) => { output.textContent = layoutSummary(entries); });
    document.querySelectorAll('[data-selected-pane-output]').forEach((output) => { output.textContent = selectedLabel; });
    document.querySelectorAll('[data-layout-preset]').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.layoutPreset === state.activePreset)); });
    document.querySelectorAll('[data-direction-icon]').forEach((icon) => { icon.innerHTML = directionIconMarkup(icon.dataset.directionIcon); });
    document.querySelectorAll('[data-split-selected]').forEach((button) => {
      const atMaximum = entries.length >= MAX_PANES;
      button.disabled = atMaximum || !state.selectedPaneId;
      const action = button.dataset.splitSelected === 'vertical' ? 'côte à côte' : 'superposés';
      button.setAttribute('aria-label', atMaximum ? `Maximum de ${MAX_PANES} thermos atteint` : `Diviser ${selectedLabel} en deux thermos ${action}`);
    });
  }

  function directChildren(element, className) {
    return [...element.children].filter((child) => child.classList.contains(className));
  }

  function splitElement(id) {
    return canvas.querySelector(`.layout-split[data-split-id="${id}"]`);
  }

  function availableAxisPixels(element, node) {
    const style = getComputedStyle(element);
    const gap = Number.parseFloat(style.gap) || 0;
    const axis = node.axis === 'vertical' ? element.clientWidth : element.clientHeight;
    return Math.max(1, axis - gap * Math.max(0, node.children.length - 1));
  }

  function minimumChildWeight(element, node) {
    const total = node.sizes.reduce((sum, size) => sum + size, 0) || 100;
    const desired = (MIN_CHILD_PX / availableAxisPixels(element, node)) * total;
    return Math.min(total / node.children.length * .78, Math.max(total * .04, desired));
  }

  function applySplitSizes(element, node) {
    directChildren(element, 'layout-child').forEach((child, index) => {
      child.style.flex = `${node.sizes[index]} 1 0px`;
    });
  }

  function moveSplitDividerTo(splitId, dividerIndex, requestedBoundary) {
    const node = findNode(state.layout, splitId);
    const element = splitElement(splitId);
    if (!node || node.type !== 'split' || !element) return;
    const minimum = minimumChildWeight(element, node);
    const previousBoundary = node.sizes.slice(0, dividerIndex).reduce((sum, size) => sum + size, 0);
    const currentBoundary = previousBoundary + node.sizes[dividerIndex];
    const nextBoundary = currentBoundary + node.sizes[dividerIndex + 1];
    const boundary = Math.min(nextBoundary - minimum, Math.max(previousBoundary + minimum, requestedBoundary));
    const linkedNodes = node.linkId ? findLinkedSplits(state.layout, node.linkId) : [node];
    linkedNodes.forEach((linkedNode) => {
      const linkedPrevious = linkedNode.sizes.slice(0, dividerIndex).reduce((sum, size) => sum + size, 0);
      const linkedCurrent = linkedPrevious + linkedNode.sizes[dividerIndex];
      const delta = boundary - linkedCurrent;
      linkedNode.sizes[dividerIndex] = Math.round((linkedNode.sizes[dividerIndex] + delta) * 1000) / 1000;
      linkedNode.sizes[dividerIndex + 1] = Math.round((linkedNode.sizes[dividerIndex + 1] - delta) * 1000) / 1000;
      const linkedElement = splitElement(linkedNode.id);
      if (linkedElement) applySplitSizes(linkedElement, linkedNode);
    });
    state.activePreset = 'custom';
    updateLayoutMeta();
    positionDividerHandles();
    markDirty();
  }

  function positionDividerHandles() {
    canvas.querySelectorAll('.layout-split[data-split-id]').forEach((element) => {
      const node = findNode(state.layout, element.dataset.splitId);
      if (!node || node.type !== 'split') return;
      const children = directChildren(element, 'layout-child');
      const handles = directChildren(element, 'divider-handle');
      const elementRect = element.getBoundingClientRect();
      const minimum = minimumChildWeight(element, node);
      const total = node.sizes.reduce((sum, size) => sum + size, 0) || 100;
      handles.forEach((handle, index) => {
        const currentRect = children[index]?.getBoundingClientRect();
        const nextRect = children[index + 1]?.getBoundingClientRect();
        if (!currentRect || !nextRect) return;
        if (node.axis === 'vertical') {
          handle.style.left = `${((currentRect.right + nextRect.left) / 2) - elementRect.left}px`;
          handle.style.top = `${elementRect.height / 2}px`;
        } else {
          handle.style.left = `${elementRect.width / 2}px`;
          handle.style.top = `${((currentRect.bottom + nextRect.top) / 2) - elementRect.top}px`;
        }
        const previous = node.sizes.slice(0, index).reduce((sum, size) => sum + size, 0);
        const boundary = previous + node.sizes[index];
        const next = boundary + node.sizes[index + 1];
        handle.setAttribute('aria-valuemin', String(Math.round(((previous + minimum) / total) * 100)));
        handle.setAttribute('aria-valuemax', String(Math.round(((next - minimum) / total) * 100)));
        handle.setAttribute('aria-valuenow', String(Math.round((boundary / total) * 100)));
        handle.setAttribute('aria-valuetext', `${Math.round((boundary / total) * 100)} %`);
      });
    });
  }

  function startDividerDrag(event, splitId, dividerIndex) {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const node = findNode(state.layout, splitId);
    const element = splitElement(splitId);
    if (!node || node.type !== 'split' || !element) return;
    const handle = event.currentTarget;
    handle.classList.add('is-dragging');
    handle.focus({ preventScroll: true });
    handle.setPointerCapture?.(event.pointerId);
    const startCoordinate = node.axis === 'vertical' ? event.clientX : event.clientY;
    const startSizes = [...node.sizes];
    const startBoundary = startSizes.slice(0, dividerIndex + 1).reduce((sum, size) => sum + size, 0);
    const total = startSizes.reduce((sum, size) => sum + size, 0) || 100;
    const availablePixels = availableAxisPixels(element, node);

    const move = (moveEvent) => {
      const coordinate = node.axis === 'vertical' ? moveEvent.clientX : moveEvent.clientY;
      moveSplitDividerTo(splitId, dividerIndex, startBoundary + ((coordinate - startCoordinate) / availablePixels) * total);
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

  function moveDividerWithKeyboard(event, splitId, dividerIndex) {
    const node = findNode(state.layout, splitId);
    const element = splitElement(splitId);
    if (!node || node.type !== 'split' || !element) return;
    const previousKey = node.axis === 'vertical' ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = node.axis === 'vertical' ? 'ArrowRight' : 'ArrowDown';
    if (![previousKey, nextKey, 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const previous = node.sizes.slice(0, dividerIndex).reduce((sum, size) => sum + size, 0);
    const current = previous + node.sizes[dividerIndex];
    const next = current + node.sizes[dividerIndex + 1];
    const minimum = minimumChildWeight(element, node);
    if (event.key === 'Home') return moveSplitDividerTo(splitId, dividerIndex, previous + minimum);
    if (event.key === 'End') return moveSplitDividerTo(splitId, dividerIndex, next - minimum);
    const direction = event.key === previousKey ? -1 : 1;
    moveSplitDividerTo(splitId, dividerIndex, current + direction * (event.shiftKey ? 5 : 1));
  }

  function syncDecorativeCounters() {
    const pane = findNode(state.layout, state.selectedPaneId);
    document.querySelectorAll('[data-counter]').forEach((counter) => {
      const output = counter.querySelector('output');
      if (output) output.textContent = String(pane?.decorative?.[counter.dataset.counter] || 0);
    });
  }

  function fillSheet(paneId) {
    const pane = findNode(state.layout, paneId);
    if (!pane || pane.type !== 'pane') return;
    const label = `T${displayIndexMap().get(paneId) || 1}`;
    document.querySelectorAll('[data-active-pane]').forEach((node) => { node.textContent = label; });
    sheet.querySelectorAll('[data-measure-key]').forEach((field) => {
      const value = pane.measurement[field.dataset.measureKey];
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else field.value = value ?? '';
    });
    syncDecorativeCounters();
  }

  function selectPane(paneId) {
    state.selectedPaneId = paneId;
    renderLayout();
    fillSheet(paneId);
  }

  function openPane(paneId) {
    lastFocusedPaneId = paneId;
    state.selectedPaneId = paneId;
    renderLayout();
    fillSheet(paneId);
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
    const paneId = lastFocusedPaneId;
    requestAnimationFrame(() => canvas.querySelector(`.pane[data-pane-id="${paneId}"]`)?.focus({ preventScroll: true }));
  }

  function applyPreset(key, { detected = false } = {}) {
    const preset = PRESETS[key];
    if (!preset) return false;
    if (state.activePreset === key) {
      showToast(`La disposition ${key.replace('x', ' × ')} est déjà active.`);
      return false;
    }
    if (layoutHasData() && !window.confirm('Changer la disposition effacera les mesures de cette fenêtre. Continuer?')) return false;
    state.layout = buildPresetLayout(key, { resetIds: true });
    state.selectedPaneId = getLeafEntries(state.layout)[0].node.id;
    state.activePreset = key;
    state.topologyPreset = key;
    closeSheet();
    renderLayout();
    fillSheet(state.selectedPaneId);
    markDirty();
    showToast(detected
      ? `${preset.columns} colonnes × ${preset.rows} rangées détectées. ${preset.columns * preset.rows} thermos à mesurer.`
      : `Disposition ${preset.columns} × ${preset.rows} créée. ${preset.columns * preset.rows} thermos à mesurer.`);
    return true;
  }

  function splitSelectedPane(axis) {
    const entries = getLeafEntries(state.layout);
    if (entries.length >= MAX_PANES) {
      showToast(`Maximum de ${MAX_PANES} thermos atteint.`, 'warning');
      return;
    }
    const pane = findNode(state.layout, state.selectedPaneId);
    if (!pane || pane.type !== 'pane') return;
    const oldLabel = selectedDisplayLabel();
    const paneElement = canvas.querySelector(`.pane[data-pane-id="${pane.id}"]`);
    const paneRect = paneElement?.getBoundingClientRect();
    const availableAxis = axis === 'vertical' ? paneRect?.width : paneRect?.height;
    if (availableAxis && (availableAxis - 4) / 2 < MIN_SPLIT_PX) {
      showToast(`${oldLabel} est trop petit pour être divisé dans ce sens sur cet écran.`, 'warning');
      return;
    }
    if (paneHasData(pane) && !window.confirm(`Les mesures de ${oldLabel} seront effacées pour créer deux nouveaux thermos. Continuer?`)) return;

    const firstPane = { type: 'pane', id: pane.id, measurement: blankMeasurement(), decorative: { vertical: 0, horizontal: 0 } };
    const secondPane = createPane();
    const replacement = createSplit(axis, [firstPane, secondPane]);
    state.layout = replaceNode(state.layout, pane.id, replacement);
    state.selectedPaneId = firstPane.id;
    state.activePreset = 'custom';
    state.topologyPreset = null;
    renderLayout();
    fillSheet(state.selectedPaneId);
    markDirty();
    showToast(`${oldLabel} a été divisé en deux thermos ${axis === 'vertical' ? 'côte à côte' : 'superposés'}.`);
  }

  function equalizeLayout() {
    equalizeNode(state.layout);
    state.activePreset = state.topologyPreset || 'custom';
    renderLayout();
    markDirty();
    showToast('Toutes les divisions ont été réparties également.');
  }

  function resetDrawing() {
    if (!window.confirm('Revenir à la disposition et aux mesures initiales?')) return;
    state.layout = clone(initialSnapshot.layout);
    state.selectedPaneId = initialSnapshot.selectedPaneId;
    state.activePreset = initialSnapshot.activePreset;
    state.topologyPreset = initialSnapshot.topologyPreset;
    paneSequence = initialSnapshot.paneSequence;
    splitSequence = initialSnapshot.splitSequence;
    closeSheet();
    renderLayout();
    markDirty();
    showToast('Disposition et mesures initiales rétablies.');
  }

  sheet.querySelectorAll('[data-measure-key]').forEach((field) => {
    if (field.tagName === 'SELECT' && field.dataset.measureKey?.endsWith('Fraction') && !field.options.length) {
      fractions.forEach((fraction) => field.add(new Option(fraction || 'Fraction', fraction)));
    }
    const update = () => {
      const pane = findNode(state.layout, state.selectedPaneId);
      if (!pane || pane.type !== 'pane') return;
      pane.measurement[field.dataset.measureKey] = field.type === 'checkbox' ? field.checked : field.value;
      renderLayout();
      markDirty();
    };
    field.addEventListener(field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input', update);
  });

  document.querySelectorAll('[data-close-sheet]').forEach((button) => button.addEventListener('click', closeSheet));
  sheet.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeSheet(); });
  document.querySelectorAll('[data-layout-preset]').forEach((button) => button.addEventListener('click', () => applyPreset(button.dataset.layoutPreset)));
  document.querySelectorAll('[data-split-selected]').forEach((button) => button.addEventListener('click', () => splitSelectedPane(button.dataset.splitSelected)));
  document.querySelectorAll('[data-equalize]').forEach((button) => button.addEventListener('click', equalizeLayout));
  document.querySelectorAll('[data-reset]').forEach((button) => button.addEventListener('click', resetDrawing));

  document.querySelectorAll('[data-counter]').forEach((counter) => {
    const key = counter.dataset.counter;
    counter.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
      const pane = findNode(state.layout, state.selectedPaneId);
      if (!pane || pane.type !== 'pane') return;
      pane.decorative[key] = Math.max(0, Math.min(8, pane.decorative[key] + Number(button.dataset.delta)));
      renderLayout();
      markDirty();
    }));
  });

  document.querySelectorAll('[data-photo]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.window-stage').forEach((stage) => stage.classList.add('has-photo'));
    document.querySelectorAll('[data-detect]').forEach((detect) => { detect.disabled = false; });
    button.textContent = 'Changer la photo';
    showToast('Photo ajoutée. La détection peut maintenant proposer la disposition.');
  }));

  document.querySelectorAll('[data-detect]').forEach((button) => button.addEventListener('click', () => applyPreset('3x2', { detected: true })));

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
    const pane = findNode(state.layout, state.selectedPaneId);
    if (!pane || pane.type !== 'pane') return;
    getLeafEntries(state.layout).forEach(({ node }) => { node.measurement = clone(pane.measurement); });
    renderLayout();
    showToast(`Mesures de ${selectedDisplayLabel()} appliquées aux ${getLeafEntries(state.layout).length} thermos.`);
  }));

  if ('ResizeObserver' in window) new ResizeObserver(() => requestAnimationFrame(positionDividerHandles)).observe(canvas);

  window.__vosthermosGridPrototype = {
    snapshot: () => clone({
      layout: state.layout,
      selectedPaneId: state.selectedPaneId,
      activePreset: state.activePreset,
      leaves: getLeafEntries(state.layout).map(({ node }) => node.id),
    }),
  };

  renderLayout();
})();
