(() => {
  const prototypeRoot = document.querySelector('.prototype');
  const windowList = document.querySelector('[data-window-list]');
  const windowTemplate = document.querySelector('template[data-window-template]');
  const addWindowButton = document.querySelector('[data-add-window]');
  const sheet = document.querySelector('[data-measure-sheet]');
  const paneActionModal = document.querySelector('[data-pane-action-modal]');
  const windowRenameModal = document.querySelector('[data-window-rename-modal]');
  const windowRenameForm = document.querySelector('[data-window-rename-form]');
  const windowRenameInput = document.querySelector('[data-window-rename-input]');
  const windowRenameError = document.querySelector('[data-window-rename-error]');
  const toast = document.querySelector('[data-toast]');
  if (!prototypeRoot || !windowList || !windowTemplate || !sheet || !paneActionModal || !windowRenameModal || !windowRenameForm || !windowRenameInput) return;

  const MAX_PANES = 12;
  const MIN_CHILD_PX = 52;
  const PRESETS = {
    '1x1': { columns: 1, rows: 1, label: 'Vitre simple' },
    '2x1-narrow-left': { columns: 2, rows: 1, sizes: [34, 66], label: 'Petite vitre à gauche', summary: 'Petite vitre à gauche' },
    '2x1': { columns: 2, rows: 1, label: 'Deux égaux' },
    '1x2': { columns: 1, rows: 2, label: 'Deux superposés' },
    '3x1': { columns: 3, rows: 1, label: 'Trois côte à côte' },
    '2x2': { columns: 2, rows: 2, label: 'Quatre égaux' },
    '3x2': { columns: 3, rows: 2, label: 'Six égaux' },
    '3x3': { columns: 3, rows: 3, label: 'Neuf égaux' },
    'top-3-bottom-1': { layout: 'top-3-bottom-1', label: 'Trois en haut', summary: '3 en haut, 1 en bas' },
    'top-1-bottom-3': { layout: 'top-1-bottom-3', label: 'Trois en bas', summary: '1 en haut, 3 en bas' },
    'left-1-right-3': { layout: 'left-1-right-3', label: 'Grand à gauche', summary: 'Grand à gauche, 3 à droite' },
    'left-3-right-1': { layout: 'left-3-right-1', label: 'Grand à droite', summary: '3 à gauche, grand à droite' },
  };
  const fractions = ['', '0', '1/16', '1/8', '3/16', '1/4', '5/16', '3/8', '7/16', '1/2', '9/16', '5/8', '11/16', '3/4', '13/16', '7/8', '15/16'];
  const controllers = [];
  const controllerById = new Map();
  let windowSequence = 0;
  let activeWindowId = null;
  let toastTimer;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function blankMeasurement() {
    return {
      width: '', widthFraction: '', height: '', heightFraction: '', thickness: '', thicknessFraction: '',
      lowE: false, argon: false, tempered: false, laminated: false,
      spacer: '', glazing: '', access: '', notes: '',
    };
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
    if (root.displayOrder === 'tree') return entries;
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

  function linkedHandleOwners(root, owners = new Map()) {
    if (!root || root.type !== 'split') return owners;
    if (root.linkId && !owners.has(root.linkId)) owners.set(root.linkId, root.id);
    root.children.forEach((child) => linkedHandleOwners(child, owners));
    return owners;
  }

  function replaceNode(root, id, replacement) {
    if (root.id === id) return replacement;
    if (root.type === 'split') root.children = root.children.map((child) => replaceNode(child, id, replacement));
    return root;
  }

  function equalizeNode(node) {
    if (node.type !== 'split') return;
    node.sizes = node.children.map(() => 100 / node.children.length);
    node.children.forEach(equalizeNode);
  }

  function countSeparators(node, countedLinks = new Set()) {
    if (node.type !== 'split') return 0;
    const countOwn = !node.linkId || !countedLinks.has(node.linkId);
    if (node.linkId) countedLinks.add(node.linkId);
    return (countOwn ? Math.max(0, node.children.length - 1) : 0)
      + node.children.reduce((sum, child) => sum + countSeparators(child, countedLinks), 0);
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
    return (width || '—') + ' × ' + (height || '—') + ' × ' + (thickness || '—') + ' po';
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

  function directionIconMarkup(axis) {
    const path = axis === 'vertical'
      ? '<path d="M4 12h16M7.5 8.5 4 12l3.5 3.5M16.5 8.5 20 12l-3.5 3.5"/>'
      : '<path d="M12 4v16M8.5 7.5 12 4l3.5 3.5M8.5 16.5 12 20l3.5-3.5"/>';
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }

  function checkIconMarkup() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 12.5 4 4L18.5 8"/></svg>';
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

  function updateDossierProgress() {
    const items = [];
    controllers.forEach((controller) => {
      const entries = controller.getEntries();
      const indexes = controller.getDisplayIndexMap(entries);
      entries.forEach(({ node }) => {
        items.push({
          controller,
          pane: node,
          index: indexes.get(node.id),
          complete: paneIsComplete(node),
        });
      });
    });
    const completed = items.filter((item) => item.complete).length;
    document.querySelectorAll('[data-dossier-complete-output]').forEach((node) => { node.textContent = String(completed); });
    document.querySelectorAll('[data-dossier-pane-output]').forEach((node) => { node.textContent = String(items.length); });
    document.querySelectorAll('[data-dossier-progress-label]').forEach((node) => {
      node.setAttribute('aria-label', completed + ' thermos sur ' + items.length + ' mesurés dans le dossier');
    });
    document.querySelectorAll('[data-dossier-progress-steps]').forEach((progress) => {
      progress.innerHTML = '';
      items.forEach((item, itemIndex) => {
        const current = item.controller.id === activeWindowId && item.controller.state.selectedPaneId === item.pane.id;
        const step = document.createElement('button');
        step.type = 'button';
        step.className = 'progress-step' + (item.complete ? ' is-complete' : '') + (current ? ' is-current' : '') + (itemIndex === items.length - 1 ? ' is-last' : '');
        step.setAttribute('aria-label', item.controller.state.code + ' T' + item.index + ', ' + (item.complete ? 'mesuré' : 'à mesurer'));
        if (current) step.setAttribute('aria-current', 'step');
        const marker = document.createElement('span');
        marker.className = 'progress-node';
        marker.innerHTML = item.complete ? checkIconMarkup() : String(item.index);
        const label = document.createElement('span');
        label.className = 'progress-label';
        label.textContent = item.controller.state.code + ' T' + item.index;
        step.append(marker, label);
        step.addEventListener('click', () => item.controller.openPaneActions(item.pane.id));
        progress.appendChild(step);
      });
    });
  }

  const interaction = {
    controller: null,
    paneId: null,
    axis: null,
    count: 2,
    mode: null,
    lastFocusedElement: null,
  };

  function activateController(controller) {
    if (!controller) return;
    if (interaction.controller && interaction.controller !== controller) {
      if (!paneActionModal.hidden) closePaneActions({ restoreFocus: false });
      if (!sheet.hidden) closeSheet({ restoreFocus: false });
      if (!windowRenameModal.hidden) closeWindowRenameModal({ restoreFocus: false });
    }
    activeWindowId = controller.id;
    controllers.forEach((item) => {
      item.root.classList.toggle('is-active', item.id === activeWindowId);
      item.root.setAttribute('aria-current', item.id === activeWindowId ? 'true' : 'false');
    });
    updateDossierProgress();
  }

  function focusInteractionPane() {
    const controller = interaction.controller;
    const paneId = interaction.paneId;
    requestAnimationFrame(() => {
      if (interaction.lastFocusedElement?.isConnected) interaction.lastFocusedElement.focus({ preventScroll: true });
      else controller?.focusPane(paneId);
    });
  }

  function fillSharedSheet(controller, paneId) {
    const pane = controller?.getPane(paneId);
    if (!pane) return;
    const label = controller.getPaneLabel(paneId);
    sheet.querySelectorAll('[data-sheet-pane], [data-active-pane]').forEach((node) => { node.textContent = label; });
    sheet.querySelectorAll('[data-sheet-window], [data-window-code]').forEach((node) => { node.textContent = controller.state.code; });
    sheet.querySelectorAll('[data-measure-key]').forEach((field) => {
      const value = pane.measurement[field.dataset.measureKey];
      if (field.type === 'checkbox') field.checked = Boolean(value);
      else field.value = value ?? '';
    });
  }

  function updatePaneActionModal() {
    const controller = interaction.controller;
    const pane = controller?.getPane(interaction.paneId);
    if (!controller || !pane) return;
    const entries = controller.getEntries();
    const label = controller.getPaneLabel(pane.id);
    const resultingTotal = entries.length + interaction.count - 1;
    const exceedsMaximum = resultingTotal > MAX_PANES;
    const direction = interaction.axis === 'vertical' ? 'côte à côte' : 'superposés';
    paneActionModal.querySelectorAll('[data-pane-action-label]').forEach((output) => { output.textContent = controller.state.code + ' · ' + label; });
    paneActionModal.querySelectorAll('[data-modal-axis]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.modalAxis === interaction.axis));
    });
    paneActionModal.querySelectorAll('[data-section-count]').forEach((button) => {
      const count = Number(button.dataset.sectionCount);
      button.disabled = entries.length + count - 1 > MAX_PANES;
      button.setAttribute('aria-pressed', String(count === interaction.count));
      button.setAttribute('aria-label', button.disabled ? count + ' sections dépasseraient le maximum de ' + MAX_PANES + ' thermos' : count + ' sections');
    });
    const result = paneActionModal.querySelector('[data-pane-action-result]');
    if (result) {
      if (exceedsMaximum) result.textContent = 'Cette division créerait ' + resultingTotal + ' thermos; maximum ' + MAX_PANES + '.';
      else if (!interaction.axis) result.textContent = 'Choisissez vertical ou horizontal.';
      else result.textContent = label + ' deviendra ' + interaction.count + ' thermos ' + direction + '.';
    }
    const warning = paneActionModal.querySelector('[data-pane-action-warning]');
    if (warning) {
      warning.hidden = !paneHasData(pane);
      warning.textContent = paneHasData(pane) ? 'Les mesures et options actuelles de ' + label + ' seront effacées.' : '';
    }
    const createButton = paneActionModal.querySelector('[data-create-sections]');
    if (createButton) {
      createButton.disabled = !interaction.axis || exceedsMaximum;
      createButton.textContent = !interaction.axis
        ? 'Choisir vertical ou horizontal'
        : paneHasData(pane)
          ? 'Créer ' + interaction.count + ' sections et effacer les données'
          : 'Créer ' + interaction.count + ' sections';
    }
  }

  function closePaneActions({ restoreFocus = true } = {}) {
    paneActionModal.hidden = true;
    prototypeRoot.inert = false;
    document.body.classList.remove('pane-action-open');
    if (interaction.mode === 'action') interaction.mode = null;
    if (restoreFocus) focusInteractionPane();
  }

  function closeSheet({ restoreFocus = true } = {}) {
    sheet.classList.remove('is-open');
    sheet.hidden = true;
    document.body.classList.remove('measure-open');
    if (interaction.mode === 'measure') interaction.mode = null;
    if (restoreFocus) focusInteractionPane();
  }

  function closeWindowRenameModal({ restoreFocus = true } = {}) {
    const focusTarget = interaction.lastFocusedElement;
    const controller = interaction.controller;
    windowRenameModal.hidden = true;
    document.body.classList.remove('window-rename-open');
    if (interaction.mode === 'rename') {
      interaction.mode = null;
      prototypeRoot.inert = false;
    }
    if (!restoreFocus) return;
    requestAnimationFrame(() => {
      if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
      else controller?.root.focus({ preventScroll: true });
    });
  }

  function openWindowRenameModal(controller) {
    if (!controller) return;
    if (!paneActionModal.hidden) closePaneActions({ restoreFocus: false });
    if (!sheet.hidden) closeSheet({ restoreFocus: false });
    activateController(controller);
    interaction.controller = controller;
    interaction.paneId = null;
    interaction.mode = 'rename';
    interaction.lastFocusedElement = document.activeElement;
    windowRenameInput.value = controller.state.name;
    if (windowRenameError) {
      windowRenameError.hidden = true;
      windowRenameError.textContent = '';
    }
    windowRenameModal.querySelectorAll('[data-window-rename-code]').forEach((node) => { node.textContent = controller.state.code; });
    windowRenameModal.hidden = false;
    prototypeRoot.inert = true;
    document.body.classList.add('window-rename-open');
    requestAnimationFrame(() => {
      windowRenameInput.focus();
      windowRenameInput.select();
    });
  }

  function openPaneActions(controller, paneId) {
    const pane = controller.getPane(paneId);
    if (!pane) return;
    if (!sheet.hidden) closeSheet({ restoreFocus: false });
    activateController(controller);
    interaction.controller = controller;
    interaction.paneId = paneId;
    interaction.axis = null;
    interaction.count = 2;
    interaction.mode = 'action';
    interaction.lastFocusedElement = document.activeElement;
    controller.selectPane(paneId);
    paneActionModal.hidden = false;
    prototypeRoot.inert = true;
    document.body.classList.add('pane-action-open');
    updatePaneActionModal();
    requestAnimationFrame(() => paneActionModal.querySelector('[data-open-pane-measure]')?.focus());
  }

  function openMeasureSheet(controller, paneId) {
    if (!controller.getPane(paneId)) return;
    closePaneActions({ restoreFocus: false });
    activateController(controller);
    interaction.controller = controller;
    interaction.paneId = paneId;
    interaction.mode = 'measure';
    controller.selectPane(paneId);
    fillSharedSheet(controller, paneId);
    sheet.hidden = false;
    sheet.classList.add('is-open');
    document.body.classList.add('measure-open');
    const firstInput = sheet.querySelector('[data-measure-key="width"]');
    firstInput?.focus();
    firstInput?.select();
  }

  const interactionService = {
    activate: activateController,
    openPaneActions,
    openMeasureSheet,
    closeFor(controller) {
      if (interaction.controller !== controller) return;
      closePaneActions({ restoreFocus: false });
      closeSheet({ restoreFocus: false });
    },
    refresh(controller) {
      if (interaction.controller === controller && interaction.mode === 'action' && !paneActionModal.hidden) updatePaneActionModal();
    },
    isActive(controller) {
      return controller?.id === activeWindowId;
    },
  };

  function createWindowController(root, seed) {
    const canvas = root.querySelector('[data-window-canvas]');
    if (!canvas) return null;
    let paneSequence = 0;
    let splitSequence = 0;
    let renderVersion = 0;
    let api;

    root.dataset.windowId = seed.id;
    root.tabIndex = root.tabIndex >= 0 ? root.tabIndex : -1;

    function createPane(measurement = blankMeasurement()) {
      paneSequence += 1;
      return {
        type: 'pane',
        id: seed.id + '-p' + paneSequence,
        measurement: { ...blankMeasurement(), ...measurement },
        decorative: { vertical: 0, horizontal: 0 },
      };
    }

    function createSplit(axis, children, sizes = null, linkId = null) {
      splitSequence += 1;
      return {
        type: 'split',
        id: seed.id + '-s' + splitSequence,
        axis,
        sizes: sizes || children.map(() => 100 / children.length),
        children,
        linkId: linkId ? seed.id + '-' + linkId : null,
      };
    }

    function buildPresetLayout(key) {
      const preset = PRESETS[key];
      if (!preset) return null;
      if (preset.layout === 'top-3-bottom-1') {
        return createSplit('horizontal', [createSplit('vertical', Array.from({ length: 3 }, () => createPane())), createPane()], [34, 66]);
      }
      if (preset.layout === 'top-1-bottom-3') {
        return createSplit('horizontal', [createPane(), createSplit('vertical', Array.from({ length: 3 }, () => createPane()))], [66, 34]);
      }
      if (preset.layout === 'left-1-right-3') {
        const layout = createSplit('vertical', [createPane(), createSplit('horizontal', Array.from({ length: 3 }, () => createPane()))], [60, 40]);
        layout.displayOrder = 'tree';
        return layout;
      }
      if (preset.layout === 'left-3-right-1') {
        const layout = createSplit('vertical', [createSplit('horizontal', Array.from({ length: 3 }, () => createPane())), createPane()], [40, 60]);
        layout.displayOrder = 'tree';
        return layout;
      }
      const linkedColumns = preset.rows > 1 && preset.columns > 1 ? 'preset-' + key + '-columns' : null;
      const buildRow = () => {
        const panes = Array.from({ length: preset.columns }, () => createPane());
        return panes.length === 1 ? panes[0] : createSplit('vertical', panes, preset.sizes || null, linkedColumns);
      };
      const rows = Array.from({ length: preset.rows }, buildRow);
      return rows.length === 1 ? rows[0] : createSplit('horizontal', rows);
    }

    const initialLayout = buildPresetLayout(seed.preset);
    const initialEntries = getLeafEntries(initialLayout);
    const initialSelected = initialEntries[Math.min(seed.selectedIndex || 0, initialEntries.length - 1)]?.node.id || null;
    const initialSnapshot = {
      layout: clone(initialLayout),
      selectedPaneId: initialSelected,
      activePreset: seed.preset,
      topologyPreset: seed.preset,
    };
    const state = {
      id: seed.id,
      code: seed.code,
      name: seed.name,
      layout: initialLayout,
      selectedPaneId: initialSelected,
      activePreset: seed.preset,
      topologyPreset: seed.preset,
      photo: false,
    };

    function getEntries() {
      return getLeafEntries(state.layout);
    }

    function getDisplayIndexMap(entries = getEntries()) {
      return new Map(entries.map(({ node }, index) => [node.id, index + 1]));
    }

    function getPaneLabel(paneId) {
      return 'T' + (getDisplayIndexMap().get(paneId) || 1);
    }

    function getPane(paneId) {
      const pane = findNode(state.layout, paneId);
      return pane?.type === 'pane' ? pane : null;
    }

    function resolvePaneId(value) {
      if (!value) return null;
      if (getPane(value)) return value;
      const namespaced = value.startsWith(seed.id + '-') ? value : seed.id + '-' + value;
      if (getPane(namespaced)) return namespaced;
      const legacyMatch = value.match(/(?:^|-)p(\d+)$/);
      if (!legacyMatch) return null;
      return getEntries()[Number(legacyMatch[1]) - 1]?.node.id || null;
    }

    function layoutHasData() {
      return getEntries().some(({ node }) => paneHasData(node));
    }

    function renderDecorativeLines(element, pane) {
      for (let index = 0; index < pane.decorative.vertical; index += 1) {
        const line = document.createElement('span');
        line.className = 'decorative-line decorative-line-v';
        line.style.left = ((index + 1) / (pane.decorative.vertical + 1)) * 100 + '%';
        element.appendChild(line);
      }
      for (let index = 0; index < pane.decorative.horizontal; index += 1) {
        const line = document.createElement('span');
        line.className = 'decorative-line decorative-line-h';
        line.style.top = ((index + 1) / (pane.decorative.horizontal + 1)) * 100 + '%';
        element.appendChild(line);
      }
    }

    function renderNode(node, indexes, handleOwners) {
      if (node.type === 'pane') {
        const index = indexes.get(node.id);
        const pane = document.createElement('button');
        pane.type = 'button';
        pane.className = 'pane';
        pane.dataset.paneId = node.id;
        pane.setAttribute('aria-pressed', String(node.id === state.selectedPaneId));
        pane.setAttribute('aria-label', state.code + ', thermos T' + index + '. Ouvrir les mesures ou les divisions.');
        const summary = paneSummary(node);
        pane.innerHTML = (summary ? '<span class="pane-value">' + summary + '</span>' : '') + '<span class="pane-code">T' + index + '</span><span class="pane-hint">Toucher pour choisir</span>';
        renderDecorativeLines(pane, node);
        pane.addEventListener('click', () => openPaneActions(api, node.id));
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
        wrapper.style.flex = node.sizes[index] + ' 1 0px';
        wrapper.appendChild(renderNode(child, indexes, handleOwners));
        split.appendChild(wrapper);
      });
      const ownsHandles = !node.linkId || handleOwners.get(node.linkId) === node.id;
      if (ownsHandles) {
        node.children.slice(0, -1).forEach((_, index) => {
          const handle = document.createElement('div');
          handle.className = 'divider-handle';
          handle.dataset.splitId = node.id;
          handle.dataset.dividerIndex = String(index);
          handle.tabIndex = 0;
          handle.innerHTML = directionIconMarkup(node.axis);
          handle.setAttribute('role', 'separator');
          handle.setAttribute('aria-orientation', node.axis);
          handle.setAttribute('aria-label', (node.axis === 'vertical' ? 'Séparation verticale' : 'Séparation horizontale') + ' ' + (index + 1) + (node.linkId ? ', continue sur toutes les rangées' : ''));
          handle.title = node.axis === 'vertical' ? 'Glisser à gauche ou à droite' : 'Glisser vers le haut ou le bas';
          handle.addEventListener('pointerdown', (event) => startDividerDrag(event, node.id, index));
          handle.addEventListener('keydown', (event) => moveDividerWithKeyboard(event, node.id, index));
          split.appendChild(handle);
        });
      }
      return split;
    }

    function renderPaneStrip(entries, indexes) {
      root.querySelectorAll('[data-pane-strip]').forEach((strip) => {
        strip.innerHTML = '';
        entries.forEach(({ node }) => {
          const index = indexes.get(node.id);
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'pane-pill';
          button.setAttribute('aria-pressed', String(node.id === state.selectedPaneId));
          button.setAttribute('aria-label', state.code + ' T' + index + ', ouvrir les mesures ou les divisions');
          button.textContent = paneIsComplete(node) ? 'T' + index + ' ✓' : 'T' + index + ' •';
          button.addEventListener('click', () => openPaneActions(api, node.id));
          strip.appendChild(button);
        });
      });
    }

    function renderProgressSteps(entries, indexes) {
      root.querySelectorAll('[data-progress-steps]').forEach((progress) => {
        progress.innerHTML = '';
        entries.forEach(({ node }, entryIndex) => {
          const index = indexes.get(node.id);
          const complete = paneIsComplete(node);
          const current = node.id === state.selectedPaneId;
          const step = document.createElement('button');
          step.type = 'button';
          step.className = 'progress-step' + (complete ? ' is-complete' : '') + (current ? ' is-current' : '') + (entryIndex === entries.length - 1 ? ' is-last' : '');
          step.setAttribute('aria-label', state.code + ' T' + index + ', ' + (complete ? 'mesuré' : 'à mesurer'));
          if (current) step.setAttribute('aria-current', 'step');
          const marker = document.createElement('span');
          marker.className = 'progress-node';
          marker.innerHTML = complete ? checkIconMarkup() : String(index);
          const label = document.createElement('span');
          label.className = 'progress-label';
          label.textContent = 'T' + index;
          step.append(marker, label);
          step.addEventListener('click', () => openPaneActions(api, node.id));
          progress.appendChild(step);
        });
      });
    }

    function layoutSummary(entries) {
      const preset = PRESETS[state.activePreset];
      if (!preset) return 'Disposition personnalisée · ' + entries.length + ' thermos';
      if (preset.summary) return preset.summary + ' · ' + entries.length + ' thermos';
      const columnLabel = preset.columns > 1 ? 'colonnes' : 'colonne';
      const rowLabel = preset.rows > 1 ? 'rangées' : 'rangée';
      return preset.columns + ' ' + columnLabel + ' × ' + preset.rows + ' ' + rowLabel + ' · ' + entries.length + ' thermos';
    }

    function syncDecorativeCounters() {
      const pane = getPane(state.selectedPaneId);
      root.querySelectorAll('[data-counter]').forEach((counter) => {
        const output = counter.querySelector('output');
        if (output) output.textContent = String(pane?.decorative?.[counter.dataset.counter] || 0);
      });
    }

    function updateLayoutMeta(entries, indexes) {
      const completed = entries.filter(({ node }) => paneIsComplete(node)).length;
      const selectedLabel = 'T' + (indexes.get(state.selectedPaneId) || 1);
      root.querySelectorAll('[data-window-code]').forEach((node) => { node.textContent = state.code; });
      root.querySelectorAll('[data-window-name]').forEach((node) => { node.textContent = state.name; });
      root.querySelectorAll('[data-rename-window]').forEach((button) => { button.setAttribute('aria-label', 'Renommer ' + state.code + ' ' + state.name); });
      root.querySelectorAll('[data-pane-count-output]').forEach((node) => { node.textContent = String(entries.length); });
      root.querySelectorAll('[data-complete-pane-output]').forEach((node) => { node.textContent = String(completed); });
      root.querySelectorAll('[data-progress-label]').forEach((node) => {
        node.setAttribute('aria-label', completed + ' thermos sur ' + entries.length + ' mesurés dans ' + state.code);
      });
      root.querySelectorAll('[data-divider-count-output]').forEach((node) => { node.textContent = String(countSeparators(state.layout)); });
      root.querySelectorAll('[data-layout-summary]').forEach((node) => { node.textContent = layoutSummary(entries); });
      root.querySelectorAll('[data-preset-summary]').forEach((node) => { node.textContent = PRESETS[state.activePreset]?.label || 'Disposition personnalisée'; });
      root.querySelectorAll('[data-window-active-pane]').forEach((node) => { node.textContent = selectedLabel; });
      root.querySelectorAll('[data-layout-preset]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.layoutPreset === state.activePreset));
      });
    }

    function renderLayout() {
      const version = ++renderVersion;
      const entries = getEntries();
      if (!entries.some(({ node }) => node.id === state.selectedPaneId)) state.selectedPaneId = entries[0]?.node.id || null;
      const indexes = getDisplayIndexMap(entries);
      const owners = linkedHandleOwners(state.layout);
      canvas.innerHTML = '';
      canvas.removeAttribute('data-orientation');
      canvas.appendChild(renderNode(state.layout, indexes, owners));
      renderPaneStrip(entries, indexes);
      renderProgressSteps(entries, indexes);
      updateLayoutMeta(entries, indexes);
      syncDecorativeCounters();
      requestAnimationFrame(() => {
        if (version === renderVersion) positionDividerHandles();
      });
      interactionService.refresh(api);
      updateDossierProgress();
    }

    function directChildren(element, className) {
      return [...element.children].filter((child) => child.classList.contains(className));
    }

    function splitElement(id) {
      return canvas.querySelector('.layout-split[data-split-id="' + id + '"]');
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
        child.style.flex = node.sizes[index] + ' 1 0px';
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
      updateLayoutMeta(getEntries(), getDisplayIndexMap());
      positionDividerHandles();
      markDirty();
      updateDossierProgress();
    }

    function positionDividerHandles() {
      const frameRect = canvas.firstElementChild?.getBoundingClientRect() || canvas.getBoundingClientRect();
      const dividerTracks = { vertical: [], horizontal: [] };
      const dividerTrackByKey = new Map();
      const placedHandleCenters = [];
      canvas.querySelectorAll('.layout-split[data-split-id]').forEach((split) => {
        const axis = split.dataset.axis;
        const splitNode = findNode(state.layout, split.dataset.splitId);
        if (!splitNode || splitNode.type !== 'split') return;
        const children = directChildren(split, 'layout-child');
        children.slice(0, -1).forEach((child, index) => {
          const currentRect = child.getBoundingClientRect();
          const nextRect = children[index + 1]?.getBoundingClientRect();
          if (!nextRect) return;
          const trackKey = axis + ':' + (splitNode.linkId ? 'linked:' + splitNode.linkId : 'split:' + splitNode.id) + ':' + index;
          let track;
          if (axis === 'vertical') {
            track = {
              position: (currentRect.right + nextRect.left) / 2,
              start: Math.min(currentRect.top, nextRect.top),
              end: Math.max(currentRect.bottom, nextRect.bottom),
            };
          } else {
            track = {
              position: (currentRect.bottom + nextRect.top) / 2,
              start: Math.min(currentRect.left, nextRect.left),
              end: Math.max(currentRect.right, nextRect.right),
            };
          }
          dividerTracks[axis].push(track);
          const existingTrack = dividerTrackByKey.get(trackKey);
          if (existingTrack) {
            existingTrack.start = Math.min(existingTrack.start, track.start);
            existingTrack.end = Math.max(existingTrack.end, track.end);
          } else dividerTrackByKey.set(trackKey, { ...track });
        });
      });

      function safeCrossPosition(target, minimum, maximum, blocked, preferStart) {
        if (minimum >= maximum) return Math.max(0, target);
        const clearance = 26;
        let segments = [[minimum, maximum]];
        blocked.forEach((item) => {
          const position = typeof item === 'number' ? item : item.position;
          const itemClearance = typeof item === 'number' ? clearance : item.clearance;
          const blockedStart = position - itemClearance;
          const blockedEnd = position + itemClearance;
          segments = segments.flatMap(([start, end]) => {
            if (blockedEnd <= start || blockedStart >= end) return [[start, end]];
            const next = [];
            if (blockedStart > start) next.push([start, Math.min(end, blockedStart)]);
            if (blockedEnd < end) next.push([Math.max(start, blockedEnd), end]);
            return next;
          });
        });
        if (!segments.length) return Math.min(maximum, Math.max(minimum, target));
        const candidates = segments.map(([start, end]) => Math.min(end, Math.max(start, target)));
        const exteriorCandidates = candidates.filter((position) => preferStart ? position <= target : position >= target);
        return (exteriorCandidates.length ? exteriorCandidates : candidates)
          .sort((a, b) => {
            const distance = Math.abs(a - target) - Math.abs(b - target);
            if (Math.abs(distance) > .01) return distance;
            return preferStart ? a - b : b - a;
          })[0];
      }

      canvas.querySelectorAll('.pane[data-pane-id]').forEach((pane) => {
        const rect = pane.getBoundingClientRect();
        pane.classList.toggle('is-compact', rect.width < 82 || rect.height < 82);
      });
      canvas.querySelectorAll('.layout-split[data-split-id]').forEach((element) => {
        const node = findNode(state.layout, element.dataset.splitId);
        if (!node || node.type !== 'split') return;
        const children = directChildren(element, 'layout-child');
        const handles = directChildren(element, 'divider-handle');
        const elementRect = element.getBoundingClientRect();
        const axisPixels = node.axis === 'vertical' ? elementRect.width : elementRect.height;
        const isDense = axisPixels / node.children.length < 76;
        element.classList.toggle('is-dense', isDense);
        const minimum = minimumChildWeight(element, node);
        const total = node.sizes.reduce((sum, size) => sum + size, 0) || 100;
        handles.forEach((handle, index) => {
          const currentRect = children[index]?.getBoundingClientRect();
          const nextRect = children[index + 1]?.getBoundingClientRect();
          if (!currentRect || !nextRect) return;
          const mainPosition = node.axis === 'vertical'
            ? (currentRect.right + nextRect.left) / 2
            : (currentRect.bottom + nextRect.top) / 2;
          const ownerCrossStart = node.axis === 'vertical' ? elementRect.top : elementRect.left;
          const trackKey = node.axis + ':' + (node.linkId ? 'linked:' + node.linkId : 'split:' + node.id) + ':' + index;
          const mergedTrack = dividerTrackByKey.get(trackKey) || {
            start: ownerCrossStart,
            end: ownerCrossStart + (node.axis === 'vertical' ? elementRect.height : elementRect.width),
          };
          const frameCrossStart = node.axis === 'vertical' ? frameRect.top : frameRect.left;
          const frameCrossEnd = node.axis === 'vertical' ? frameRect.bottom : frameRect.right;
          const frameCrossCenter = (frameCrossStart + frameCrossEnd) / 2;
          const trackCrossCenter = (mergedTrack.start + mergedTrack.end) / 2;
          const touchesStartEdge = Math.abs(mergedTrack.start - frameCrossStart) <= 8;
          const touchesEndEdge = Math.abs(mergedTrack.end - frameCrossEnd) <= 8;
          let towardStartEdge;
          if (touchesStartEdge !== touchesEndEdge) towardStartEdge = touchesStartEdge;
          else if (touchesStartEdge && touchesEndEdge) towardStartEdge = node.axis === 'vertical';
          else towardStartEdge = trackCrossCenter <= frameCrossCenter;
          // Keep the control inside the outer third instead of on its inner boundary.
          // Use the full inner frame so asymmetric presets keep the same visual anchor.
          // The midpoint of that outer third is 1/6 from the chosen frame edge.
          const crossRatio = towardStartEdge ? 1 / 6 : 5 / 6;
          const crossLength = mergedTrack.end - mergedTrack.start;
          const frameCrossTarget = frameCrossStart + (frameCrossEnd - frameCrossStart) * crossRatio;
          const crossTarget = frameCrossTarget - ownerCrossStart;
          handle.dataset.crossAnchor = towardStartEdge ? 'start' : 'end';
          const blockedCrossPositions = node.axis === 'vertical'
            ? dividerTracks.horizontal
              .filter((track) => mainPosition >= track.start - 8 && mainPosition <= track.end + 8)
              .map((track) => track.position - elementRect.top)
            : dividerTracks.vertical
              .filter((track) => mainPosition >= track.start - 8 && mainPosition <= track.end + 8)
              .map((track) => track.position - elementRect.left);
          placedHandleCenters.forEach((placed) => {
            if (placed.axis !== node.axis) return;
            const mainDistance = Math.abs(placed.main - mainPosition);
            if (mainDistance >= 48) return;
            blockedCrossPositions.push({
              position: placed.cross - ownerCrossStart,
              clearance: Math.sqrt((48 ** 2) - (mainDistance ** 2)),
            });
          });
          const edgeMargin = Math.min(22, crossLength / 4);
          const crossMinimum = (mergedTrack.start - ownerCrossStart) + edgeMargin;
          const crossMaximum = (mergedTrack.end - ownerCrossStart) - edgeMargin;
          const cross = safeCrossPosition(crossTarget, crossMinimum, crossMaximum, blockedCrossPositions, towardStartEdge);
          placedHandleCenters.push({ axis: node.axis, main: mainPosition, cross: ownerCrossStart + cross });
          if (node.axis === 'vertical') {
            handle.style.left = mainPosition - elementRect.left + 'px';
            handle.style.top = cross + 'px';
          } else {
            handle.style.left = cross + 'px';
            handle.style.top = mainPosition - elementRect.top + 'px';
          }
          const previous = node.sizes.slice(0, index).reduce((sum, size) => sum + size, 0);
          const boundary = previous + node.sizes[index];
          const next = boundary + node.sizes[index + 1];
          handle.setAttribute('aria-valuemin', String(Math.round(((previous + minimum) / total) * 100)));
          handle.setAttribute('aria-valuemax', String(Math.round(((next - minimum) / total) * 100)));
          handle.setAttribute('aria-valuenow', String(Math.round((boundary / total) * 100)));
          handle.setAttribute('aria-valuetext', Math.round((boundary / total) * 100) + ' %');
        });
      });
    }

    function startDividerDrag(event, splitId, dividerIndex) {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      interactionService.activate(api);
      const node = findNode(state.layout, splitId);
      const element = splitElement(splitId);
      if (!node || node.type !== 'split' || !element) return;
      const handle = event.currentTarget;
      handle.classList.add('is-dragging');
      handle.focus({ preventScroll: true });
      handle.setPointerCapture?.(event.pointerId);
      const startCoordinate = node.axis === 'vertical' ? event.clientX : event.clientY;
      const startBoundary = node.sizes.slice(0, dividerIndex + 1).reduce((sum, size) => sum + size, 0);
      const total = node.sizes.reduce((sum, size) => sum + size, 0) || 100;
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
      interactionService.activate(api);
      const previous = node.sizes.slice(0, dividerIndex).reduce((sum, size) => sum + size, 0);
      const current = previous + node.sizes[dividerIndex];
      const next = current + node.sizes[dividerIndex + 1];
      const minimum = minimumChildWeight(element, node);
      if (event.key === 'Home') return moveSplitDividerTo(splitId, dividerIndex, previous + minimum);
      if (event.key === 'End') return moveSplitDividerTo(splitId, dividerIndex, next - minimum);
      moveSplitDividerTo(splitId, dividerIndex, current + (event.key === previousKey ? -1 : 1) * (event.shiftKey ? 5 : 1));
    }

    function selectPane(paneId) {
      if (!getPane(paneId)) return false;
      state.selectedPaneId = paneId;
      renderLayout();
      return true;
    }

    function applyPreset(key, { detected = false, preview = false } = {}) {
      const preset = PRESETS[key];
      if (!preset) return false;
      if (!preview && state.activePreset === key) {
        showToast('La disposition « ' + preset.label + ' » est déjà active.');
        return false;
      }
      if (!preview && layoutHasData() && !window.confirm('Changer la disposition effacera les mesures de ' + state.code + '. Continuer?')) return false;
      state.layout = buildPresetLayout(key);
      state.selectedPaneId = getEntries()[0]?.node.id || null;
      state.activePreset = key;
      state.topologyPreset = key;
      interactionService.closeFor(api);
      renderLayout();
      if (!preview) markDirty();
      if (!preview) {
        const paneCount = getEntries().length;
        showToast(detected
          ? 'Disposition détectée : ' + preset.label + '. ' + paneCount + ' thermos à mesurer.'
          : 'Disposition « ' + preset.label + ' » créée. ' + paneCount + ' thermos à mesurer.');
      }
      return true;
    }

    function splitPane(paneId, axis, sectionCount, { allowDataLoss = false } = {}) {
      const entries = getEntries();
      const count = Number(sectionCount);
      const resultingTotal = entries.length + count - 1;
      if (!['vertical', 'horizontal'].includes(axis) || !Number.isInteger(count) || count < 2 || count > 4) return false;
      if (resultingTotal > MAX_PANES) {
        showToast('Maximum de ' + MAX_PANES + ' thermos atteint dans ' + state.code + '.', 'warning');
        return false;
      }
      const pane = getPane(paneId);
      if (!pane) return false;
      const oldLabel = getPaneLabel(pane.id);
      if (paneHasData(pane) && !allowDataLoss && !window.confirm('Les mesures et options de ' + state.code + ' ' + oldLabel + ' seront effacées. Continuer?')) return false;
      const firstPane = { type: 'pane', id: pane.id, measurement: blankMeasurement(), decorative: { vertical: 0, horizontal: 0 } };
      const children = [firstPane, ...Array.from({ length: count - 1 }, () => createPane())];
      state.layout = replaceNode(state.layout, pane.id, createSplit(axis, children));
      state.selectedPaneId = firstPane.id;
      state.activePreset = 'custom';
      state.topologyPreset = null;
      interactionService.closeFor(api);
      renderLayout();
      markDirty();
      requestAnimationFrame(() => focusPane(firstPane.id));
      showToast(count + ' sections créées dans ' + state.code + ' ' + oldLabel + '.');
      return true;
    }

    function equalizeLayout() {
      equalizeNode(state.layout);
      const preset = PRESETS[state.topologyPreset];
      state.activePreset = preset && !preset.layout && !preset.sizes ? state.topologyPreset : 'custom';
      renderLayout();
      markDirty();
      showToast('Toutes les divisions de ' + state.code + ' ont été réparties également.');
    }

    function resetDrawing() {
      if (!window.confirm('Réinitialiser seulement ' + state.code + ' et ses mesures?')) return;
      state.layout = clone(initialSnapshot.layout);
      state.selectedPaneId = initialSnapshot.selectedPaneId;
      state.activePreset = initialSnapshot.activePreset;
      state.topologyPreset = initialSnapshot.topologyPreset;
      state.photo = false;
      root.querySelectorAll('.window-stage').forEach((stage) => stage.classList.remove('has-photo'));
      root.querySelectorAll('[data-detect]').forEach((button) => { button.disabled = true; });
      interactionService.closeFor(api);
      renderLayout();
      markDirty();
      showToast(state.code + ' a été réinitialisée.');
    }

    function setName(value) {
      const name = String(value ?? '').trim();
      if (!name || name === state.name) return false;
      state.name = name;
      renderLayout();
      markDirty();
      showToast(state.code + ' renommée « ' + state.name + ' ».');
      return true;
    }

    function updateMeasurement(paneId, key, value) {
      const pane = getPane(paneId);
      if (!pane || !(key in pane.measurement)) return false;
      pane.measurement[key] = value;
      renderLayout();
      markDirty();
      return true;
    }

    function focusPane(paneId) {
      canvas.querySelector('.pane[data-pane-id="' + paneId + '"]')?.focus({ preventScroll: true });
    }

    function snapshot() {
      return clone({
        id: state.id,
        code: state.code,
        name: state.name,
        layout: state.layout,
        selectedPaneId: state.selectedPaneId,
        activePreset: state.activePreset,
        leaves: getEntries().map(({ node }) => node.id),
      });
    }

    api = {
      id: seed.id,
      root,
      state,
      render: renderLayout,
      getEntries,
      getDisplayIndexMap,
      getPane,
      getPaneLabel,
      resolvePaneId,
      selectPane,
      openPaneActions(paneId) { openPaneActions(api, paneId); },
      openMeasureSheet(paneId) { openMeasureSheet(api, paneId); },
      splitPane,
      applyPreset,
      equalizeLayout,
      resetDrawing,
      setName,
      updateMeasurement,
      focusPane,
      snapshot,
    };

    root.addEventListener('pointerdown', () => interactionService.activate(api), true);
    root.addEventListener('focusin', () => interactionService.activate(api));
    root.querySelectorAll('[data-layout-preset]').forEach((button) => button.addEventListener('click', () => {
      const key = button.dataset.layoutPreset;
      const applied = applyPreset(key);
      if (applied || state.activePreset === key) button.closest('details')?.removeAttribute('open');
    }));
    root.querySelectorAll('[data-equalize]').forEach((button) => button.addEventListener('click', equalizeLayout));
    root.querySelectorAll('[data-reset]').forEach((button) => button.addEventListener('click', resetDrawing));
    root.querySelectorAll('[data-rename-window]').forEach((button) => button.addEventListener('click', () => openWindowRenameModal(api)));
    root.querySelectorAll('[data-counter]').forEach((counter) => {
      counter.querySelectorAll('[data-delta]').forEach((button) => button.addEventListener('click', () => {
        const pane = getPane(state.selectedPaneId);
        if (!pane) return;
        const key = counter.dataset.counter;
        pane.decorative[key] = Math.max(0, Math.min(8, pane.decorative[key] + Number(button.dataset.delta)));
        renderLayout();
        markDirty();
      }));
    });
    root.querySelectorAll('[data-photo]').forEach((button) => button.addEventListener('click', () => {
      state.photo = true;
      root.querySelectorAll('.window-stage').forEach((stage) => stage.classList.add('has-photo'));
      root.querySelectorAll('[data-detect]').forEach((detect) => { detect.disabled = false; });
      markDirty();
      showToast('Photo ajoutée à ' + state.code + '.');
    }));
    root.querySelectorAll('[data-detect]').forEach((button) => button.addEventListener('click', () => applyPreset('3x2', { detected: true })));
    root.querySelectorAll('[data-apply-measure]').forEach((button) => button.addEventListener('click', () => {
      const pane = getPane(state.selectedPaneId);
      if (!pane) return;
      getEntries().forEach(({ node }) => { node.measurement = clone(pane.measurement); });
      renderLayout();
      markDirty();
      showToast('Mesures de ' + state.code + ' ' + getPaneLabel(pane.id) + ' appliquées aux ' + getEntries().length + ' thermos de cette fenêtre.');
    }));

    const resizeObserver = 'ResizeObserver' in window
      ? new ResizeObserver(() => requestAnimationFrame(positionDividerHandles))
      : null;
    resizeObserver?.observe(canvas);
    api.destroy = () => resizeObserver?.disconnect();
    return api;
  }

  function cloneWindowTemplate() {
    const fragment = windowTemplate.content.cloneNode(true);
    return fragment.querySelector('[data-window-plan]') || fragment.firstElementChild;
  }

  function namespaceRootIds(root, windowId) {
    const replacements = new Map();
    root.querySelectorAll('[id]').forEach((node) => {
      const oldId = node.id;
      const newId = windowId + '-' + oldId;
      replacements.set(oldId, newId);
      node.id = newId;
    });
    ['aria-labelledby', 'aria-describedby', 'aria-controls'].forEach((attribute) => {
      root.querySelectorAll('[' + attribute + ']').forEach((node) => {
        node.setAttribute(attribute, node.getAttribute(attribute).split(/\s+/).map((id) => replacements.get(id) || id).join(' '));
      });
    });
    root.querySelectorAll('label[for]').forEach((node) => {
      const replacement = replacements.get(node.htmlFor);
      if (replacement) node.htmlFor = replacement;
    });
  }

  function registerWindow(root, { first = false, focus = false } = {}) {
    windowSequence += 1;
    const id = 'w' + windowSequence;
    const code = 'F' + String(windowSequence).padStart(2, '0');
    namespaceRootIds(root, id);
    const existingName = root.querySelector('[data-window-name]')?.textContent?.trim();
    const controller = createWindowController(root, {
      id,
      code,
      name: first && existingName ? existingName : first ? 'Salon' : String(windowSequence),
      preset: first ? '3x2' : '1x1',
      selectedIndex: first ? 1 : 0,
    });
    if (!controller) return null;
    controllers.push(controller);
    controllerById.set(id, controller);
    controller.render();
    if (!activeWindowId || focus) activateController(controller);
    if (focus) {
      requestAnimationFrame(() => {
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
        root.focus({ preventScroll: true });
      });
    }
    return controller;
  }

  function addWindow({ focus = true } = {}) {
    const root = cloneWindowTemplate();
    if (!root) return null;
    windowList.appendChild(root);
    const controller = registerWindow(root, { first: controllers.length === 0, focus });
    if (controller && controllers.length > 1 && focus) {
      markDirty();
      showToast(controller.state.code + ' ajoutée.');
    }
    return controller;
  }

  windowRenameModal.querySelectorAll('[data-close-window-rename]').forEach((button) => button.addEventListener('click', () => closeWindowRenameModal()));
  windowRenameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = windowRenameInput.value.trim();
    if (!name) {
      if (windowRenameError) {
        windowRenameError.textContent = 'Entrez un nom pour cette fenêtre.';
        windowRenameError.hidden = false;
      }
      windowRenameInput.focus();
      return;
    }
    if (interaction.mode === 'rename') interaction.controller?.setName(name);
    closeWindowRenameModal();
  });
  windowRenameInput.addEventListener('input', () => {
    if (!windowRenameError) return;
    windowRenameError.hidden = true;
    windowRenameError.textContent = '';
  });
  windowRenameModal.addEventListener('click', (event) => {
    if (event.target === windowRenameModal) closeWindowRenameModal();
  });
  windowRenameModal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeWindowRenameModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...windowRenameModal.querySelectorAll('input, button:not(:disabled)')];
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

  sheet.querySelectorAll('[data-measure-key]').forEach((field) => {
    if (field.tagName === 'SELECT' && field.dataset.measureKey?.endsWith('Fraction') && !field.options.length) {
      fractions.forEach((fraction) => field.add(new Option(fraction || 'Fraction', fraction)));
    }
    const update = () => {
      if (interaction.mode !== 'measure' || !interaction.controller) return;
      interaction.controller.updateMeasurement(
        interaction.paneId,
        field.dataset.measureKey,
        field.type === 'checkbox' ? field.checked : field.value
      );
    };
    field.addEventListener(field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input', update);
  });
  sheet.querySelectorAll('[data-close-sheet]').forEach((button) => button.addEventListener('click', () => closeSheet()));
  sheet.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeSheet(); });

  paneActionModal.querySelectorAll('[data-close-pane-action]').forEach((button) => button.addEventListener('click', () => closePaneActions()));
  paneActionModal.querySelectorAll('[data-modal-axis]').forEach((button) => button.addEventListener('click', () => {
    interaction.axis = button.dataset.modalAxis;
    updatePaneActionModal();
  }));
  paneActionModal.querySelectorAll('[data-section-count]').forEach((button) => button.addEventListener('click', () => {
    if (button.disabled) return;
    interaction.count = Number(button.dataset.sectionCount);
    updatePaneActionModal();
  }));
  paneActionModal.querySelector('[data-open-pane-measure]')?.addEventListener('click', () => {
    if (interaction.controller) openMeasureSheet(interaction.controller, interaction.paneId);
  });
  paneActionModal.querySelector('[data-create-sections]')?.addEventListener('click', () => {
    interaction.controller?.splitPane(interaction.paneId, interaction.axis, interaction.count, { allowDataLoss: true });
  });
  paneActionModal.addEventListener('click', (event) => { if (event.target === paneActionModal) closePaneActions(); });
  paneActionModal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePaneActions();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...paneActionModal.querySelectorAll('button:not(:disabled)')];
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

  const existingPlans = [...windowList.querySelectorAll(':scope > [data-window-plan]')];
  if (existingPlans.length) {
    existingPlans.forEach((root, index) => registerWindow(root, { first: index === 0 }));
  } else {
    addWindow({ focus: false });
  }
  addWindowButton?.addEventListener('click', () => addWindow());

  document.querySelectorAll('[data-save-draft]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-dirty]').forEach((node) => { node.hidden = true; });
    showToast(controllers.length + ' fenêtre' + (controllers.length > 1 ? 's enregistrées.' : ' enregistrée.'));
  }));
  document.querySelectorAll('[data-finalize]').forEach((button) => button.addEventListener('click', () => {
    showToast('Prototype seulement : les mesures des ' + controllers.length + ' fenêtres seraient validées ici.');
  }));

  window.__vosthermosGridPrototype = {
    snapshot: () => clone({
      activeWindowId,
      windows: controllers.map((controller) => controller.snapshot()),
    }),
    addWindow: () => addWindow(),
  };

  const previewParams = new URLSearchParams(window.location.search);
  const previewWindowCount = Math.min(4, Math.max(1, Number(previewParams.get('previewWindows')) || 1));
  while (controllers.length < previewWindowCount) addWindow({ focus: false });
  const previewWindowIndex = Math.max(0, Math.min(controllers.length - 1, (Number(previewParams.get('previewWindow')) || 1) - 1));
  const previewController = controllers[previewWindowIndex] || controllers[0];
  const previewPreset = previewParams.get('previewPreset');
  if (previewController && PRESETS[previewPreset]) previewController.applyPreset(previewPreset, { preview: true });
  if (previewParams.get('previewModels') === '1') previewController?.root.querySelector('.layout-presets-menu')?.setAttribute('open', '');
  const previewPaneId = previewController?.resolvePaneId(previewParams.get('previewPane'));
  if (previewController && previewParams.get('previewRename') === '1') {
    openWindowRenameModal(previewController);
  } else if (previewController && previewPaneId) {
    previewController.openPaneActions(previewPaneId);
    const previewAxis = previewParams.get('axis');
    const previewCount = Number(previewParams.get('sections'));
    if (['vertical', 'horizontal'].includes(previewAxis)) interaction.axis = previewAxis;
    if ([2, 3, 4].includes(previewCount)) interaction.count = previewCount;
    updatePaneActionModal();
  }
  updateDossierProgress();
})();
