(() => {
  const canvas = document.querySelector('[data-window-canvas]');
  const sheet = document.querySelector('[data-measure-sheet]');
  const toast = document.querySelector('[data-toast]');
  if (!canvas || !sheet) return;

  const state = {
    paneCount: Number(document.body.dataset.initialPanes || 3),
    orientation: document.body.dataset.initialOrientation || 'vertical',
    selectedPane: Number(document.body.dataset.initialPane || 2),
    decorative: { vertical: 0, horizontal: 0 },
    measurements: {
      1: { width: '32', widthFraction: '1/4', height: '48', heightFraction: '1/2', thickness: '1', thicknessFraction: '0' },
      2: { width: '', widthFraction: '', height: '', heightFraction: '', thickness: '', thicknessFraction: '' },
      3: { width: '31', widthFraction: '7/8', height: '48', heightFraction: '1/2', thickness: '1', thicknessFraction: '0' },
    },
  };

  let toastTimer;
  const fractions = ['', '0', '1/16', '1/8', '3/16', '1/4', '5/16', '3/8', '7/16', '1/2', '9/16', '5/8', '11/16', '3/4', '13/16', '7/8', '15/16'];

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

  function renderPanes() {
    state.selectedPane = Math.min(Math.max(1, state.selectedPane), state.paneCount);
    canvas.innerHTML = '';
    canvas.dataset.orientation = state.orientation;
    canvas.style.setProperty('--pane-count', state.paneCount);
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
      if (index < state.paneCount) {
        const handle = document.createElement('span');
        handle.className = 'divider-handle';
        handle.setAttribute('aria-hidden', 'true');
        handle.textContent = '↔';
        pane.appendChild(handle);
      }
      pane.addEventListener('click', () => openPane(index));
      canvas.appendChild(pane);
    }
    renderPaneStrip();
    document.querySelectorAll('[data-pane-count-output]').forEach((output) => { output.textContent = String(state.paneCount); });
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
    state.selectedPane = Math.min(state.selectedPane, state.paneCount);
    renderPanes();
    showToast(`${state.paneCount} thermos égaux créés. Touchez une section pour inscrire ses mesures.`);
  }

  function resetDrawing() {
    if (!window.confirm('Réinitialiser le dessin et revenir à un seul thermos?')) return;
    state.paneCount = 1;
    state.selectedPane = 1;
    state.orientation = 'vertical';
    state.decorative = { vertical: 0, horizontal: 0 };
    renderPanes();
    closeSheet();
    showToast('Dessin réinitialisé. Vous pouvez annuler pendant 10 secondes.');
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
  document.querySelectorAll('[data-reset]').forEach((button) => button.addEventListener('click', resetDrawing));
  document.querySelectorAll('[data-section-count]').forEach((select) => select.addEventListener('change', () => showToast(`${select.value} sections choisies. Sélectionnez le sens.`)));

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
    state.selectedPane = 2;
    const selector = document.querySelector('[data-section-count]');
    if (selector) selector.value = '3';
    renderPanes();
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

  renderPanes();
})();
