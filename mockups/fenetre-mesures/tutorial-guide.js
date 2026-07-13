(() => {
  const pageParams = new URLSearchParams(window.location.search);
  if (pageParams.get('tutorialEmbed') === '1') return;

  const modal = document.querySelector('[data-tutorial-modal]');
  const card = modal?.querySelector('.tutorial-card');
  const openButtons = [...document.querySelectorAll('[data-tutorial-open]')];
  const closeButton = modal?.querySelector('[data-tutorial-close]');
  const previousButton = modal?.querySelector('[data-tutorial-prev]');
  const nextButton = modal?.querySelector('[data-tutorial-next]');
  const toggleButton = modal?.querySelector('[data-tutorial-toggle]');
  const frame = modal?.querySelector('[data-tutorial-frame]');
  const stage = modal?.querySelector('[data-tutorial-stage]');
  const loading = modal?.querySelector('[data-tutorial-loading]');
  const dots = modal?.querySelector('[data-tutorial-dots]');
  const progress = modal?.querySelector('[data-tutorial-progress]');
  if (!modal || !card || !openButtons.length || !closeButton || !previousButton || !nextButton || !toggleButton || !frame || !stage || !loading || !dots || !progress) return;

  const requestedLanguage = pageParams.get('clientLang') || pageParams.get('lang') || document.documentElement.lang || 'fr';
  const language = requestedLanguage.toLowerCase().startsWith('en') ? 'en' : 'fr';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const channel = 'vosthermos-measure-tutorial';
  const durations = [6500, 5600, 6800, 6800, 6800, 6400, 6200];
  const backgroundElements = [document.querySelector('.prototype'), document.querySelector('.back-to-index')].filter(Boolean);
  const initialInertState = new Map(backgroundElements.map((node) => [node, node.inert]));
  const copy = language === 'en'
    ? {
        launcher: 'Tutorial', openLabel: 'Open the live measurement tutorial', kicker: 'Live demonstration', heading: 'Measure a window',
        duration: 'About 1 min', step: 'Step', of: 'of', previous: 'Previous', next: 'Next', pause: 'Pause', resume: 'Resume', replay: 'Replay', finish: 'Close', close: 'Close tutorial',
        dotsLabel: 'Tutorial steps', stageLabel: 'Live demonstration of the measurement application', frameLabel: 'Isolated copy of the measurement application', loading: 'Preparing the live demonstration…',
        steps: [
          { title: 'Choose the window', description: 'Watch the real model list open, then the Four equal layout is selected.', tip: 'Take a photo is the second option. The camera is not opened during the tutorial.', position: 'bottom', side: 'right' },
          { title: 'Select one glass unit', description: 'The tutorial taps T2 in the real drawing. The editor then follows that exact unit.', tip: 'The isolated copy behaves like your dossier, but nothing is saved to it.', position: 'bottom', side: 'left' },
          { title: 'Enter three measurements', description: 'Width, height and thickness are entered in the real fields, including inch fractions.', tip: 'Inches remain the default; mm and cm are also available.', position: 'top', side: 'right' },
          { title: 'Divide only when needed', description: 'The real Edit button opens. Vertical and two sections are chosen, then created.', tip: 'You can move the new divider afterward to match the actual window.', position: 'bottom', side: 'right' },
          { title: 'Add the glass options', description: 'Low-E, Argon and decorative grilles are selected on the active glass unit.', tip: 'Unknown remains a valid spacer choice when the client is unsure.', position: 'top', side: 'right' },
          { title: 'Add the other windows', description: 'The large plus creates a true second glazing plan with its own F number.', tip: 'Complete one window at a time so every T number stays tied to the right opening.', position: 'top', side: 'left' },
          { title: 'Save or confirm', description: 'Save keeps a draft. Confirm final measurements marks the measurement request as complete.', tip: 'This demonstration is isolated: these clicks never alter the client file.', position: 'top', side: 'left' },
        ],
      }
    : {
        launcher: 'Tutoriel', openLabel: 'Ouvrir le tutoriel réel de prise de mesures', kicker: 'Démonstration réelle', heading: 'Mesurer une fenêtre',
        duration: 'Environ 1 min', step: 'Étape', of: 'sur', previous: 'Précédent', next: 'Suivant', pause: 'Pause', resume: 'Reprendre', replay: 'Rejouer', finish: 'Fermer', close: 'Fermer le tutoriel',
        dotsLabel: 'Étapes du tutoriel', stageLabel: 'Démonstration réelle de l’application de mesures', frameLabel: 'Copie isolée de l’application de mesures', loading: 'Préparation de la démonstration réelle…',
        steps: [
          { title: 'Choisissez la fenêtre', description: 'La vraie liste des modèles s’ouvre, puis la disposition Quatre égaux est sélectionnée.', tip: 'Prendre une photo reste la deuxième option. La caméra ne s’ouvre pas pendant le tutoriel.', position: 'bottom', side: 'right' },
          { title: 'Sélectionnez un thermos', description: 'Le tutoriel touche réellement T2 dans le dessin. Le formulaire suit alors ce thermos précis.', tip: 'Cette copie fonctionne comme le dossier, mais aucune donnée n’y est conservée.', position: 'bottom', side: 'left' },
          { title: 'Entrez trois mesures', description: 'Largeur, hauteur et épaisseur sont inscrites dans les vrais champs, avec les fractions de pouce.', tip: 'Les pouces restent par défaut; les unités mm et cm sont aussi offertes.', position: 'top', side: 'right' },
          { title: 'Divisez seulement au besoin', description: 'Le vrai bouton Modifier s’ouvre. Vertical, deux sections puis Créer sont sélectionnés.', tip: 'La nouvelle division peut ensuite être déplacée pour reproduire la vraie fenêtre.', position: 'bottom', side: 'right' },
          { title: 'Ajoutez les options', description: 'Low-E, Argon et les carreaux décoratifs sont activés sur le thermos sélectionné.', tip: 'Inconnu reste un choix valide pour l’intercalaire lorsque le client hésite.', position: 'top', side: 'right' },
          { title: 'Ajoutez les autres fenêtres', description: 'Le gros plus crée un vrai deuxième plan de vitrage avec son propre numéro F.', tip: 'Terminez une fenêtre à la fois pour lier chaque numéro T à la bonne ouverture.', position: 'top', side: 'left' },
          { title: 'Enregistrez ou validez', description: 'Enregistrer garde un brouillon. Valider les mesures finales confirme que la prise de mesures est terminée.', tip: 'La démonstration est isolée : ces clics ne modifient jamais le dossier du client.', position: 'top', side: 'left' },
        ],
      };

  const titleNode = modal.querySelector('[data-tutorial-step-title]');
  const descriptionNode = modal.querySelector('[data-tutorial-step-description]');
  const tipNode = modal.querySelector('[data-tutorial-step-tip]');
  const countNode = modal.querySelector('[data-tutorial-step-count]');
  const durationNode = modal.querySelector('[data-tutorial-duration]');
  const loadingLabel = loading.querySelector('b');
  const toggleLabel = modal.querySelector('[data-tutorial-toggle-label]');
  const nextLabel = modal.querySelector('[data-tutorial-next-label]');
  const playIcon = modal.querySelector('[data-tutorial-play-icon]');
  const pauseIcon = modal.querySelector('[data-tutorial-pause-icon]');
  let currentStep = 0;
  let playing = false;
  let stepFinished = false;
  let activeRunId = '';
  let runCounter = 0;
  let progressElapsed = 0;
  let progressStartedAt = 0;
  let activeDuration = durations[0];
  let progressFrame = null;
  let advanceTimer = null;
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
    durationNode.textContent = copy.duration;
    setText('[data-tutorial-prev-label]', copy.previous);
    previousButton.setAttribute('aria-label', copy.previous);
    closeButton.setAttribute('aria-label', copy.close);
    dots.setAttribute('aria-label', copy.dotsLabel);
    stage.setAttribute('aria-label', copy.stageLabel);
    frame.title = copy.frameLabel;
    loadingLabel.textContent = copy.loading;
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

  function frameUrl(step) {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('tutorialEmbed', '1');
    url.searchParams.set('tutorialScene', String(step));
    url.searchParams.set('tutorialRun', activeRunId);
    url.searchParams.set('clientLang', language);
    url.searchParams.set('previewUnit', 'in');
    url.searchParams.set('previewPreset', step === 0 ? '1x1' : '2x2');
    url.searchParams.set('previewSelected', step === 1 ? 'p1' : 'p2');
    return url.href;
  }

  function postToFrame(type) {
    frame.contentWindow?.postMessage({ channel, type, runId: activeRunId, playing }, window.location.origin);
  }

  function stopAdvanceTimer() {
    if (advanceTimer) window.clearTimeout(advanceTimer);
    advanceTimer = null;
  }

  function stopProgress({ capture = false } = {}) {
    if (capture && progressStartedAt) {
      progressElapsed = Math.min(activeDuration, progressElapsed + performance.now() - progressStartedAt);
    }
    progressStartedAt = 0;
    if (progressFrame) window.cancelAnimationFrame(progressFrame);
    progressFrame = null;
    progress.style.transition = 'none';
    progress.style.width = Math.min(100, (progressElapsed / activeDuration) * 100) + '%';
  }

  function animateProgress() {
    stopProgress();
    if (!playing || stepFinished) return;
    const remaining = Math.max(0, activeDuration - progressElapsed);
    progress.style.width = Math.min(100, (progressElapsed / activeDuration) * 100) + '%';
    void progress.offsetWidth;
    progressStartedAt = performance.now();
    progressFrame = window.requestAnimationFrame(() => {
      progressFrame = null;
      if (!playing || modal.hidden) return;
      progress.style.transition = 'width ' + remaining + 'ms linear';
      progress.style.width = '100%';
    });
  }

  function syncControls() {
    modal.dataset.playing = String(playing);
    previousButton.disabled = currentStep === 0;
    nextLabel.textContent = currentStep === copy.steps.length - 1 ? copy.finish : copy.next;
    nextButton.setAttribute('aria-label', nextLabel.textContent);
    const toggleText = playing ? copy.pause : stepFinished && currentStep === copy.steps.length - 1 ? copy.replay : copy.resume;
    toggleLabel.textContent = toggleText;
    toggleButton.setAttribute('aria-label', toggleText);
    playIcon.toggleAttribute('hidden', playing);
    pauseIcon.toggleAttribute('hidden', !playing);
    [...dots.children].forEach((dot, index) => {
      if (index === currentStep) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
  }

  function renderStepCopy() {
    const step = copy.steps[currentStep];
    titleNode.textContent = step.title;
    descriptionNode.textContent = step.description;
    tipNode.textContent = step.tip;
    countNode.textContent = copy.step + ' ' + (currentStep + 1) + ' ' + copy.of + ' ' + copy.steps.length;
    stage.dataset.captionPosition = step.position;
    stage.dataset.captionSide = step.side;
    syncControls();
  }

  function loadStep() {
    stopAdvanceTimer();
    stopProgress();
    postToFrame('STOP');
    stepFinished = false;
    progressElapsed = 0;
    activeDuration = durations[currentStep];
    progress.style.transition = 'none';
    progress.style.width = '0%';
    runCounter += 1;
    activeRunId = Date.now().toString(36) + '-' + runCounter;
    stage.classList.remove('is-ready');
    loading.hidden = false;
    renderStepCopy();
    frame.src = frameUrl(currentStep);
  }

  function setStep(index, forcePlaying = playing) {
    currentStep = Math.max(0, Math.min(copy.steps.length - 1, index));
    playing = Boolean(forcePlaying);
    loadStep();
  }

  function pauseTutorial() {
    if (!playing) return;
    playing = false;
    stopAdvanceTimer();
    stopProgress({ capture: true });
    postToFrame('PAUSE');
    syncControls();
  }

  function resumeTutorial() {
    if (playing) return;
    if (stepFinished) {
      if (currentStep === copy.steps.length - 1) setStep(0, true);
      else setStep(currentStep + 1, true);
      return;
    }
    playing = true;
    postToFrame('RESUME');
    animateProgress();
    syncControls();
  }

  function togglePlayback() {
    if (playing) pauseTutorial();
    else resumeTutorial();
  }

  function openTutorial() {
    lastFocused = document.activeElement;
    currentStep = 0;
    playing = !reducedMotion;
    modal.hidden = false;
    backgroundElements.forEach((node) => { node.inert = true; });
    document.body.classList.add('tutorial-open');
    loadStep();
    closeButton.focus({ preventScroll: true });
  }

  function closeTutorial() {
    stopAdvanceTimer();
    stopProgress();
    postToFrame('STOP');
    frame.src = 'about:blank';
    activeRunId = '';
    playing = false;
    stepFinished = false;
    stage.classList.remove('is-ready');
    loading.hidden = false;
    modal.hidden = true;
    backgroundElements.forEach((node) => { node.inert = initialInertState.get(node) || false; });
    document.body.classList.remove('tutorial-open');
    if (lastFocused instanceof HTMLElement) lastFocused.focus({ preventScroll: true });
  }

  function focusableNodes() {
    return [...modal.querySelectorAll('button:not(:disabled),[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')]
      .filter((node) => !node.hidden && node.getClientRects().length > 0);
  }

  window.addEventListener('message', (message) => {
    if (message.origin !== window.location.origin || message.source !== frame.contentWindow || message.data?.channel !== channel) return;
    if (Number(message.data.scene) !== currentStep) return;
    if (message.data.type === 'FRAME_READY') {
      stage.classList.add('is-ready');
      loading.hidden = true;
      postToFrame('START');
      return;
    }
    if (message.data.runId !== activeRunId) return;
    if (message.data.type === 'KEY_COMMAND') {
      if (message.data.key === 'Escape') closeTutorial();
      else if (message.data.key === 'ArrowLeft') setStep(currentStep - 1);
      else if (message.data.key === 'ArrowRight' && currentStep < copy.steps.length - 1) setStep(currentStep + 1);
      else if (message.data.key === ' ') togglePlayback();
      return;
    }
    if (message.data.type === 'PREPARED') {
      activeDuration = Number(message.data.duration) || durations[currentStep];
      progressElapsed = 0;
      if (playing) animateProgress();
      return;
    }
    if (message.data.type === 'STEP_DONE') {
      stepFinished = true;
      progressElapsed = activeDuration;
      stopProgress();
      progress.style.width = '100%';
      if (playing && currentStep < copy.steps.length - 1) {
        advanceTimer = window.setTimeout(() => setStep(currentStep + 1, true), reducedMotion ? 0 : 420);
      } else if (currentStep === copy.steps.length - 1) {
        playing = false;
        syncControls();
      }
    }
  });

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
      if (currentStep > 0) setStep(currentStep - 1);
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
    if (document.hidden && !modal.hidden && playing) pauseTutorial();
  });
})();
