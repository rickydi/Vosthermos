(() => {
  const modal = document.querySelector('[data-tutorial-modal]');
  const card = modal?.querySelector('.tutorial-card');
  const openButtons = [...document.querySelectorAll('[data-tutorial-open]')];
  const closeButton = modal?.querySelector('[data-tutorial-close]');
  const previousButton = modal?.querySelector('[data-tutorial-prev]');
  const nextButton = modal?.querySelector('[data-tutorial-next]');
  const toggleButton = modal?.querySelector('[data-tutorial-toggle]');
  const demo = modal?.querySelector('[data-tutorial-demo]');
  const dots = modal?.querySelector('[data-tutorial-dots]');
  const progress = modal?.querySelector('[data-tutorial-progress]');
  if (!modal || !card || !openButtons.length || !closeButton || !previousButton || !nextButton || !toggleButton || !demo || !dots || !progress) return;

  const languageParams = new URLSearchParams(window.location.search);
  const requestedLanguage = languageParams.get('clientLang') || languageParams.get('lang') || document.documentElement.lang || 'fr';
  const language = requestedLanguage.toLowerCase().startsWith('en') ? 'en' : 'fr';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEP_DURATION = 5200;
  const backgroundElements = [document.querySelector('.prototype'), document.querySelector('.back-to-index')].filter(Boolean);
  const initialInertState = new Map(backgroundElements.map((node) => [node, node.inert]));
  const copy = language === 'en'
    ? {
        launcher: 'Tutorial', openLabel: 'Open the measurement tutorial', kicker: 'Quick tutorial', heading: 'Measure a window',
        duration: 'About 40 sec', step: 'Step', of: 'of', previous: 'Previous', next: 'Next', pause: 'Pause', resume: 'Resume', replay: 'Replay', finish: 'Start measuring', close: 'Close tutorial',
        dotsLabel: 'Tutorial steps', demoLabel: 'Animated window measurement demonstration',
        demo: {
          mode: 'Final measurements', room: 'Living room', model: 'Choose window type', photo: 'Take a photo', divide: 'Edit selected glass unit',
          width: 'Width', height: 'Height', thickness: 'Thickness', spacer: 'Spacer', decorative: 'Grilles', addWindow: 'Add another window', save: 'Save', finalize: 'Confirm final measurements',
          values: ['32 1/4 in', '48 7/8 in', '1 in'],
        },
        steps: [
          { title: 'Choose the window', description: 'Open the model list, or take a straight-on photo of the complete window.', tip: 'A photo suggests the closest layout automatically. You can still correct it.' },
          { title: 'Select one glass unit', description: 'Tap the pane you want to measure. Its T number shows exactly which unit you are editing.', tip: 'The selected unit pulses and the editor follows it.' },
          { title: 'Enter three measurements', description: 'Enter width, height and thickness. Inches stay the default, with mm and cm available.', tip: 'Fractions appear in inches; metric values keep their exact precision.' },
          { title: 'Divide only when needed', description: 'Use Edit selected glass unit, choose vertical or horizontal, then choose the number of sections.', tip: 'You can drag each divider afterward to match the real window.' },
          { title: 'Add the glass options', description: 'Record Low-E, Argon, spacer, glazing and decorative grilles for the selected unit.', tip: 'Unknown remains a valid choice when the client cannot identify an option.' },
          { title: 'Add the other windows', description: 'Use the large plus after the first plan. Each new window receives its own F number.', tip: 'Finish one window at a time to keep every T number tied to the right opening.' },
          { title: 'Save or confirm', description: 'Save keeps a draft. Confirm final measurements means the complete measurement request is ready.', tip: 'Only confirm after every required glass unit has its three measurements.' },
        ],
      }
    : {
        launcher: 'Tutoriel', openLabel: 'Ouvrir le tutoriel de prise de mesures', kicker: 'Tutoriel rapide', heading: 'Mesurer une fenêtre',
        duration: 'Environ 40 s', step: 'Étape', of: 'sur', previous: 'Précédent', next: 'Suivant', pause: 'Pause', resume: 'Reprendre', replay: 'Rejouer', finish: 'Commencer à mesurer', close: 'Fermer le tutoriel',
        dotsLabel: 'Étapes du tutoriel', demoLabel: 'Démonstration animée de la prise de mesures',
        demo: {
          mode: 'Mesures finales', room: 'Salon', model: 'Choisir un type', photo: 'Prendre une photo', divide: 'Modifier le thermos sélectionné',
          width: 'Largeur', height: 'Hauteur', thickness: 'Épaisseur', spacer: 'Intercalaire', decorative: 'Carreaux', addWindow: 'Ajouter une autre fenêtre', save: 'Enregistrer', finalize: 'Valider les mesures finales',
          values: ['32 1/4 po', '48 7/8 po', '1 po'],
        },
        steps: [
          { title: 'Choisissez la fenêtre', description: 'Ouvrez la liste des modèles ou prenez une photo bien de face de la fenêtre complète.', tip: 'La photo propose automatiquement la disposition la plus proche, que vous pouvez corriger.' },
          { title: 'Sélectionnez un thermos', description: 'Touchez la vitre à mesurer. Son numéro T indique exactement quel thermos vous modifiez.', tip: 'Le thermos sélectionné s’anime légèrement et son formulaire le suit.' },
          { title: 'Entrez trois mesures', description: 'Inscrivez largeur, hauteur et épaisseur. Les pouces restent par défaut, avec mm et cm en option.', tip: 'Les fractions apparaissent en pouces; les valeurs métriques gardent leur précision exacte.' },
          { title: 'Divisez seulement au besoin', description: 'Touchez Modifier le thermos, choisissez vertical ou horizontal, puis le nombre de sections.', tip: 'Vous pourrez ensuite déplacer chaque division pour reproduire la vraie fenêtre.' },
          { title: 'Ajoutez les options', description: 'Notez Low-E, Argon, intercalaire, vitrage et carreaux décoratifs pour le thermos sélectionné.', tip: 'Le choix Inconnu reste permis lorsque le client ne peut pas identifier une option.' },
          { title: 'Ajoutez les autres fenêtres', description: 'Utilisez le gros plus après le premier plan. Chaque nouvelle fenêtre reçoit son propre numéro F.', tip: 'Terminez une fenêtre à la fois pour garder chaque numéro T lié à la bonne ouverture.' },
          { title: 'Enregistrez ou validez', description: 'Enregistrer conserve un brouillon. Valider confirme que toute la prise de mesures est terminée.', tip: 'Validez seulement lorsque tous les thermos requis possèdent leurs trois mesures.' },
        ],
      };

  const titleNode = modal.querySelector('[data-tutorial-step-title]');
  const descriptionNode = modal.querySelector('[data-tutorial-step-description]');
  const tipNode = modal.querySelector('[data-tutorial-step-tip]');
  const countNode = modal.querySelector('[data-tutorial-step-count]');
  const toggleLabel = modal.querySelector('[data-tutorial-toggle-label]');
  const nextLabel = modal.querySelector('[data-tutorial-next-label]');
  const playIcon = modal.querySelector('[data-tutorial-play-icon]');
  const pauseIcon = modal.querySelector('[data-tutorial-pause-icon]');
  let currentStep = 0;
  let playing = false;
  let timer = null;
  let progressFrame = null;
  let remainingMs = STEP_DURATION;
  let startedAt = 0;
  let lastFocused = null;

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function applyLanguage() {
    openButtons.forEach((button) => {
      const label = button.querySelector('[data-tutorial-launch-label]');
      if (label) label.textContent = copy.launcher;
      button.lang = language;
      button.setAttribute('aria-label', copy.openLabel);
    });
    modal.lang = language;
    setText('[data-tutorial-kicker]', copy.kicker);
    setText('[data-tutorial-heading]', copy.heading);
    setText('[data-tutorial-duration]', copy.duration);
    setText('[data-tutorial-prev-label]', copy.previous);
    previousButton.setAttribute('aria-label', copy.previous);
    closeButton.setAttribute('aria-label', copy.close);
    dots.setAttribute('aria-label', copy.dotsLabel);
    demo.setAttribute('aria-label', copy.demoLabel);
    Object.entries(copy.demo).forEach(([key, value]) => {
      if (key === 'values') return;
      modal.querySelectorAll('[data-demo-copy="' + key + '"]').forEach((node) => { node.textContent = value; });
    });
    modal.querySelectorAll('.demo-field b').forEach((node, index) => { node.textContent = copy.demo.values[index] || ''; });
  }

  function buildDots() {
    dots.replaceChildren();
    copy.steps.forEach((step, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tutorial-dot';
      button.dataset.tutorialStep = String(index);
      button.setAttribute('aria-label', copy.step + ' ' + (index + 1) + ' : ' + step.title);
      button.addEventListener('click', () => setStep(index));
      dots.appendChild(button);
    });
  }

  function clearTimer({ captureElapsed = false } = {}) {
    if (captureElapsed && startedAt) {
      remainingMs = Math.max(0, remainingMs - (performance.now() - startedAt));
    }
    if (timer) window.clearTimeout(timer);
    timer = null;
    startedAt = 0;
  }

  function syncProgress({ reset = false } = {}) {
    if (progressFrame) window.cancelAnimationFrame(progressFrame);
    progressFrame = null;
    if (reset) remainingMs = STEP_DURATION;
    const completedRatio = currentStep === copy.steps.length - 1 ? 1 : 1 - (remainingMs / STEP_DURATION);
    modal.dataset.playing = String(playing);
    progress.style.transition = 'none';
    progress.style.width = Math.max(0, Math.min(100, completedRatio * 100)) + '%';
    void progress.offsetWidth;
    if (playing) {
      progressFrame = window.requestAnimationFrame(() => {
        progressFrame = null;
        if (!playing || modal.hidden) return;
        progress.style.transition = 'width ' + remainingMs + 'ms linear';
        progress.style.width = '100%';
      });
    }
  }

  function scheduleNext() {
    clearTimer();
    if (!playing) return;
    if (currentStep >= copy.steps.length - 1) {
      playing = false;
      renderStep({ resetProgress: false });
      return;
    }
    startedAt = performance.now();
    timer = window.setTimeout(() => {
      timer = null;
      startedAt = 0;
      currentStep += 1;
      if (currentStep === copy.steps.length - 1) playing = false;
      renderStep({ resetProgress: true });
    }, Math.max(0, remainingMs));
  }

  function renderStep({ resetProgress = false } = {}) {
    const step = copy.steps[currentStep];
    titleNode.textContent = step.title;
    descriptionNode.textContent = step.description;
    tipNode.textContent = step.tip;
    countNode.textContent = copy.step + ' ' + (currentStep + 1) + ' ' + copy.of + ' ' + copy.steps.length;
    demo.dataset.demoStep = String(currentStep);
    previousButton.disabled = currentStep === 0;
    nextLabel.textContent = currentStep === copy.steps.length - 1 ? copy.finish : copy.next;
    nextButton.setAttribute('aria-label', nextLabel.textContent);
    toggleLabel.textContent = playing ? copy.pause : currentStep === copy.steps.length - 1 ? copy.replay : copy.resume;
    toggleButton.setAttribute('aria-label', toggleLabel.textContent);
    playIcon.toggleAttribute('hidden', playing);
    pauseIcon.toggleAttribute('hidden', !playing);
    [...dots.children].forEach((dot, index) => {
      if (index === currentStep) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
    syncProgress({ reset: resetProgress });
    scheduleNext();
  }

  function setStep(index) {
    currentStep = Math.max(0, Math.min(copy.steps.length - 1, index));
    if (currentStep === copy.steps.length - 1) playing = false;
    renderStep({ resetProgress: true });
  }

  function openTutorial() {
    lastFocused = document.activeElement;
    currentStep = 0;
    remainingMs = STEP_DURATION;
    playing = !reducedMotion;
    modal.hidden = false;
    backgroundElements.forEach((node) => { node.inert = true; });
    document.body.classList.add('tutorial-open');
    renderStep({ resetProgress: true });
    closeButton.focus({ preventScroll: true });
  }

  function closeTutorial() {
    clearTimer();
    if (progressFrame) window.cancelAnimationFrame(progressFrame);
    progressFrame = null;
    remainingMs = STEP_DURATION;
    startedAt = 0;
    playing = false;
    modal.dataset.playing = 'false';
    modal.hidden = true;
    backgroundElements.forEach((node) => { node.inert = initialInertState.get(node) || false; });
    document.body.classList.remove('tutorial-open');
    if (lastFocused instanceof HTMLElement) lastFocused.focus({ preventScroll: true });
  }

  function togglePlayback() {
    if (currentStep === copy.steps.length - 1 && !playing) {
      currentStep = 0;
      playing = true;
      renderStep({ resetProgress: true });
      return;
    }
    if (playing) {
      clearTimer({ captureElapsed: true });
      playing = false;
    } else {
      playing = true;
    }
    renderStep({ resetProgress: false });
  }

  function focusableNodes() {
    return [...modal.querySelectorAll('button:not(:disabled),[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')]
      .filter((node) => !node.hidden && node.getClientRects().length > 0);
  }

  applyLanguage();
  buildDots();
  openButtons.forEach((button) => button.addEventListener('click', openTutorial));
  closeButton.addEventListener('click', closeTutorial);
  previousButton.addEventListener('click', () => setStep(currentStep - 1));
  nextButton.addEventListener('click', () => {
    if (currentStep === copy.steps.length - 1) closeTutorial();
    else setStep(currentStep + 1);
  });
  toggleButton.addEventListener('click', togglePlayback);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeTutorial(); });
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeTutorial();
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setStep(currentStep - 1);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (currentStep < copy.steps.length - 1) setStep(currentStep + 1);
      return;
    }
    if (event.key === ' ' && !event.target.closest('button')) {
      event.preventDefault();
      togglePlayback();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = focusableNodes();
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
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden || modal.hidden || !playing) return;
    clearTimer({ captureElapsed: true });
    playing = false;
    renderStep({ resetProgress: false });
  });
})();
