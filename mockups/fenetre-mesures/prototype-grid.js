(() => {
  const prototypeRoot = document.querySelector('.prototype');
  const windowList = document.querySelector('[data-window-list]');
  const windowTemplate = document.querySelector('template[data-window-template]');
  const addWindowButton = document.querySelector('[data-add-window]');
  const paneActionModal = document.querySelector('[data-pane-action-modal]');
  const windowRenameModal = document.querySelector('[data-window-rename-modal]');
  const windowRenameForm = document.querySelector('[data-window-rename-form]');
  const windowRenameInput = document.querySelector('[data-window-rename-input]');
  const windowRenameError = document.querySelector('[data-window-rename-error]');
  const windowIncompleteModal = document.querySelector('[data-window-incomplete-modal]');
  const windowIncompleteCode = document.querySelector('[data-window-incomplete-code]');
  const windowIncompleteTitle = document.querySelector('[data-window-incomplete-title]');
  const windowIncompleteMessage = document.querySelector('[data-window-incomplete-message]');
  const windowIncompleteReturn = document.querySelector('[data-window-incomplete-return]');
  const windowIncompleteContinue = document.querySelector('[data-window-incomplete-continue]');
  const undoButtons = [...document.querySelectorAll('[data-undo]')];
  const redoButtons = [...document.querySelectorAll('[data-redo]')];
  const toast = document.querySelector('[data-toast]');
  const helpPanel = document.querySelector('[data-help-panel]');
  const helpTitle = helpPanel?.querySelector('[data-help-title]');
  const helpBody = helpPanel?.querySelector('[data-help-body]');
  const helpKicker = helpPanel?.querySelector('[data-help-kicker]');
  const helpClose = helpPanel?.querySelector('[data-help-close]');
  if (!prototypeRoot || !windowList || !windowTemplate || !paneActionModal || !windowRenameModal || !windowRenameForm || !windowRenameInput || !windowIncompleteModal || !windowIncompleteCode || !windowIncompleteTitle || !windowIncompleteMessage || !windowIncompleteReturn || !windowIncompleteContinue || !undoButtons.length || !redoButtons.length || !helpPanel || !helpTitle || !helpBody || !helpClose) return;

  const MAX_PANES = 12;
  const MIN_CHILD_PX = 52;
  const languageParams = new URLSearchParams(window.location.search);
  const requestedClientLanguage = languageParams.get('clientLang')
    || languageParams.get('lang')
    || prototypeRoot.dataset.clientLanguage
    || document.documentElement.lang
    || 'fr';
  const clientLanguage = requestedClientLanguage.toLowerCase().startsWith('en') ? 'en' : 'fr';
  const appCopy = clientLanguage === 'en'
    ? {
        documentTitle: 'Window measurements | Vosthermos', back: 'Back to the five styles', mode: 'Final measurements', steps: 'Measurement steps', measured: 'measured', windows: 'Windows to measure',
        addWindow: 'Add another window', addWindowHelp: 'Create a new glazing plan', defaultWindowName: 'Living room',
        toolbar: 'Choose a window type or take a photo', chooseType: 'Choose a window type', selection: 'Selected:', quickConfigurations: 'Quick configurations', or: 'or',
        photo: {
          take: 'Take a photo', retake: 'Retake the photo', analyzing: 'Analyzing photo…', input: (label) => label + ' of the window',
          detectedHelp: 'Divisions are detected automatically', analyzingHelp: 'The drawing is created automatically', replaceHelp: 'A new photo will replace this analysis',
          invalid: 'Choose a window photo.', analyzingMessage: 'Analyzing the photo automatically…', unknownLayout: 'Unrecognized layout',
          applied: (label) => 'Photo analyzed · “' + label + '” layout applied.', retained: 'Photo saved · drawing unchanged.',
          failed: 'Photo saved. Divisions were not recognized: retake it straight on or choose a type.', linked: 'Photo linked to this file.',
        },
        canvas: 'Interactive window drawing', editSelected: 'Edit selected glass unit', editSelectedHelp: 'Split vertically or horizontally', selectedUnit: 'Selected glass unit',
        measurements: 'Measurements', dimensions: { width: 'Width', height: 'Height', thickness: 'Thickness' }, fraction: (label) => label + ' fraction',
        glassOptions: 'Glass unit options', tempered: 'Tempered', laminated: 'Laminated', notes: 'Special notes', notesPlaceholder: 'Shape, defect, access, special details…',
        decorative: 'Decorative grilles', decorativeHelp: 'Add grille lines without creating new glass units', decorativeInstruction: 'Choose the number of grille lines in this glass unit only.', yes: 'Yes', no: 'No',
        vertical: 'Vertical', horizontal: 'Horizontal', removeLine: (axis) => 'Remove one ' + axis.toLowerCase() + ' line', addLine: (axis) => 'Add one ' + axis.toLowerCase() + ' line',
        rename: { title: 'Rename window', close: 'Close', field: 'Room or window name', placeholder: 'e.g. Living room', cancel: 'Cancel', save: 'Save', required: 'Enter a name for this window.' },
        divide: {
          title: 'Split this glass unit', intro: 'Create 2 to 4 glass units in the selected section.', close: 'Close', options: 'Division options', direction: 'Choose the direction',
          sideBySide: 'Panes side by side', stacked: 'Panes stacked', count: 'Choose the number', sections: 'sections', chooseAxis: 'Choose vertical or horizontal',
          directionResult: (label, count, direction) => label + ' will become ' + count + ' glass units ' + direction + '.',
          sideBySideResult: 'side by side', stackedResult: 'stacked', maximumAria: (count, max) => count + ' sections would exceed the maximum of ' + max + ' glass units',
          maximumResult: (total, max) => 'This division would create ' + total + ' glass units; maximum ' + max + '.',
          dataWarning: (label) => 'The current measurements and options for ' + label + ' will be erased.',
          create: (count) => 'Create ' + count + ' sections', createAndErase: (count) => 'Create ' + count + ' sections and erase data',
        },
        progressAria: (complete, total, where) => complete + ' glass unit' + (complete === 1 ? '' : 's') + ' measured out of ' + total + ' in ' + where,
        progressStep: (complete) => complete ? 'measured' : 'to measure',
        divider: {
          label: (axis, index, linked) => (axis === 'vertical' ? 'Vertical divider ' : 'Horizontal divider ') + index + (linked ? ', continues across all rows' : ''),
          title: (axis) => axis === 'vertical' ? 'Drag left or right' : 'Drag up or down',
        },
        layout: {
          custom: (count) => 'Custom layout · ' + count + ' glass unit' + (count === 1 ? '' : 's'),
          grid: (columns, rows, count) => columns + ' column' + (columns === 1 ? '' : 's') + ' × ' + rows + ' row' + (rows === 1 ? '' : 's') + ' · ' + count + ' glass unit' + (count === 1 ? '' : 's'),
        },
        editorState: { none: 'No glass unit', complete: 'Measurements complete', progress: 'Measurements in progress', empty: 'To measure' },
        editAria: (code, pane) => 'Edit selected glass unit ' + code + ' ' + pane, noSelection: 'No glass unit selected', renameAria: (code, name) => 'Rename ' + code + ' ' + name,
        presetAlreadyDetected: (label) => 'Detected layout: ' + label + '. It is already applied.', presetAlreadyActive: (label) => 'The “' + label + '” layout is already active.',
        changeLayoutConfirm: (code) => 'Changing the layout will erase the measurements for ' + code + '. Continue?',
        presetCreated: (label, count, detected) => (detected ? 'Detected layout: ' + label + '. ' : '“' + label + '” layout created. ') + count + ' glass unit' + (count === 1 ? '' : 's') + ' to measure.',
        maximumReached: (max, code) => 'Maximum of ' + max + ' glass units reached in ' + code + '.',
        splitConfirm: (code, pane) => 'The measurements and options for ' + code + ' ' + pane + ' will be erased. Continue?',
        splitCreated: (count, code, pane) => count + ' sections created in ' + code + ' ' + pane + '.', equalized: (code) => 'All dividers in ' + code + ' were distributed equally.',
        resetConfirm: (code) => 'Reset only ' + code + ' and its measurements?', resetDone: (code) => code + ' was reset.', renamed: (code, name) => code + ' renamed “' + name + '”.', added: (code) => code + ' added.',
        presets: {
          '1x1': { label: 'Single glass unit', aria: 'Create one glass unit' },
          '2x1-narrow-left': { label: 'Small on left', summary: 'Small on left', aria: 'Create a small pane on the left and a large pane on the right' },
          '2x1': { label: 'Two equal', aria: 'Create two equal panes side by side' }, '1x2': { label: 'Two stacked', aria: 'Create two stacked panes' },
          '3x1': { label: 'Three side by side', aria: 'Create three panes side by side' }, '2x2': { label: 'Four equal', aria: 'Create four equal panes' },
          '3x2': { label: 'Six equal', aria: 'Create six equal panes' }, '3x3': { label: 'Nine equal', aria: 'Create nine equal panes' },
          'top-3-bottom-1': { label: 'Three on top', summary: '3 on top, 1 on bottom', aria: 'Create three panes on top and one large pane below' },
          'top-1-bottom-3': { label: 'Three on bottom', summary: '1 on top, 3 on bottom', aria: 'Create one large pane on top and three panes below' },
          'left-1-right-3': { label: 'Large on left', summary: 'Large on left, 3 on right', aria: 'Create one large pane on the left and three panes on the right' },
          'left-3-right-1': { label: 'Large on right', summary: '3 on left, large on right', aria: 'Create three panes on the left and one large pane on the right' },
        },
      }
    : {
        documentTitle: 'Mesures de fenêtres | Vosthermos', back: 'Retour aux cinq styles', mode: 'Mesures finales', steps: 'Étapes de mesure', measured: 'mesurés', windows: 'Fenêtres à mesurer',
        addWindow: 'Ajouter une autre fenêtre', addWindowHelp: 'Créer un nouveau plan de vitrage', defaultWindowName: 'Salon',
        toolbar: 'Choisir un type de fenêtre ou prendre une photo', chooseType: 'Choisir un type de fenêtre', selection: 'Sélection :', quickConfigurations: 'Configurations rapides', or: 'ou',
        photo: {
          take: 'Prendre une photo', retake: 'Reprendre la photo', analyzing: 'Analyse de la photo…', input: (label) => label + ' de la fenêtre',
          detectedHelp: 'Les divisions seront détectées automatiquement', analyzingHelp: 'Le dessin se crée automatiquement', replaceHelp: 'Une nouvelle photo remplacera cette analyse',
          invalid: 'Choisissez une photo de fenêtre.', analyzingMessage: 'Analyse automatique de la photo…', unknownLayout: 'Disposition non reconnue',
          applied: (label) => 'Photo analysée · disposition « ' + label + ' » appliquée.', retained: 'Photo conservée · dessin non modifié.',
          failed: 'Photo conservée. Divisions non reconnues : reprenez-la bien de face ou choisissez un type.', linked: 'Photo liée à ce dossier.',
        },
        canvas: 'Dessin interactif de la fenêtre', editSelected: 'Modifier le thermos sélectionné', editSelectedHelp: 'Diviser verticalement ou horizontalement', selectedUnit: 'Thermos sélectionné',
        measurements: 'Mesures', dimensions: { width: 'Largeur', height: 'Hauteur', thickness: 'Épaisseur' }, fraction: (label) => 'Fraction ' + label.toLowerCase(),
        glassOptions: 'Options du thermos', tempered: 'Trempé', laminated: 'Laminé', notes: 'Notes particulières', notesPlaceholder: 'Forme, défaut, accès, particularité…',
        decorative: 'Carreaux décoratifs', decorativeHelp: 'Ajouter des lignes sans créer de nouveaux thermos', decorativeInstruction: 'Choisissez le nombre de lignes dans ce thermos seulement.', yes: 'Oui', no: 'Non',
        vertical: 'Vertical', horizontal: 'Horizontal', removeLine: (axis) => 'Retirer une ligne ' + axis.toLowerCase(), addLine: (axis) => 'Ajouter une ligne ' + axis.toLowerCase(),
        rename: { title: 'Renommer la fenêtre', close: 'Fermer', field: 'Nom de la pièce ou de la fenêtre', placeholder: 'Ex. Salon', cancel: 'Annuler', save: 'Enregistrer', required: 'Entrez un nom pour cette fenêtre.' },
        divide: {
          title: 'Diviser ce thermos', intro: 'Créez de 2 à 4 thermos dans la section sélectionnée.', close: 'Fermer', options: 'Options de division', direction: 'Choisissez le sens',
          sideBySide: 'Vitres côte à côte', stacked: 'Vitres superposées', count: 'Choisissez le nombre', sections: 'sections', chooseAxis: 'Choisir vertical ou horizontal',
          directionResult: (label, count, direction) => label + ' deviendra ' + count + ' thermos ' + direction + '.',
          sideBySideResult: 'côte à côte', stackedResult: 'superposés', maximumAria: (count, max) => count + ' sections dépasseraient le maximum de ' + max + ' thermos',
          maximumResult: (total, max) => 'Cette division créerait ' + total + ' thermos; maximum ' + max + '.',
          dataWarning: (label) => 'Les mesures et options actuelles de ' + label + ' seront effacées.',
          create: (count) => 'Créer ' + count + ' sections', createAndErase: (count) => 'Créer ' + count + ' sections et effacer les données',
        },
        progressAria: (complete, total, where) => complete + ' thermos sur ' + total + ' mesurés dans ' + where,
        progressStep: (complete) => complete ? 'mesuré' : 'à mesurer',
        divider: {
          label: (axis, index, linked) => (axis === 'vertical' ? 'Séparation verticale ' : 'Séparation horizontale ') + index + (linked ? ', continue sur toutes les rangées' : ''),
          title: (axis) => axis === 'vertical' ? 'Glisser à gauche ou à droite' : 'Glisser vers le haut ou le bas',
        },
        layout: {
          custom: (count) => 'Disposition personnalisée · ' + count + ' thermos',
          grid: (columns, rows, count) => columns + ' colonne' + (columns === 1 ? '' : 's') + ' × ' + rows + ' rangée' + (rows === 1 ? '' : 's') + ' · ' + count + ' thermos',
        },
        editorState: { none: 'Aucun thermos', complete: 'Mesures complètes', progress: 'Mesures en cours', empty: 'À mesurer' },
        editAria: (code, pane) => 'Modifier le thermos sélectionné ' + code + ' ' + pane, noSelection: 'Aucun thermos sélectionné', renameAria: (code, name) => 'Renommer ' + code + ' ' + name,
        presetAlreadyDetected: (label) => 'Disposition détectée : ' + label + '. Elle est déjà appliquée.', presetAlreadyActive: (label) => 'La disposition « ' + label + ' » est déjà active.',
        changeLayoutConfirm: (code) => 'Changer la disposition effacera les mesures de ' + code + '. Continuer?',
        presetCreated: (label, count, detected) => (detected ? 'Disposition détectée : ' + label + '. ' : 'Disposition « ' + label + ' » créée. ') + count + ' thermos à mesurer.',
        maximumReached: (max, code) => 'Maximum de ' + max + ' thermos atteint dans ' + code + '.',
        splitConfirm: (code, pane) => 'Les mesures et options de ' + code + ' ' + pane + ' seront effacées. Continuer?',
        splitCreated: (count, code, pane) => count + ' sections créées dans ' + code + ' ' + pane + '.', equalized: (code) => 'Toutes les divisions de ' + code + ' ont été réparties également.',
        resetConfirm: (code) => 'Réinitialiser seulement ' + code + ' et ses mesures?', resetDone: (code) => code + ' a été réinitialisée.', renamed: (code, name) => code + ' renommée « ' + name + ' ».', added: (code) => code + ' ajoutée.',
        presets: {
          '1x1': { label: 'Vitre simple', aria: 'Créer une vitre simple' },
          '2x1-narrow-left': { label: 'Petite à gauche', summary: 'Petite à gauche', aria: 'Créer une petite vitre à gauche et une grande à droite' },
          '2x1': { label: 'Deux égaux', aria: 'Créer deux vitres égales côte à côte' }, '1x2': { label: 'Deux superposés', aria: 'Créer deux vitres superposées' },
          '3x1': { label: 'Trois côte à côte', aria: 'Créer trois vitres côte à côte' }, '2x2': { label: 'Quatre égaux', aria: 'Créer quatre vitres égales' },
          '3x2': { label: 'Six égaux', aria: 'Créer six vitres égales' }, '3x3': { label: 'Neuf égaux', aria: 'Créer neuf vitres égales' },
          'top-3-bottom-1': { label: 'Trois en haut', summary: '3 en haut, 1 en bas', aria: 'Créer trois vitres en haut et une grande en bas' },
          'top-1-bottom-3': { label: 'Trois en bas', summary: '1 en haut, 3 en bas', aria: 'Créer une grande vitre en haut et trois en bas' },
          'left-1-right-3': { label: 'Grand à gauche', summary: 'Grand à gauche, 3 à droite', aria: 'Créer une grande vitre à gauche et trois à droite' },
          'left-3-right-1': { label: 'Grand à droite', summary: '3 à gauche, grand à droite', aria: 'Créer trois vitres à gauche et une grande à droite' },
        },
      };
  const paneCopy = clientLanguage === 'en'
    ? {
        editing: 'You are editing',
        choose: 'Tap to select',
        measurementsRequiredLabel: 'Measurements required.',
        selectedLabel: (code, paneCode) => code + ', glass unit ' + paneCode + '. You are editing this glass unit.',
        availableLabel: (code, paneCode) => code + ', glass unit ' + paneCode + '. Select this glass unit.',
      }
    : {
        editing: 'Vous éditez',
        choose: 'Toucher pour choisir',
        measurementsRequiredLabel: 'Mesures à remplir.',
        selectedLabel: (code, paneCode) => code + ', thermos ' + paneCode + '. Vous éditez ce thermos.',
        availableLabel: (code, paneCode) => code + ', thermos ' + paneCode + '. Sélectionner ce thermos.',
      };
  const incompleteWindowCopy = clientLanguage === 'en'
    ? {
        kicker: 'Incomplete measurements',
        title: (code, name) => code + ' · ' + name + ' is not complete',
        close: 'Close',
        action: 'Complete measurements',
        continue: 'Add anyway',
        message: (missing, total) => 'There ' + (missing === 1 ? 'is ' : 'are ') + missing + ' glass unit' + (missing === 1 ? '' : 's') + ' left to measure out of ' + total + '.',
      }
    : {
        kicker: 'Mesures incomplètes',
        title: (code, name) => code + ' · ' + name + ' n’est pas terminée',
        close: 'Fermer',
        action: 'Compléter les mesures',
        continue: 'Ajouter quand même',
        message: (missing, total) => 'Il reste ' + missing + ' thermos sur ' + total + ' à mesurer.',
      };
  windowIncompleteCode.textContent = incompleteWindowCopy.kicker;
  windowIncompleteTitle.textContent = incompleteWindowCopy.title('F01', appCopy.defaultWindowName);
  windowIncompleteMessage.textContent = incompleteWindowCopy.message(1, 1);
  windowIncompleteReturn.textContent = incompleteWindowCopy.action;
  windowIncompleteContinue.textContent = incompleteWindowCopy.continue;
  windowIncompleteModal.lang = clientLanguage;
  windowIncompleteModal.querySelectorAll('[data-close-window-incomplete]').forEach((button) => {
    button.setAttribute('aria-label', incompleteWindowCopy.close);
  });
  const historyCopy = clientLanguage === 'en'
    ? {
        group: 'Change history', undo: 'Undo last change', redo: 'Redo last change',
        undoLabel: 'Undo', redoLabel: 'Redo', finalizeLabel: 'Confirm final measurements', undone: 'Last change undone.', redone: 'Last change restored.', wait: 'Wait until the photo analysis is complete.',
      }
    : {
        group: 'Historique des modifications', undo: 'Annuler la dernière modification', redo: 'Rétablir la dernière modification',
        undoLabel: 'Annuler', redoLabel: 'Rétablir', finalizeLabel: 'Valider les mesures finales', undone: 'Dernière modification annulée.', redone: 'Dernière modification rétablie.', wait: 'Attendez la fin de l’analyse de la photo.',
      };
  const thermosSelectCopy = clientLanguage === 'en'
    ? {
        labels: { spacer: 'Spacer', glazing: 'Glazing', access: 'Access' },
        options: {
          spacer: { '': 'Choose', unknown: 'I don’t know / Unknown', black: 'Black', gray: 'Gray', white: 'White', stainless: 'Stainless steel' },
          glazing: { '': 'Choose', unknown: 'I don’t know / Unknown', double: 'Double', triple: 'Triple', single: 'Single' },
          access: { '': 'Choose', with_ladder: 'With ladder', without_ladder: 'Without ladder' },
        },
      }
    : {
        labels: { spacer: 'Intercalaire', glazing: 'Vitrage', access: 'Accès' },
        options: {
          spacer: { '': 'Choisir', unknown: 'Je ne sais pas / Inconnu', black: 'Noir', gray: 'Gris', white: 'Blanc', stainless: 'Inox' },
          glazing: { '': 'Choisir', unknown: 'Je ne sais pas / Inconnu', double: 'Double', triple: 'Triple', single: 'Simple' },
          access: { '': 'Choisir', with_ladder: 'Avec échelle', without_ladder: 'Sans échelle' },
        },
      };
  const DIMENSION_KEYS = ['width', 'height', 'thickness'];
  const UNIT_CONFIG = {
    in: { factor: 1, decimals: 4 },
    mm: { factor: 25.4, decimals: 2 },
    cm: { factor: 2.54, decimals: 3 },
  };
  const DIMENSION_MAX_INCHES = { width: 240, height: 240, thickness: 2 };
  const unitCopy = clientLanguage === 'en'
    ? { title: 'Unit', in: 'in', changed: 'Measurement unit', invalid: 'Enter a valid measurement.', maximum: 'Maximum' }
    : { title: 'Unité', in: 'po', changed: 'Unité de mesure', invalid: 'Entrez une mesure valide.', maximum: 'Maximum' };
  const helpCopy = clientLanguage === 'en'
    ? {
        kicker: 'Quick help', close: 'Close help', trigger: 'Open help',
        plan: {
          title: 'Using the plan',
          body: 'Tap a glass unit (T1, T2…) to select it. Drag the arrows on a divider to adjust the proportions. The drawing identifies each unit; it is not to scale.',
        },
        photo: {
          title: 'What is the photo used for?',
          body: 'Take the photo straight on. It detects the divisions and stays attached to the file, beside the model in the admin report. It never appears behind the drawing and does not replace the measurements.',
        },
        measurements: {
          title: 'What should I measure?',
          body: 'Each T1, T2… represents one sealed glass unit. Enter that unit’s dimensions, not the full frame. Thickness means the complete sealed unit.',
        },
        'glass-options': {
          title: 'Understanding the options',
          body: 'These choices describe the selected glass unit only.',
          items: [
            ['Low-E', 'Coating that reduces heat loss.'], ['Argon', 'Insulating gas between the panes.'],
            ['Tempered', 'Heat-treated safety glass.'], ['Laminated', 'Glass held together by an interlayer.'],
            ['Spacer', 'Perimeter bar separating the panes.'], ['Glazing', 'Number of glass panes. Choose “I don’t know / Unknown” when needed.'],
            ['Access', 'Indicates whether a ladder is required to reach the glass unit.'],
          ],
        },
        finalization: {
          title: 'Undo, redo or confirm?',
          body: 'Undo reverses the latest change. Redo restores it. Confirm marks all measurements as final and ready for the next step.',
        },
      }
    : {
        kicker: 'Aide rapide', close: 'Fermer l’aide', trigger: 'Ouvrir l’aide',
        plan: {
          title: 'Utiliser le plan',
          body: 'Touchez un thermos (T1, T2…) pour le sélectionner. Faites glisser les flèches sur les séparations pour ajuster les proportions. Le dessin sert à identifier les thermos; il n’est pas à l’échelle.',
        },
        photo: {
          title: 'À quoi sert la photo?',
          body: 'Prenez la fenêtre bien de face. La photo sert à détecter les divisions et reste jointe au dossier, à côté du modèle dans le rapport admin. Elle n’apparaît jamais derrière le dessin et ne remplace pas les mesures.',
        },
        measurements: {
          title: 'Quoi mesurer?',
          body: 'Chaque T1, T2… représente un thermos, soit une unité de vitrage scellée. Entrez les dimensions de ce thermos, pas celles du cadre complet. L’épaisseur correspond à l’unité complète.',
        },
        'glass-options': {
          title: 'Comprendre les options',
          body: 'Ces choix décrivent seulement le thermos sélectionné.',
          items: [
            ['Low-E', 'Couche qui réduit les pertes de chaleur.'], ['Argon', 'Gaz isolant entre les vitres.'],
            ['Trempé', 'Verre de sécurité traité.'], ['Laminé', 'Verre retenu par une pellicule.'],
            ['Intercalaire', 'Barre au pourtour qui sépare les vitres.'], ['Vitrage', 'Nombre de feuilles de verre. Choisissez « Je ne sais pas / Inconnu » au besoin.'],
            ['Accès', 'Indique si une échelle est nécessaire pour atteindre le thermos.'],
          ],
        },
        finalization: {
          title: 'Annuler, rétablir ou valider?',
          body: 'Annuler revient sur la dernière modification. Rétablir la remet. Valider confirme que toutes les mesures sont finales et prêtes pour la prochaine étape.',
        },
      };
  const PRESETS = {
    '1x1': { columns: 1, rows: 1, ...appCopy.presets['1x1'] },
    '2x1-narrow-left': { columns: 2, rows: 1, sizes: [34, 66], ...appCopy.presets['2x1-narrow-left'] },
    '2x1': { columns: 2, rows: 1, ...appCopy.presets['2x1'] },
    '1x2': { columns: 1, rows: 2, ...appCopy.presets['1x2'] },
    '3x1': { columns: 3, rows: 1, ...appCopy.presets['3x1'] },
    '2x2': { columns: 2, rows: 2, ...appCopy.presets['2x2'] },
    '3x2': { columns: 3, rows: 2, ...appCopy.presets['3x2'] },
    '3x3': { columns: 3, rows: 3, ...appCopy.presets['3x3'] },
    'top-3-bottom-1': { layout: 'top-3-bottom-1', ...appCopy.presets['top-3-bottom-1'] },
    'top-1-bottom-3': { layout: 'top-1-bottom-3', ...appCopy.presets['top-1-bottom-3'] },
    'left-1-right-3': { layout: 'left-1-right-3', ...appCopy.presets['left-1-right-3'] },
    'left-3-right-1': { layout: 'left-3-right-1', ...appCopy.presets['left-3-right-1'] },
  };
  const fractionBySixteenth = ['', '1/16', '1/8', '3/16', '1/4', '5/16', '3/8', '7/16', '1/2', '9/16', '5/8', '11/16', '3/4', '13/16', '7/8', '15/16'];
  const fractions = [...fractionBySixteenth];
  const controllers = [];
  const controllerById = new Map();
  const photoFileRegistry = new Map();
  const HISTORY_LIMIT = 80;
  const undoStack = [];
  const redoStack = [];
  let windowSequence = 0;
  let activeWindowId = null;
  let measurementUnit = 'in';
  let historyPresent = null;
  let historyPresentFingerprint = '';
  let historyLastGroup = null;
  let historyRestoring = false;
  let historyTransactionSequence = 0;
  let photoFileSequence = 0;
  let pendingPhotoAnalyses = 0;
  let toastTimer;
  let activeHelpTrigger = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function blankMeasurement() {
    return {
      widthInches: null, heightInches: null, thicknessInches: null,
      lowE: false, argon: false, tempered: false, laminated: false,
      spacer: '', glazing: '', access: '', notes: '',
    };
  }

  function blankDecorative() {
    return { enabled: false, vertical: 0, horizontal: 0 };
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

  function fractionToDecimal(value) {
    if (!value) return 0;
    const [numerator, denominator] = String(value).split('/').map(Number);
    return Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0 ? numerator / denominator : 0;
  }

  function parseLocalizedNumber(value) {
    const normalized = String(value ?? '').trim().replace(/\s+/g, '').replace(',', '.');
    if (!normalized) return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : NaN;
  }

  function formatLocalizedNumber(value, decimals) {
    if (!Number.isFinite(value)) return '';
    const formatted = value.toFixed(decimals).replace(/(\.[0-9]*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
    return clientLanguage === 'fr' ? formatted.replace('.', ',') : formatted;
  }

  function imperialParts(inches) {
    if (!Number.isFinite(inches)) return { whole: '', fraction: '', approximate: false };
    const roundedSixteenths = Math.round(inches * 16);
    const whole = Math.floor(roundedSixteenths / 16);
    const remainder = ((roundedSixteenths % 16) + 16) % 16;
    return {
      whole: String(whole),
      fraction: fractionBySixteenth[remainder] || '',
      approximate: Math.abs(inches - roundedSixteenths / 16) > .00001,
    };
  }

  function dimensionForDisplay(measurement, key, unit = measurementUnit) {
    const inches = measurement?.[key + 'Inches'];
    if (!Number.isFinite(inches)) return { text: '', whole: '', fraction: '', approximate: false };
    if (unit === 'in') {
      const parts = imperialParts(inches);
      const value = [parts.whole, parts.fraction].filter(Boolean).join(' ') || '0';
      return { ...parts, text: (parts.approximate ? '≈ ' : '') + value };
    }
    return {
      text: formatLocalizedNumber(inches * UNIT_CONFIG[unit].factor, UNIT_CONFIG[unit].decimals),
      whole: '',
      fraction: '',
      approximate: false,
    };
  }

  function unitSuffix(unit = measurementUnit) {
    return unit === 'in' ? unitCopy.in : unit;
  }

  function paneSummary(pane) {
    const value = pane.measurement;
    const width = dimensionForDisplay(value, 'width').text;
    const height = dimensionForDisplay(value, 'height').text;
    const thickness = dimensionForDisplay(value, 'thickness').text;
    if (!width && !height && !thickness) return '';
    return (width || '—') + ' × ' + (height || '—') + ' × ' + (thickness || '—') + ' ' + unitSuffix();
  }

  function paneIsComplete(pane) {
    return DIMENSION_KEYS.every((key) => Number.isFinite(pane.measurement[key + 'Inches']) && pane.measurement[key + 'Inches'] > 0);
  }

  function paneHasData(pane) {
    const hasMeasurement = Object.values(pane.measurement).some((value) => value === true
      || (typeof value === 'string' && value !== '')
      || (typeof value === 'number' && Number.isFinite(value)));
    return hasMeasurement || Boolean(pane.decorative.enabled) || pane.decorative.vertical > 0 || pane.decorative.horizontal > 0;
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

  function localizeThermosSelects(root = document) {
    ['spacer', 'glazing', 'access'].forEach((key) => {
      root.querySelectorAll('select[data-measure-key="' + key + '"]').forEach((select) => {
        const label = select.closest('label')?.querySelector('.field-label');
        if (label) label.textContent = thermosSelectCopy.labels[key];
        [...select.options].forEach((option) => {
          const text = thermosSelectCopy.options[key]?.[option.value];
          if (text) option.textContent = text;
        });
      });
    });
  }

  function setText(root, selector, value) {
    root.querySelectorAll(selector).forEach((node) => { node.textContent = value; });
  }

  function setAttribute(root, selector, name, value) {
    root.querySelectorAll(selector).forEach((node) => { node.setAttribute(name, value); });
  }

  function setLeadingText(node, value) {
    if (!node) return;
    const textNode = [...node.childNodes].find((child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim());
    if (textNode) textNode.textContent = value + ' ';
    else node.prepend(document.createTextNode(value + ' '));
  }

  function setTrailingText(node, value) {
    if (!node) return;
    const textNode = [...node.childNodes].reverse().find((child) => child.nodeType === Node.TEXT_NODE && child.textContent.trim());
    if (textNode) textNode.textContent = ' ' + value;
    else node.append(document.createTextNode(' ' + value));
  }

  function presetPaneCount(key) {
    const preset = PRESETS[key];
    if (!preset) return 0;
    if (preset.layout) return 4;
    return preset.columns * preset.rows;
  }

  function localizeWindowUi(root) {
    root.lang = clientLanguage;
    setTrailingText(root.querySelector('.plan-status'), appCopy.measured);
    setAttribute(root, '.division-toolbar', 'aria-label', appCopy.toolbar);
    setText(root, '.layout-presets-summary strong', appCopy.chooseType);
    setLeadingText(root.querySelector('.layout-presets-summary small'), appCopy.selection);
    setAttribute(root, '.layout-presets', 'aria-label', appCopy.quickConfigurations);
    root.querySelectorAll('[data-layout-preset]').forEach((button) => {
      const preset = PRESETS[button.dataset.layoutPreset];
      if (!preset) return;
      const count = presetPaneCount(button.dataset.layoutPreset);
      const label = button.querySelector('.preset-copy strong');
      const quantity = button.querySelector('.preset-copy small');
      if (label) label.textContent = preset.label;
      if (quantity) quantity.textContent = count + ' ' + (clientLanguage === 'en' ? 'glass unit' + (count === 1 ? '' : 's') : 'thermos');
      button.setAttribute('aria-label', preset.aria);
    });
    setText(root, '.layout-choice-or span', appCopy.or);
    setAttribute(root, '[data-window-canvas]', 'aria-label', appCopy.canvas);
    setText(root, '.edit-thermos-copy strong', appCopy.editSelected);
    setText(root, '.edit-thermos-copy small', appCopy.editSelectedHelp);
    setAttribute(root, '[data-thermos-editor]', 'aria-label', appCopy.selectedUnit);
    setText(root, '.thermos-editor-kicker', appCopy.selectedUnit);
    setText(root, '.thermos-measure-head h4', appCopy.measurements);
    DIMENSION_KEYS.forEach((key) => {
      const input = root.querySelector('[data-measure-dimension="' + key + '"][data-measure-part="value"]');
      const fraction = root.querySelector('[data-measure-dimension="' + key + '"][data-measure-part="fraction"]');
      const label = appCopy.dimensions[key];
      const fieldLabel = input?.closest('.dimension')?.querySelector('.field-label');
      if (fieldLabel) fieldLabel.textContent = label + ' *';
      fraction?.setAttribute('aria-label', appCopy.fraction(label));
    });
    const optionSection = root.querySelector('.thermos-option-grid')?.closest('.thermos-editor-section');
    const optionHeading = optionSection?.querySelector('h4');
    if (optionHeading) optionHeading.textContent = appCopy.glassOptions;
    const tempered = root.querySelector('[data-measure-key="tempered"]')?.closest('label');
    const laminated = root.querySelector('[data-measure-key="laminated"]')?.closest('label');
    setTrailingText(tempered, appCopy.tempered);
    setTrailingText(laminated, appCopy.laminated);
    const notes = root.querySelector('[data-measure-key="notes"]');
    if (notes) notes.placeholder = appCopy.notesPlaceholder;
    const notesLabel = notes?.closest('label')?.querySelector('.field-label');
    if (notesLabel) notesLabel.textContent = appCopy.notes;
    setText(root, '.decorative-toggle-copy strong', appCopy.decorative);
    setText(root, '.decorative-toggle-copy small', appCopy.decorativeHelp);
    setText(root, '.decorative-options > p', appCopy.decorativeInstruction);
    root.querySelectorAll('[data-counter]').forEach((counter) => {
      const axis = counter.dataset.counter === 'vertical' ? appCopy.vertical : appCopy.horizontal;
      const label = counter.parentElement?.querySelector('.field-label');
      if (label) label.textContent = axis;
      counter.querySelector('[data-delta="-1"]')?.setAttribute('aria-label', appCopy.removeLine(axis));
      counter.querySelector('[data-delta="1"]')?.setAttribute('aria-label', appCopy.addLine(axis));
    });
  }

  function localizeStaticUi() {
    document.documentElement.lang = clientLanguage;
    document.title = appCopy.documentTitle;
    prototypeRoot.lang = clientLanguage;
    setAttribute(document, '.back-to-index', 'aria-label', appCopy.back);
    setText(document, '.mode-chip', appCopy.mode);
    setText(document, '.dossier-progress .progress-head > span', appCopy.steps);
    setTrailingText(document.querySelector('.dossier-progress .progress-head strong'), appCopy.measured);
    setAttribute(document, '[data-window-list]', 'aria-label', appCopy.windows);
    setText(document, '.add-window-copy strong', appCopy.addWindow);
    setText(document, '.add-window-copy small', appCopy.addWindowHelp);
    if (helpKicker) helpKicker.textContent = helpCopy.kicker;
    helpClose.setAttribute('aria-label', helpCopy.close);

    windowRenameModal.lang = clientLanguage;
    setText(windowRenameModal, '#window-rename-title', appCopy.rename.title);
    setAttribute(windowRenameModal, '[data-close-window-rename]', 'aria-label', appCopy.rename.close);
    setText(windowRenameModal, '.window-rename-field > span', appCopy.rename.field);
    windowRenameInput.placeholder = appCopy.rename.placeholder;
    const renameButtons = windowRenameModal.querySelectorAll('.window-rename-actions button');
    if (renameButtons[0]) renameButtons[0].textContent = appCopy.rename.cancel;
    if (renameButtons[1]) renameButtons[1].textContent = appCopy.rename.save;

    paneActionModal.lang = clientLanguage;
    setText(paneActionModal, '#pane-action-title', appCopy.divide.title);
    setText(paneActionModal, '.pane-action-head p', appCopy.divide.intro);
    setAttribute(paneActionModal, '[data-close-pane-action]', 'aria-label', appCopy.divide.close);
    setAttribute(paneActionModal, '.pane-divide-action', 'aria-label', appCopy.divide.options);
    const actionLabels = paneActionModal.querySelectorAll('.pane-action-label');
    setTrailingText(actionLabels[0], appCopy.divide.direction);
    setTrailingText(actionLabels[1], appCopy.divide.count);
    const axisButtons = paneActionModal.querySelectorAll('[data-modal-axis]');
    if (axisButtons[0]) {
      const values = axisButtons[0].querySelectorAll('strong, small');
      if (values[0]) values[0].textContent = appCopy.vertical;
      if (values[1]) values[1].textContent = appCopy.divide.sideBySide;
    }
    if (axisButtons[1]) {
      const values = axisButtons[1].querySelectorAll('strong, small');
      if (values[0]) values[0].textContent = appCopy.horizontal;
      if (values[1]) values[1].textContent = appCopy.divide.stacked;
    }
    setText(paneActionModal, '.section-option small', appCopy.divide.sections);
    setText(paneActionModal, '[data-pane-action-result]', appCopy.divide.chooseAxis + '.');
    setText(paneActionModal, '[data-create-sections]', appCopy.divide.chooseAxis);
  }

  function captureDossierSnapshot() {
    return clone({
      activeWindowId,
      measurementUnit,
      windowSequence,
      windows: controllers.map((controller) => controller.snapshot()),
    });
  }

  function dossierFingerprint(snapshot) {
    return JSON.stringify({
      measurementUnit: snapshot.measurementUnit,
      windowSequence: snapshot.windowSequence,
      windows: snapshot.windows.map((windowSnapshot) => ({
        id: windowSnapshot.id,
        code: windowSnapshot.code,
        name: windowSnapshot.name,
        layout: windowSnapshot.layout,
        activePreset: windowSnapshot.activePreset,
        topologyPreset: windowSnapshot.topologyPreset,
        photo: windowSnapshot.photo,
        photoRef: windowSnapshot.photoRef,
        photoStatus: windowSnapshot.photoStatus,
        photoMessage: windowSnapshot.photoMessage,
        paneSequence: windowSnapshot.paneSequence,
        splitSequence: windowSnapshot.splitSequence,
        initialSnapshot: windowSnapshot.initialSnapshot,
      })),
    });
  }

  function prunePhotoFileRegistry() {
    const referenced = new Set();
    const collect = (snapshot) => snapshot?.windows?.forEach((windowSnapshot) => {
      if (windowSnapshot.photoRef) referenced.add(windowSnapshot.photoRef);
    });
    collect(historyPresent);
    undoStack.forEach(collect);
    redoStack.forEach(collect);
    photoFileRegistry.forEach((file, photoRef) => {
      if (!referenced.has(photoRef)) photoFileRegistry.delete(photoRef);
    });
  }

  function updateHistoryControls() {
    const canUndo = undoStack.length > 0;
    const canRedo = redoStack.length > 0;
    const photoAnalysisBusy = pendingPhotoAnalyses > 0;
    undoButtons.forEach((button) => {
      button.disabled = photoAnalysisBusy || !canUndo;
      button.setAttribute('aria-label', historyCopy.undo);
      button.title = photoAnalysisBusy ? historyCopy.wait : historyCopy.undo;
      const label = button.querySelector('.history-action-label');
      if (label) label.textContent = historyCopy.undoLabel;
    });
    redoButtons.forEach((button) => {
      button.disabled = photoAnalysisBusy || !canRedo;
      button.setAttribute('aria-label', historyCopy.redo);
      button.title = photoAnalysisBusy ? historyCopy.wait : historyCopy.redo;
      const label = button.querySelector('.history-action-label');
      if (label) label.textContent = historyCopy.redoLabel;
    });
    document.querySelectorAll('[data-finalize]').forEach((button) => { button.textContent = historyCopy.finalizeLabel; });
    document.querySelectorAll('.history-action-group').forEach((group) => group.setAttribute('aria-label', historyCopy.group));
  }

  function initializeHistory() {
    undoStack.length = 0;
    redoStack.length = 0;
    historyPresent = captureDossierSnapshot();
    historyPresentFingerprint = dossierFingerprint(historyPresent);
    historyLastGroup = null;
    updateHistoryControls();
  }

  function syncHistoryContext() {
    if (historyRestoring || !historyPresent) return;
    const nextSnapshot = captureDossierSnapshot();
    if (dossierFingerprint(nextSnapshot) !== historyPresentFingerprint) return;
    historyPresent = nextSnapshot;
  }

  function markDirty(historyGroup = null) {
    if (historyRestoring) return false;
    const nextSnapshot = captureDossierSnapshot();
    const nextFingerprint = dossierFingerprint(nextSnapshot);
    if (!historyPresent) {
      historyPresent = nextSnapshot;
      historyPresentFingerprint = nextFingerprint;
      updateHistoryControls();
      return false;
    }
    if (nextFingerprint === historyPresentFingerprint) {
      historyPresent = nextSnapshot;
      updateHistoryControls();
      return false;
    }
    const continuesGroupedChange = Boolean(historyGroup && historyLastGroup === historyGroup && undoStack.length);
    const groupedBaselineMatches = Boolean(continuesGroupedChange && dossierFingerprint(undoStack[undoStack.length - 1]) === nextFingerprint);
    let groupReturnedToBaseline = false;
    if (groupedBaselineMatches) {
      undoStack.pop();
      groupReturnedToBaseline = true;
    } else if (!continuesGroupedChange) {
      undoStack.push(historyPresent);
      if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
    }
    historyPresent = nextSnapshot;
    historyPresentFingerprint = nextFingerprint;
    historyLastGroup = groupReturnedToBaseline ? null : historyGroup;
    redoStack.length = 0;
    prunePhotoFileRegistry();
    updateHistoryControls();
    return true;
  }

  function closeHistoryOverlays() {
    closeHelp({ restoreFocus: false });
    if (!paneActionModal.hidden) closePaneActions({ restoreFocus: false });
    if (!windowRenameModal.hidden) closeWindowRenameModal({ restoreFocus: false });
    if (!windowIncompleteModal.hidden) closeWindowIncompleteModal({ restoreFocus: false });
    interaction.controller = null;
    interaction.paneId = null;
    interaction.mode = null;
    interaction.lastFocusedElement = null;
    prototypeRoot.inert = false;
  }

  function captureHistoryFocusContext() {
    const element = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = element?.closest('[data-window-plan]');
    const controller = root ? controllerById.get(root.dataset.windowId) : null;
    return {
      element,
      windowId: controller?.id || null,
      paneId: element?.closest('.pane[data-pane-id]')?.dataset.paneId || controller?.state.selectedPaneId || null,
    };
  }

  function restoreHistoryFocus(context, primaryButtons, secondaryButtons) {
    requestAnimationFrame(() => {
      if (context.windowId) {
        const controller = controllerById.get(context.windowId);
        const paneId = controller?.getPane(context.paneId) ? context.paneId : controller?.state.selectedPaneId;
        const pane = paneId ? controller?.root.querySelector('.pane[data-pane-id="' + paneId + '"]') : null;
        if (pane instanceof HTMLElement) {
          pane.focus({ preventScroll: true });
          return;
        }
      }
      const elementStillUsable = context.element?.isConnected
        && !context.element.closest('[hidden]')
        && !(context.element instanceof HTMLButtonElement && context.element.disabled);
      if (elementStillUsable) return;
      const fallback = primaryButtons.find((button) => !button.disabled)
        || secondaryButtons.find((button) => !button.disabled)
        || document.querySelector('[data-finalize]');
      fallback?.focus({ preventScroll: true });
    });
  }

  function restoreDossierSnapshot(snapshot) {
    closeHistoryOverlays();
    controllers.forEach((controller) => controller.destroy?.());
    controllers.length = 0;
    controllerById.clear();
    windowList.replaceChildren();
    activeWindowId = null;
    windowSequence = 0;
    measurementUnit = UNIT_CONFIG[snapshot.measurementUnit] ? snapshot.measurementUnit : 'in';
    snapshot.windows.forEach((windowSnapshot) => {
      const root = cloneWindowTemplate();
      if (!root) return;
      windowList.appendChild(root);
      registerWindow(root, { snapshot: windowSnapshot, focus: false });
    });
    windowSequence = Math.max(windowSequence, Number(snapshot.windowSequence) || 0);
    const activeController = controllerById.get(snapshot.activeWindowId) || controllers[0];
    if (activeController) activateController(activeController);
    document.querySelectorAll('select[data-measure-unit]').forEach((select) => { select.value = measurementUnit; });
    updateDossierProgress();
  }

  function undoHistory() {
    if (pendingPhotoAnalyses > 0) {
      showToast(historyCopy.wait, 'info');
      return false;
    }
    if (!undoStack.length) return false;
    const focusContext = captureHistoryFocusContext();
    const previousSnapshot = undoStack.pop();
    redoStack.push(historyPresent || captureDossierSnapshot());
    historyRestoring = true;
    try {
      restoreDossierSnapshot(previousSnapshot);
    } finally {
      historyRestoring = false;
    }
    historyPresent = captureDossierSnapshot();
    historyPresentFingerprint = dossierFingerprint(historyPresent);
    historyLastGroup = null;
    prunePhotoFileRegistry();
    updateHistoryControls();
    restoreHistoryFocus(focusContext, undoButtons, redoButtons);
    showToast(historyCopy.undone);
    return true;
  }

  function redoHistory() {
    if (pendingPhotoAnalyses > 0) {
      showToast(historyCopy.wait, 'info');
      return false;
    }
    if (!redoStack.length) return false;
    const focusContext = captureHistoryFocusContext();
    const nextSnapshot = redoStack.pop();
    undoStack.push(historyPresent || captureDossierSnapshot());
    if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
    historyRestoring = true;
    try {
      restoreDossierSnapshot(nextSnapshot);
    } finally {
      historyRestoring = false;
    }
    historyPresent = captureDossierSnapshot();
    historyPresentFingerprint = dossierFingerprint(historyPresent);
    historyLastGroup = null;
    prunePhotoFileRegistry();
    updateHistoryControls();
    restoreHistoryFocus(focusContext, redoButtons, undoButtons);
    showToast(historyCopy.redone);
    return true;
  }

  function showToast(message, tone = 'success') {
    if (!toast) return;
    toast.textContent = message;
    toast.dataset.tone = tone;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }

  function setPhotoAnalysisBusy(active) {
    pendingPhotoAnalyses = Math.max(0, pendingPhotoAnalyses + (active ? 1 : -1));
    const busy = pendingPhotoAnalyses > 0;
    prototypeRoot.inert = busy;
    if (busy) prototypeRoot.setAttribute('aria-busy', 'true');
    else prototypeRoot.removeAttribute('aria-busy');
    updateHistoryControls();
  }

  function setHelpTriggerLabels(root = document) {
    root.querySelectorAll('[data-help-key]').forEach((trigger) => {
      const entry = helpCopy[trigger.dataset.helpKey];
      if (!entry) return;
      trigger.setAttribute('aria-label', helpCopy.trigger + ': ' + entry.title);
    });
  }

  function renderHelpBody(entry) {
    helpBody.replaceChildren();
    const paragraph = document.createElement('p');
    paragraph.textContent = entry.body;
    helpBody.appendChild(paragraph);
    if (!entry.items?.length) return;
    const list = document.createElement('ul');
    entry.items.forEach(([term, description]) => {
      const item = document.createElement('li');
      const label = document.createElement('strong');
      label.textContent = term + ': ';
      item.append(label, document.createTextNode(description));
      list.appendChild(item);
    });
    helpBody.appendChild(list);
  }

  function positionHelpPanel(trigger = activeHelpTrigger) {
    if (!trigger || helpPanel.hidden) return;
    if (window.innerWidth <= 759) {
      helpPanel.style.removeProperty('left');
      helpPanel.style.removeProperty('top');
      return;
    }
    const triggerRect = trigger.getBoundingClientRect();
    const panelRect = helpPanel.getBoundingClientRect();
    const gutter = 12;
    const proposedLeft = triggerRect.left + (triggerRect.width - panelRect.width) / 2;
    const left = Math.min(window.innerWidth - panelRect.width - gutter, Math.max(gutter, proposedLeft));
    let top = triggerRect.bottom + 10;
    if (top + panelRect.height > window.innerHeight - gutter) top = triggerRect.top - panelRect.height - 10;
    top = Math.min(window.innerHeight - panelRect.height - gutter, Math.max(gutter, top));
    helpPanel.style.left = Math.round(left) + 'px';
    helpPanel.style.top = Math.round(top) + 'px';
  }

  function closeHelp({ restoreFocus = false } = {}) {
    if (helpPanel.hidden) return;
    const trigger = activeHelpTrigger;
    trigger?.setAttribute('aria-expanded', 'false');
    helpPanel.hidden = true;
    activeHelpTrigger = null;
    if (restoreFocus && trigger?.isConnected) requestAnimationFrame(() => trigger.focus({ preventScroll: true }));
  }

  function openHelp(trigger) {
    const entry = helpCopy[trigger?.dataset.helpKey];
    if (!entry) return;
    if (activeHelpTrigger === trigger && !helpPanel.hidden) {
      closeHelp({ restoreFocus: true });
      return;
    }
    activeHelpTrigger?.setAttribute('aria-expanded', 'false');
    activeHelpTrigger = trigger;
    trigger.setAttribute('aria-expanded', 'true');
    helpPanel.lang = clientLanguage;
    if (helpKicker) helpKicker.textContent = helpCopy.kicker;
    helpTitle.textContent = entry.title;
    helpClose.setAttribute('aria-label', helpCopy.close);
    renderHelpBody(entry);
    helpPanel.hidden = false;
    requestAnimationFrame(() => {
      positionHelpPanel(trigger);
      helpClose.focus({ preventScroll: true });
    });
  }

  function setMeasurementUnit(nextUnit, { announce = true } = {}) {
    if (!UNIT_CONFIG[nextUnit]) return false;
    const changed = measurementUnit !== nextUnit;
    measurementUnit = nextUnit;
    controllers.forEach((controller) => controller.render());
    document.querySelectorAll('select[data-measure-unit]').forEach((select) => { select.value = measurementUnit; });
    if (changed && announce) {
      markDirty();
      showToast(unitCopy.changed + ' : ' + unitSuffix() + '.');
    }
    return changed;
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
      node.setAttribute('aria-label', appCopy.progressAria(completed, items.length, clientLanguage === 'en' ? 'the file' : 'le dossier'));
    });
    document.querySelectorAll('[data-dossier-progress-steps]').forEach((progress) => {
      progress.innerHTML = '';
      items.forEach((item, itemIndex) => {
        const current = item.controller.id === activeWindowId && item.controller.state.selectedPaneId === item.pane.id;
        const step = document.createElement('button');
        step.type = 'button';
        step.className = 'progress-step' + (item.complete ? ' is-complete' : '') + (current ? ' is-current' : '') + (itemIndex === items.length - 1 ? ' is-last' : '');
        step.setAttribute('aria-label', item.controller.state.code + ' T' + item.index + ', ' + appCopy.progressStep(item.complete));
        if (current) step.setAttribute('aria-current', 'step');
        const marker = document.createElement('span');
        marker.className = 'progress-node icon-circle-center';
        marker.innerHTML = item.complete
          ? checkIconMarkup()
          : '<span class="icon-circle-glyph">' + item.index + '</span>';
        const label = document.createElement('span');
        label.className = 'progress-label';
        label.textContent = item.controller.state.code + ' T' + item.index;
        step.append(marker, label);
        step.addEventListener('click', () => item.controller.selectPaneOnly(item.pane.id));
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
      if (!windowRenameModal.hidden) closeWindowRenameModal({ restoreFocus: false });
      if (!windowIncompleteModal.hidden) closeWindowIncompleteModal({ restoreFocus: false });
    }
    activeWindowId = controller.id;
    controllers.forEach((item) => {
      item.root.classList.toggle('is-active', item.id === activeWindowId);
      item.root.setAttribute('aria-current', item.id === activeWindowId ? 'true' : 'false');
    });
    syncHistoryContext();
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

  function selectPaneOnly(controller, paneId, { focus = true } = {}) {
    if (!controller?.getPane(paneId)) return false;
    activateController(controller);
    interaction.controller = controller;
    interaction.paneId = paneId;
    interaction.axis = null;
    interaction.count = 2;
    interaction.mode = null;
    const selected = controller.selectPane(paneId);
    if (selected && focus) requestAnimationFrame(() => controller.focusPane(paneId));
    return selected;
  }

  function updatePaneActionModal() {
    const controller = interaction.controller;
    const pane = controller?.getPane(interaction.paneId);
    if (!controller || !pane) return;
    const entries = controller.getEntries();
    const label = controller.getPaneLabel(pane.id);
    const resultingTotal = entries.length + interaction.count - 1;
    const exceedsMaximum = resultingTotal > MAX_PANES;
    const direction = interaction.axis === 'vertical' ? appCopy.divide.sideBySideResult : appCopy.divide.stackedResult;
    paneActionModal.querySelectorAll('[data-pane-action-label]').forEach((output) => { output.textContent = controller.state.code + ' · ' + label; });
    paneActionModal.querySelectorAll('[data-modal-axis]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.modalAxis === interaction.axis));
    });
    paneActionModal.querySelectorAll('[data-section-count]').forEach((button) => {
      const count = Number(button.dataset.sectionCount);
      button.disabled = entries.length + count - 1 > MAX_PANES;
      button.setAttribute('aria-pressed', String(count === interaction.count));
      button.setAttribute('aria-label', button.disabled ? appCopy.divide.maximumAria(count, MAX_PANES) : count + ' ' + appCopy.divide.sections);
    });
    const result = paneActionModal.querySelector('[data-pane-action-result]');
    if (result) {
      if (exceedsMaximum) result.textContent = appCopy.divide.maximumResult(resultingTotal, MAX_PANES);
      else if (!interaction.axis) result.textContent = appCopy.divide.chooseAxis + '.';
      else result.textContent = appCopy.divide.directionResult(label, interaction.count, direction);
    }
    const warning = paneActionModal.querySelector('[data-pane-action-warning]');
    if (warning) {
      warning.hidden = !paneHasData(pane);
      warning.textContent = paneHasData(pane) ? appCopy.divide.dataWarning(label) : '';
    }
    const createButton = paneActionModal.querySelector('[data-create-sections]');
    if (createButton) {
      createButton.disabled = !interaction.axis || exceedsMaximum;
      createButton.textContent = !interaction.axis
        ? appCopy.divide.chooseAxis
        : paneHasData(pane)
          ? appCopy.divide.createAndErase(interaction.count)
          : appCopy.divide.create(interaction.count);
    }
  }

  function closePaneActions({ restoreFocus = true } = {}) {
    paneActionModal.hidden = true;
    prototypeRoot.inert = false;
    document.body.classList.remove('pane-action-open');
    if (interaction.mode === 'action') interaction.mode = null;
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
    closeHelp();
    if (!paneActionModal.hidden) closePaneActions({ restoreFocus: false });
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

  function incompleteWindowDetails(controller) {
    if (!controller) return null;
    const entries = controller.getEntries();
    const incompleteEntries = entries.filter(({ node }) => !paneIsComplete(node));
    return incompleteEntries.length ? { controller, entries, incompleteEntries } : null;
  }

  function closeWindowIncompleteModal({ restoreFocus = true } = {}) {
    const focusTarget = interaction.lastFocusedElement;
    const controller = interaction.controller;
    windowIncompleteModal.hidden = true;
    document.body.classList.remove('window-incomplete-open');
    if (interaction.mode === 'incomplete') {
      interaction.mode = null;
      prototypeRoot.inert = false;
    }
    if (!restoreFocus) return;
    requestAnimationFrame(() => {
      if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true });
      else controller?.root.focus({ preventScroll: true });
    });
  }

  function openWindowIncompleteModal(details) {
    if (!details?.controller || !details.incompleteEntries.length) return;
    closeHelp();
    if (!paneActionModal.hidden) closePaneActions({ restoreFocus: false });
    if (!windowRenameModal.hidden) closeWindowRenameModal({ restoreFocus: false });
    const { controller, entries, incompleteEntries } = details;
    activateController(controller);
    interaction.controller = controller;
    interaction.paneId = incompleteEntries[0].node.id;
    interaction.mode = 'incomplete';
    interaction.lastFocusedElement = document.activeElement;
    windowIncompleteTitle.textContent = incompleteWindowCopy.title(controller.state.code, controller.state.name);
    windowIncompleteMessage.textContent = incompleteWindowCopy.message(incompleteEntries.length, entries.length);
    windowIncompleteModal.hidden = false;
    prototypeRoot.inert = true;
    document.body.classList.add('window-incomplete-open');
    requestAnimationFrame(() => windowIncompleteReturn.focus());
  }

  function returnToIncompleteMeasurements() {
    const controller = interaction.controller;
    const paneId = interaction.paneId;
    const pane = controller?.getPane(paneId);
    const firstMissingDimension = pane
      ? DIMENSION_KEYS.find((key) => !Number.isFinite(pane.measurement[key + 'Inches']) || pane.measurement[key + 'Inches'] <= 0)
      : null;
    closeWindowIncompleteModal({ restoreFocus: false });
    if (!controller || !paneId) return;
    selectPaneOnly(controller, paneId, { focus: false });
    const targetInput = firstMissingDimension
      ? controller.root.querySelector('[data-measure-dimension="' + firstMissingDimension + '"][data-measure-part="value"]')
      : null;
    const scrollTarget = targetInput || controller.root.querySelector('.thermos-editor');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTarget?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    requestAnimationFrame(() => {
      if (targetInput) targetInput.focus({ preventScroll: true });
      else controller.focusPane(paneId);
    });
  }

  function continueAddingWindow() {
    closeWindowIncompleteModal({ restoreFocus: false });
    addWindow();
  }

  function requestAddWindow() {
    const activeController = controllerById.get(activeWindowId) || controllers[controllers.length - 1];
    const incompleteDetails = incompleteWindowDetails(activeController);
    if (incompleteDetails) {
      openWindowIncompleteModal(incompleteDetails);
      return null;
    }
    return addWindow();
  }

  function openPaneActions(controller, paneId) {
    const pane = controller.getPane(paneId);
    if (!pane) return;
    closeHelp();
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
    requestAnimationFrame(() => paneActionModal.querySelector('[data-modal-axis]')?.focus());
  }

  const interactionService = {
    activate: activateController,
    openPaneActions,
    closeFor(controller) {
      if (interaction.controller !== controller) return;
      closePaneActions({ restoreFocus: false });
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
    const photoInput = root.querySelector('[data-photo-input]');
    const photoTrigger = root.querySelector('[data-photo-trigger]');
    const photoLabel = root.querySelector('[data-photo-label]');
    const photoHelp = root.querySelector('[data-photo-help]');
    const photoStatus = root.querySelector('[data-photo-status]');
    const measureFields = [...root.querySelectorAll('[data-measure-key]')];
    const dimensionControls = new Map(DIMENSION_KEYS.map((key) => [key, {
      input: root.querySelector('[data-measure-dimension="' + key + '"][data-measure-part="value"]'),
      fraction: root.querySelector('[data-measure-dimension="' + key + '"][data-measure-part="fraction"]'),
      unit: root.querySelector('[data-measure-unit-output="' + key + '"]'),
      historyGroup: null,
    }]));
    const fieldHistoryGroups = new WeakMap();
    const unitSelect = root.querySelector('[data-measure-unit]');
    const unitTitle = root.querySelector('[data-measure-unit-title]');
    const decorativeEnabled = root.querySelector('[data-decorative-enabled]');
    const decorativeOptions = root.querySelector('[data-decorative-options]');
    const decorativeStatus = root.querySelector('[data-decorative-status]');
    const editSelectedThermos = root.querySelector('[data-edit-selected-thermos]');
    if (!canvas) return null;
    const restoredSnapshot = seed.snapshot ? clone(seed.snapshot) : null;
    let paneSequence = Number(restoredSnapshot?.paneSequence) || 0;
    let splitSequence = Number(restoredSnapshot?.splitSequence) || 0;
    let renderVersion = 0;
    let photoDetectionToken = 0;
    let forceDimensionSync = false;
    let api;

    root.dataset.windowId = seed.id;
    root.tabIndex = root.tabIndex >= 0 ? root.tabIndex : -1;
    localizeWindowUi(root);
    localizeThermosSelects(root);

    function createPane(measurement = blankMeasurement()) {
      paneSequence += 1;
      return {
        type: 'pane',
        id: seed.id + '-p' + paneSequence,
        measurement: { ...blankMeasurement(), ...measurement },
        decorative: blankDecorative(),
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

    function syncSequencesFromLayout(node) {
      if (!node) return;
      const paneMatch = node.type === 'pane' ? node.id?.match(/-p(\d+)$/) : null;
      const splitMatch = node.type === 'split' ? node.id?.match(/-s(\d+)$/) : null;
      if (paneMatch) paneSequence = Math.max(paneSequence, Number(paneMatch[1]) || 0);
      if (splitMatch) splitSequence = Math.max(splitSequence, Number(splitMatch[1]) || 0);
      node.children?.forEach(syncSequencesFromLayout);
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

    const initialLayout = restoredSnapshot ? clone(restoredSnapshot.layout) : buildPresetLayout(seed.preset);
    syncSequencesFromLayout(initialLayout);
    const initialEntries = getLeafEntries(initialLayout);
    const initialSelected = restoredSnapshot?.selectedPaneId
      || initialEntries[Math.min(seed.selectedIndex || 0, initialEntries.length - 1)]?.node.id
      || null;
    const initialSnapshot = restoredSnapshot?.initialSnapshot
      ? clone(restoredSnapshot.initialSnapshot)
      : {
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
      activePreset: restoredSnapshot?.activePreset || seed.preset,
      topologyPreset: restoredSnapshot && Object.hasOwn(restoredSnapshot, 'topologyPreset') ? restoredSnapshot.topologyPreset : seed.preset,
      photo: Boolean(restoredSnapshot?.photo),
      photoRef: restoredSnapshot?.photoRef || null,
      photoStatus: restoredSnapshot?.photoStatus || (restoredSnapshot?.photo ? 'success' : 'idle'),
      photoMessage: restoredSnapshot?.photoMessage || (restoredSnapshot?.photo ? appCopy.photo.linked : ''),
    };

    function setPhotoUi(status, message = '') {
      state.photoStatus = status;
      state.photoMessage = message;
      const analyzing = status === 'analyzing';
      photoTrigger?.setAttribute('aria-busy', String(analyzing));
      photoTrigger?.classList.toggle('is-complete', status === 'success');
      const actionLabel = analyzing ? appCopy.photo.analyzing : state.photo ? appCopy.photo.retake : appCopy.photo.take;
      if (photoLabel) photoLabel.textContent = actionLabel;
      if (photoInput) {
        photoInput.disabled = analyzing;
        photoInput.setAttribute('aria-label', appCopy.photo.input(actionLabel));
      }
      if (photoHelp) {
        photoHelp.textContent = analyzing
          ? appCopy.photo.analyzingHelp
          : state.photo
            ? appCopy.photo.replaceHelp
            : appCopy.photo.detectedHelp;
      }
      if (!photoStatus) return;
      photoStatus.textContent = message;
      photoStatus.hidden = !message;
      if (message) photoStatus.dataset.state = status;
      else delete photoStatus.dataset.state;
    }

    async function detectPhotoPreset(file) {
      // Prototype hook: the production detector will return the matching preset key here.
      await file.slice(0, 1).arrayBuffer();
      return '3x2';
    }

    async function processPhoto(file) {
      if (!file || (file.type && !file.type.startsWith('image/'))) {
        setPhotoUi('error', appCopy.photo.invalid);
        return false;
      }
      const token = ++photoDetectionToken;
      const historyGroup = 'photo:' + seed.id + ':' + token;
      const photoRef = 'photo-' + (++photoFileSequence);
      photoFileRegistry.set(photoRef, file);
      state.photo = true;
      state.photoRef = photoRef;
      setPhotoUi('analyzing', appCopy.photo.analyzingMessage);
      setPhotoAnalysisBusy(true);
      markDirty(historyGroup);
      try {
        const presetKey = await detectPhotoPreset(file);
        if (token !== photoDetectionToken) return false;
        const preset = PRESETS[presetKey];
        if (!preset) throw new Error(appCopy.photo.unknownLayout);
        const applied = applyPreset(presetKey, { detected: true, historyGroup });
        if (token !== photoDetectionToken) return false;
        if (applied) root.querySelector('.layout-presets-menu')?.removeAttribute('open');
        setPhotoUi(
          applied ? 'success' : 'info',
          applied
            ? appCopy.photo.applied(preset.label)
            : appCopy.photo.retained
        );
        markDirty(historyGroup);
        return applied;
      } catch {
        if (token !== photoDetectionToken) return false;
        setPhotoUi('error', appCopy.photo.failed);
        markDirty(historyGroup);
        return false;
      } finally {
        setPhotoAnalysisBusy(false);
      }
    }

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
      if (!pane.decorative.enabled) return;
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
        const paneCode = 'T' + index;
        const isSelected = node.id === state.selectedPaneId;
        const needsMeasurements = !paneIsComplete(node);
        const pane = document.createElement('button');
        pane.type = 'button';
        pane.className = 'pane';
        pane.dataset.paneId = node.id;
        pane.lang = clientLanguage;
        pane.setAttribute('aria-pressed', String(isSelected));
        const paneAriaLabel = isSelected ? paneCopy.selectedLabel(state.code, paneCode) : paneCopy.availableLabel(state.code, paneCode);
        pane.setAttribute('aria-label', paneAriaLabel + (needsMeasurements ? ' ' + paneCopy.measurementsRequiredLabel : ''));
        const summary = paneSummary(node);
        const paneCodeMarkup = isSelected
          ? '<span class="pane-code pane-code-editing" lang="' + clientLanguage + '"><small>' + paneCopy.editing + '</small><strong>' + paneCode + '</strong></span>'
          : '<span class="pane-code">' + paneCode + '</span>';
        const paneHintMarkup = isSelected ? '' : '<span class="pane-hint" lang="' + clientLanguage + '">' + paneCopy.choose + '</span>';
        pane.innerHTML = (summary ? '<span class="pane-value">' + summary + '</span>' : '') + paneCodeMarkup + paneHintMarkup;
        renderDecorativeLines(pane, node);
        pane.addEventListener('click', () => selectPaneOnly(api, node.id));
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
          handle.className = 'divider-handle icon-circle-center';
          handle.dataset.splitId = node.id;
          handle.dataset.dividerIndex = String(index);
          handle.tabIndex = 0;
          handle.innerHTML = directionIconMarkup(node.axis);
          handle.setAttribute('role', 'separator');
          handle.setAttribute('aria-orientation', node.axis);
          handle.setAttribute('aria-label', appCopy.divider.label(node.axis, index + 1, Boolean(node.linkId)));
          handle.title = appCopy.divider.title(node.axis);
          handle.addEventListener('pointerdown', (event) => startDividerDrag(event, node.id, index));
          handle.addEventListener('keydown', (event) => moveDividerWithKeyboard(event, node.id, index));
          split.appendChild(handle);
        });
      }
      return split;
    }

    function layoutSummary(entries) {
      const preset = PRESETS[state.activePreset];
      if (!preset) return appCopy.layout.custom(entries.length);
      if (preset.summary) return preset.summary + ' · ' + entries.length + ' ' + (clientLanguage === 'en' ? 'glass unit' + (entries.length === 1 ? '' : 's') : 'thermos');
      return appCopy.layout.grid(preset.columns, preset.rows, entries.length);
    }

    function syncInlineEditor() {
      const pane = getPane(state.selectedPaneId);
      const paneLabel = pane ? getPaneLabel(pane.id) : '—';
      const editorState = !pane
        ? { label: appCopy.editorState.none, value: 'empty' }
        : paneIsComplete(pane)
          ? { label: appCopy.editorState.complete, value: 'complete' }
          : paneHasData(pane)
            ? { label: appCopy.editorState.progress, value: 'progress' }
            : { label: appCopy.editorState.empty, value: 'empty' };
      root.querySelectorAll('[data-editor-window]').forEach((node) => { node.textContent = state.code; });
      root.querySelectorAll('[data-editor-pane]').forEach((node) => { node.textContent = paneLabel; });
      root.querySelectorAll('[data-editor-state]').forEach((node) => {
        node.textContent = editorState.label;
        node.dataset.state = editorState.value;
      });
      const displayUnitChanged = root.dataset.measureUnit !== measurementUnit;
      root.dataset.measureUnit = measurementUnit;
      if (unitTitle) unitTitle.textContent = unitCopy.title;
      if (unitSelect) {
        unitSelect.value = measurementUnit;
        unitSelect.setAttribute('aria-label', unitCopy.changed);
        const inchOption = unitSelect.querySelector('option[value="in"]');
        if (inchOption) inchOption.textContent = unitCopy.in;
      }
      const decimalSeparator = clientLanguage === 'fr' ? ',' : '.';
      const examplePrefix = clientLanguage === 'en' ? 'e.g. ' : 'Ex. ';
      const placeholders = {
        in: { width: examplePrefix + '32', height: examplePrefix + '48', thickness: examplePrefix + '1' },
        mm: { width: examplePrefix + '813', height: examplePrefix + '1219', thickness: examplePrefix + '25' + decimalSeparator + '4' },
        cm: { width: examplePrefix + '81' + decimalSeparator + '3', height: examplePrefix + '121' + decimalSeparator + '9', thickness: examplePrefix + '2' + decimalSeparator + '54' },
      };
      dimensionControls.forEach((control, key) => {
        const displayed = pane ? dimensionForDisplay(pane.measurement, key) : { text: '', whole: '', fraction: '', approximate: false };
        const imperial = measurementUnit === 'in';
        if (control.input) {
          control.input.disabled = !pane;
          control.input.inputMode = imperial ? 'numeric' : 'decimal';
          control.input.placeholder = placeholders[measurementUnit][key];
          if (forceDimensionSync || displayUnitChanged || document.activeElement !== control.input) {
            control.input.value = imperial ? displayed.whole : displayed.text;
            control.input.removeAttribute('aria-invalid');
            control.input.setCustomValidity('');
          }
        }
        if (control.fraction) {
          control.fraction.hidden = !imperial;
          control.fraction.disabled = !pane || !imperial;
          control.fraction.setAttribute('aria-hidden', String(!imperial));
          if (forceDimensionSync || displayUnitChanged || document.activeElement !== control.fraction) control.fraction.value = imperial ? displayed.fraction : '';
        }
        if (control.unit) {
          control.unit.textContent = (imperial && displayed.approximate ? '≈ ' : '') + unitSuffix();
          control.unit.dataset.approximate = String(imperial && displayed.approximate);
        }
      });
      measureFields.forEach((field) => {
        const value = pane?.measurement?.[field.dataset.measureKey];
        field.disabled = !pane;
        if (field.type === 'checkbox') field.checked = Boolean(value);
        else if (document.activeElement !== field) field.value = value ?? '';
      });
      const decorativeIsEnabled = Boolean(pane?.decorative?.enabled);
      if (decorativeEnabled) {
        decorativeEnabled.disabled = !pane;
        decorativeEnabled.setAttribute('aria-checked', String(decorativeIsEnabled));
        decorativeEnabled.setAttribute('aria-expanded', String(decorativeIsEnabled));
      }
      if (decorativeOptions) {
        decorativeOptions.hidden = !decorativeIsEnabled;
        decorativeOptions.setAttribute('aria-hidden', String(!decorativeIsEnabled));
      }
      if (decorativeStatus) {
        decorativeStatus.textContent = decorativeIsEnabled ? appCopy.yes : appCopy.no;
        decorativeStatus.dataset.state = decorativeIsEnabled ? 'enabled' : 'disabled';
      }
      root.querySelectorAll('[data-counter]').forEach((counter) => {
        const output = counter.querySelector('output');
        if (output) output.textContent = String(pane?.decorative?.[counter.dataset.counter] || 0);
      });
      if (editSelectedThermos) {
        editSelectedThermos.disabled = !pane;
        editSelectedThermos.setAttribute('aria-label', pane ? appCopy.editAria(state.code, paneLabel) : appCopy.noSelection);
      }
    }

    function updateLayoutMeta(entries, indexes) {
      const completed = entries.filter(({ node }) => paneIsComplete(node)).length;
      root.querySelectorAll('[data-window-code]').forEach((node) => { node.textContent = state.code; });
      root.querySelectorAll('[data-window-name]').forEach((node) => { node.textContent = state.name; });
      root.querySelectorAll('[data-rename-window]').forEach((button) => { button.setAttribute('aria-label', appCopy.renameAria(state.code, state.name)); });
      root.querySelectorAll('[data-pane-count-output]').forEach((node) => { node.textContent = String(entries.length); });
      root.querySelectorAll('[data-complete-pane-output]').forEach((node) => { node.textContent = String(completed); });
      root.querySelectorAll('[data-progress-label]').forEach((node) => {
        node.setAttribute('aria-label', appCopy.progressAria(completed, entries.length, state.code));
      });
      root.querySelectorAll('[data-divider-count-output]').forEach((node) => { node.textContent = String(countSeparators(state.layout)); });
      root.querySelectorAll('[data-layout-summary]').forEach((node) => { node.textContent = layoutSummary(entries); });
      root.querySelectorAll('[data-preset-summary]').forEach((node) => { node.textContent = PRESETS[state.activePreset]?.label || (clientLanguage === 'en' ? 'Custom layout' : 'Disposition personnalisée'); });
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
      updateLayoutMeta(entries, indexes);
      syncInlineEditor();
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

    function moveSplitDividerTo(splitId, dividerIndex, requestedBoundary, historyGroup = null) {
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
      markDirty(historyGroup);
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
          const perpendicularTracks = node.axis === 'vertical' ? dividerTracks.horizontal : dividerTracks.vertical;
          const crossingTracks = perpendicularTracks.filter((track) => (
            mainPosition >= track.start - 8 && mainPosition <= track.end + 8
          ));
          const crossCuts = crossingTracks
            .map((track) => track.position)
            .filter((position) => position > mergedTrack.start + 8 && position < mergedTrack.end - 8)
            .sort((a, b) => a - b);
          // Anchor one-third inside the outermost pane, not one-third of the whole frame.
          const exteriorSectionStart = towardStartEdge
            ? mergedTrack.start
            : (crossCuts[crossCuts.length - 1] ?? mergedTrack.start);
          const exteriorSectionEnd = towardStartEdge
            ? (crossCuts[0] ?? mergedTrack.end)
            : mergedTrack.end;
          const exteriorSectionLength = exteriorSectionEnd - exteriorSectionStart;
          const frameCrossTarget = towardStartEdge
            ? exteriorSectionStart + exteriorSectionLength / 3
            : exteriorSectionEnd - exteriorSectionLength / 3;
          const crossTarget = frameCrossTarget - ownerCrossStart;
          handle.dataset.crossAnchor = towardStartEdge ? 'start' : 'end';
          const blockedCrossPositions = crossingTracks.map((track) => track.position - ownerCrossStart);
          placedHandleCenters.forEach((placed) => {
            if (placed.axis !== node.axis) return;
            const mainDistance = Math.abs(placed.main - mainPosition);
            if (mainDistance >= 48) return;
            blockedCrossPositions.push({
              position: placed.cross - ownerCrossStart,
              clearance: Math.sqrt((48 ** 2) - (mainDistance ** 2)),
            });
          });
          const edgeMargin = Math.min(22, exteriorSectionLength / 4);
          const crossMinimum = (exteriorSectionStart - ownerCrossStart) + edgeMargin;
          const crossMaximum = (exteriorSectionEnd - ownerCrossStart) - edgeMargin;
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
      const historyGroup = 'divider:' + seed.id + ':' + splitId + ':' + dividerIndex + ':' + (++historyTransactionSequence);
      const move = (moveEvent) => {
        const coordinate = node.axis === 'vertical' ? moveEvent.clientX : moveEvent.clientY;
        moveSplitDividerTo(splitId, dividerIndex, startBoundary + ((coordinate - startCoordinate) / availablePixels) * total, historyGroup);
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
      syncHistoryContext();
      return true;
    }

    function applyPreset(key, { detected = false, preview = false, historyGroup = null } = {}) {
      const preset = PRESETS[key];
      if (!preset) return false;
      if (!preview && state.activePreset === key) {
        if (detected) {
          showToast(appCopy.presetAlreadyDetected(preset.label));
          return true;
        }
        showToast(appCopy.presetAlreadyActive(preset.label));
        return false;
      }
      if (!preview && layoutHasData() && !window.confirm(appCopy.changeLayoutConfirm(state.code))) return false;
      state.layout = buildPresetLayout(key);
      state.selectedPaneId = getEntries()[0]?.node.id || null;
      state.activePreset = key;
      state.topologyPreset = key;
      interactionService.closeFor(api);
      renderLayout();
      if (!preview) markDirty(historyGroup);
      if (!preview) {
        const paneCount = getEntries().length;
        showToast(appCopy.presetCreated(preset.label, paneCount, detected));
      }
      return true;
    }

    function splitPane(paneId, axis, sectionCount, { allowDataLoss = false } = {}) {
      const entries = getEntries();
      const count = Number(sectionCount);
      const resultingTotal = entries.length + count - 1;
      if (!['vertical', 'horizontal'].includes(axis) || !Number.isInteger(count) || count < 2 || count > 4) return false;
      if (resultingTotal > MAX_PANES) {
        showToast(appCopy.maximumReached(MAX_PANES, state.code), 'warning');
        return false;
      }
      const pane = getPane(paneId);
      if (!pane) return false;
      const oldLabel = getPaneLabel(pane.id);
      if (paneHasData(pane) && !allowDataLoss && !window.confirm(appCopy.splitConfirm(state.code, oldLabel))) return false;
      const firstPane = { type: 'pane', id: pane.id, measurement: blankMeasurement(), decorative: blankDecorative() };
      const children = [firstPane, ...Array.from({ length: count - 1 }, () => createPane())];
      state.layout = replaceNode(state.layout, pane.id, createSplit(axis, children));
      state.selectedPaneId = firstPane.id;
      state.activePreset = 'custom';
      state.topologyPreset = null;
      interactionService.closeFor(api);
      renderLayout();
      markDirty();
      requestAnimationFrame(() => focusPane(firstPane.id));
      showToast(appCopy.splitCreated(count, state.code, oldLabel));
      return true;
    }

    function equalizeLayout() {
      equalizeNode(state.layout);
      const preset = PRESETS[state.topologyPreset];
      state.activePreset = preset && !preset.layout && !preset.sizes ? state.topologyPreset : 'custom';
      renderLayout();
      markDirty();
      showToast(appCopy.equalized(state.code));
    }

    function resetDrawing() {
      if (!window.confirm(appCopy.resetConfirm(state.code))) return;
      state.layout = clone(initialSnapshot.layout);
      state.selectedPaneId = initialSnapshot.selectedPaneId;
      state.activePreset = initialSnapshot.activePreset;
      state.topologyPreset = initialSnapshot.topologyPreset;
      photoDetectionToken += 1;
      state.photo = false;
      state.photoRef = null;
      if (photoInput) photoInput.value = '';
      setPhotoUi('idle');
      interactionService.closeFor(api);
      renderLayout();
      markDirty();
      showToast(appCopy.resetDone(state.code));
    }

    function setName(value) {
      const name = String(value ?? '').trim();
      if (!name || name === state.name) return false;
      state.name = name;
      renderLayout();
      markDirty();
      showToast(appCopy.renamed(state.code, state.name));
      return true;
    }

    function updateMeasurement(paneId, key, value, historyGroup = null) {
      const pane = getPane(paneId);
      if (!pane || !(key in pane.measurement)) return false;
      pane.measurement[key] = value;
      renderLayout();
      markDirty(historyGroup);
      return true;
    }

    function updateDisplayedDimension(paneId, key, { forceSync = false, historyGroup = null } = {}) {
      const pane = getPane(paneId);
      const control = dimensionControls.get(key);
      if (!pane || !control?.input) return false;
      const rawValue = control.input.value.trim();
      let inches = null;
      const invalidate = (message) => {
        pane.measurement[key + 'Inches'] = null;
        control.input.setAttribute('aria-invalid', 'true');
        control.input.setCustomValidity(message);
        renderLayout();
        markDirty(historyGroup);
        return false;
      };
      if (measurementUnit === 'in') {
        const fraction = control.fraction?.value || '';
        if (rawValue || fraction) {
          const whole = rawValue ? parseLocalizedNumber(rawValue) : 0;
          if (!Number.isFinite(whole)) return invalidate(unitCopy.invalid);
          inches = fraction ? Math.trunc(whole) + fractionToDecimal(fraction) : whole;
        }
      } else if (rawValue) {
        const displayedValue = parseLocalizedNumber(rawValue);
        if (!Number.isFinite(displayedValue)) return invalidate(unitCopy.invalid);
        inches = displayedValue / UNIT_CONFIG[measurementUnit].factor;
      }
      if (Number.isFinite(inches) && inches > DIMENSION_MAX_INCHES[key]) {
        const maximum = DIMENSION_MAX_INCHES[key] * UNIT_CONFIG[measurementUnit].factor;
        return invalidate(unitCopy.maximum + ' : ' + formatLocalizedNumber(maximum, UNIT_CONFIG[measurementUnit].decimals) + ' ' + unitSuffix() + '.');
      }
      control.input.removeAttribute('aria-invalid');
      control.input.setCustomValidity('');
      pane.measurement[key + 'Inches'] = inches;
      forceDimensionSync = forceSync;
      renderLayout();
      forceDimensionSync = false;
      markDirty(historyGroup);
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
        topologyPreset: state.topologyPreset,
        leaves: getEntries().map(({ node }) => node.id),
        photo: state.photo,
        photoRef: state.photoRef,
        photoStatus: state.photoStatus,
        photoMessage: state.photoMessage,
        paneSequence,
        splitSequence,
        initialSnapshot,
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
      selectPaneOnly(paneId) { return selectPaneOnly(api, paneId); },
      openPaneActions(paneId) { openPaneActions(api, paneId); },
      splitPane,
      applyPreset,
      equalizeLayout,
      resetDrawing,
      setName,
      updateMeasurement,
      updateDisplayedDimension,
      focusPane,
      processPhoto,
      getPhotoFile: () => state.photoRef ? photoFileRegistry.get(state.photoRef) || null : null,
      snapshot,
    };

    setPhotoUi(state.photoStatus, state.photoMessage);
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
    dimensionControls.forEach((control, key) => {
      if (control.fraction && !control.fraction.options.length) {
        fractions.forEach((fraction) => control.fraction.add(new Option(fraction || 'Fraction', fraction)));
      }
      control.input?.addEventListener('focus', () => {
        if (!control.historyGroup) control.historyGroup = 'dimension:' + seed.id + ':' + key + ':' + (++historyTransactionSequence);
      });
      control.input?.addEventListener('input', () => {
        if (!control.historyGroup) control.historyGroup = 'dimension:' + seed.id + ':' + key + ':' + (++historyTransactionSequence);
        if (state.selectedPaneId) updateDisplayedDimension(state.selectedPaneId, key, { historyGroup: control.historyGroup });
      });
      control.input?.addEventListener('blur', () => {
        forceDimensionSync = true;
        renderLayout();
        forceDimensionSync = false;
        control.historyGroup = null;
      });
      control.fraction?.addEventListener('change', () => {
        if (state.selectedPaneId) updateDisplayedDimension(state.selectedPaneId, key, { forceSync: true });
      });
    });
    unitSelect?.addEventListener('change', () => setMeasurementUnit(unitSelect.value));
    measureFields.forEach((field) => {
      if (field.tagName === 'TEXTAREA') {
        field.addEventListener('focus', () => {
          if (!fieldHistoryGroups.has(field)) fieldHistoryGroups.set(field, 'field:' + seed.id + ':' + field.dataset.measureKey + ':' + (++historyTransactionSequence));
        });
        field.addEventListener('blur', () => fieldHistoryGroups.delete(field));
      }
      const update = () => {
        if (!state.selectedPaneId) return;
        updateMeasurement(
          state.selectedPaneId,
          field.dataset.measureKey,
          field.type === 'checkbox' ? field.checked : field.value,
          field.tagName === 'TEXTAREA' ? fieldHistoryGroups.get(field) : null
        );
      };
      field.addEventListener(field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input', update);
    });
    decorativeEnabled?.addEventListener('click', () => {
      const pane = getPane(state.selectedPaneId);
      if (!pane) return;
      pane.decorative.enabled = !pane.decorative.enabled;
      renderLayout();
      markDirty();
    });
    root.querySelectorAll('[data-counter]').forEach((counter) => {
      counter.querySelectorAll('[data-delta]').forEach((button) => button.addEventListener('click', () => {
        const pane = getPane(state.selectedPaneId);
        if (!pane || !pane.decorative.enabled) return;
        const key = counter.dataset.counter;
        pane.decorative[key] = Math.max(0, Math.min(8, pane.decorative[key] + Number(button.dataset.delta)));
        renderLayout();
        markDirty();
      }));
    });
    editSelectedThermos?.addEventListener('click', () => {
      if (state.selectedPaneId) openPaneActions(api, state.selectedPaneId);
    });
    photoInput?.addEventListener('click', () => {
      photoInput.value = '';
    });
    photoInput?.addEventListener('change', () => {
      const file = photoInput.files?.[0];
      if (file) void processPhoto(file);
    });
    const resizeObserver = 'ResizeObserver' in window
      ? new ResizeObserver(() => requestAnimationFrame(positionDividerHandles))
      : null;
    resizeObserver?.observe(canvas);
    api.destroy = () => {
      photoDetectionToken += 1;
      resizeObserver?.disconnect();
    };
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

  function registerWindow(root, { first = false, focus = false, snapshot = null } = {}) {
    if (!snapshot) windowSequence += 1;
    const restoredSequence = Number(String(snapshot?.id || '').match(/\d+$/)?.[0]) || 0;
    if (snapshot) windowSequence = Math.max(windowSequence, restoredSequence);
    const id = snapshot?.id || 'w' + windowSequence;
    const code = snapshot?.code || 'F' + String(windowSequence).padStart(2, '0');
    namespaceRootIds(root, id);
    setHelpTriggerLabels(root);
    const controller = createWindowController(root, {
      id,
      code,
      name: snapshot?.name || (first ? appCopy.defaultWindowName : String(windowSequence)),
      preset: snapshot?.initialSnapshot?.activePreset || (first ? '3x2' : '1x1'),
      selectedIndex: first ? 1 : 0,
      snapshot,
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
      showToast(appCopy.added(controller.state.code));
    }
    return controller;
  }

  windowRenameModal.querySelectorAll('[data-close-window-rename]').forEach((button) => button.addEventListener('click', () => closeWindowRenameModal()));
  windowRenameForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = windowRenameInput.value.trim();
    if (!name) {
      if (windowRenameError) {
        windowRenameError.textContent = appCopy.rename.required;
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

  windowIncompleteModal.querySelectorAll('[data-close-window-incomplete]').forEach((button) => {
    button.addEventListener('click', () => closeWindowIncompleteModal());
  });
  windowIncompleteReturn.addEventListener('click', returnToIncompleteMeasurements);
  windowIncompleteContinue.addEventListener('click', continueAddingWindow);
  windowIncompleteModal.addEventListener('click', (event) => {
    if (event.target === windowIncompleteModal) closeWindowIncompleteModal();
  });
  windowIncompleteModal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeWindowIncompleteModal();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...windowIncompleteModal.querySelectorAll('button:not(:disabled)')];
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

  helpClose.addEventListener('click', () => closeHelp({ restoreFocus: true }));
  document.addEventListener('click', (event) => {
    const trigger = event.target instanceof Element ? event.target.closest('[data-help-key]') : null;
    if (trigger) {
      event.preventDefault();
      openHelp(trigger);
      return;
    }
    if (!helpPanel.hidden && !helpPanel.contains(event.target)) closeHelp();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || helpPanel.hidden) return;
    event.preventDefault();
    closeHelp({ restoreFocus: true });
  });
  document.addEventListener('vosthermos:close-help', () => closeHelp());
  window.addEventListener('resize', () => positionHelpPanel(), { passive: true });
  window.addEventListener('scroll', () => positionHelpPanel(), { passive: true, capture: true });
  setHelpTriggerLabels(document);

  localizeStaticUi();
  const existingPlans = [...windowList.querySelectorAll(':scope > [data-window-plan]')];
  if (existingPlans.length) {
    existingPlans.forEach((root, index) => registerWindow(root, { first: index === 0 }));
  } else {
    addWindow({ focus: false });
  }
  addWindowButton?.addEventListener('click', requestAddWindow);

  undoButtons.forEach((button) => button.addEventListener('click', undoHistory));
  redoButtons.forEach((button) => button.addEventListener('click', redoHistory));
  document.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    if (prototypeRoot.inert) return;
    if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    const key = event.key.toLowerCase();
    const wantsUndo = key === 'z' && !event.shiftKey;
    const wantsRedo = (key === 'z' && event.shiftKey) || (key === 'y' && event.ctrlKey);
    if (!wantsUndo && !wantsRedo) return;
    event.preventDefault();
    if (wantsRedo) redoHistory();
    else undoHistory();
  });
  document.querySelectorAll('[data-finalize]').forEach((button) => button.addEventListener('click', () => {
    const windowCount = controllers.length;
    showToast(clientLanguage === 'en'
      ? 'Prototype only: measurements for ' + windowCount + ' window' + (windowCount === 1 ? '' : 's') + ' would be confirmed here.'
      : 'Prototype seulement : les mesures ' + (windowCount === 1 ? 'de la fenêtre' : 'des ' + windowCount + ' fenêtres') + ' seraient validées ici.');
  }));

  window.__vosthermosGridPrototype = {
    snapshot: captureDossierSnapshot,
    addWindow: () => addWindow(),
    undo: undoHistory,
    redo: redoHistory,
    canUndo: () => undoStack.length > 0,
    canRedo: () => redoStack.length > 0,
    getPhotoFile: (photoRef) => photoFileRegistry.get(photoRef) || null,
  };

  const previewParams = new URLSearchParams(window.location.search);
  const previewUnit = previewParams.get('previewUnit');
  if (UNIT_CONFIG[previewUnit]) setMeasurementUnit(previewUnit, { announce: false });
  const previewWindowCount = Math.min(4, Math.max(1, Number(previewParams.get('previewWindows')) || 1));
  while (controllers.length < previewWindowCount) addWindow({ focus: false });
  const previewWindowIndex = Math.max(0, Math.min(controllers.length - 1, (Number(previewParams.get('previewWindow')) || 1) - 1));
  const previewController = controllers[previewWindowIndex] || controllers[0];
  const previewPreset = previewParams.get('previewPreset');
  if (previewController && PRESETS[previewPreset]) previewController.applyPreset(previewPreset, { preview: true });
  if (previewParams.get('previewModels') === '1') previewController?.root.querySelector('.layout-presets-menu')?.setAttribute('open', '');
  const previewSelectedPaneId = previewController?.resolvePaneId(previewParams.get('previewSelected'));
  if (previewController && previewSelectedPaneId) selectPaneOnly(previewController, previewSelectedPaneId, { focus: false });
  if (previewController && previewParams.get('previewDecorative') === '1') {
    const decorativePane = previewController.getPane(previewSelectedPaneId || previewController.state.selectedPaneId);
    if (decorativePane) {
      decorativePane.decorative.enabled = true;
      decorativePane.decorative.vertical = Math.min(8, Math.max(0, Number(previewParams.get('decorativeV')) || 0));
      decorativePane.decorative.horizontal = Math.min(8, Math.max(0, Number(previewParams.get('decorativeH')) || 0));
      previewController.render();
    }
  }
  const previewHelpKey = previewParams.get('previewHelp');
  if (helpCopy[previewHelpKey]?.title) {
    const previewHelpScope = previewHelpKey === 'finalization' ? document : previewController?.root || document;
    const previewHelpTrigger = previewHelpScope.querySelector('[data-help-key="' + previewHelpKey + '"]');
    if (previewHelpTrigger) openHelp(previewHelpTrigger);
  }
  const previewPaneId = previewController?.resolvePaneId(previewParams.get('previewPane'));
  if (previewController && previewParams.get('previewIncomplete') === '1') {
    const previewIncompleteDetails = incompleteWindowDetails(previewController);
    if (previewIncompleteDetails) openWindowIncompleteModal(previewIncompleteDetails);
  } else if (previewController && previewParams.get('previewRename') === '1') {
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
  initializeHistory();
})();
