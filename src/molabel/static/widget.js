function render({
    model,
    el
}) {


    /* -----------------------

          LAYOUT & ELEMENTS

    -------------------------- */

    // HEADER & EXAMPLES
    // Header
    const header = document.createElement('div');
    header.className = 'molabel-header';
    const status = document.createElement('div');
    status.className = 'molabel-status';
    header.appendChild(status);

    // Example display
    const exampleContainer = document.createElement('div');
    exampleContainer.className = 'molabel-example';

    // Last choice (for speech commands)
    const lastChoiceDisplay = document.createElement('div');
    lastChoiceDisplay.className = 'molabel-last-choice';

    // NAVIGATION CONTROLS
    const controls = document.createElement('div');
    controls.className = 'molabel-controls';
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.className = 'molabel-btn molabel-btn-prev';
    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Yes';
    yesBtn.className = 'molabel-btn molabel-btn-yes';
    const noBtn = document.createElement('button');
    noBtn.textContent = 'No';
    noBtn.className = 'molabel-btn molabel-btn-no';
    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'Skip';
    skipBtn.className = 'molabel-btn molabel-btn-skip';
    controls.appendChild(prevBtn);
    controls.appendChild(yesBtn);
    controls.appendChild(noBtn);
    controls.appendChild(skipBtn);

    // INPUT SELECTION & NOTES
    // Note recording
    const micButton = document.createElement('button');
    micButton.className = 'molabel-mic-btn';
    micButton.innerHTML = '🎤';
    micButton.title = 'Record a note';
    micButton.type = 'button';

    // Speech-based commands
    const speechSelectionBtn = document.createElement('button');
    speechSelectionBtn.className = 'molabel-speech-select-btn';
    speechSelectionBtn.innerHTML = '🗣️';
    speechSelectionBtn.title = 'Activate Speech command mode';
    speechSelectionBtn.type = 'button';

    // Gamepad indicator
    const gamepadIndicator = document.createElement('span');
    gamepadIndicator.className = 'molabel-gamepad-indicator';
    gamepadIndicator.innerHTML = '🎮';
    gamepadIndicator.style.display = 'none';
    gamepadIndicator.title = 'Gamepad detected';

    const helpBtn = document.createElement('button');
    helpBtn.className = 'molabel-help-btn';
    helpBtn.innerHTML = '❓';
    helpBtn.title = 'Show shortcuts (Alt+i)';
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'molabel-button-container';
    buttonContainer.appendChild(gamepadIndicator);
    buttonContainer.appendChild(speechSelectionBtn);
    buttonContainer.appendChild(micButton);
    buttonContainer.appendChild(helpBtn);

    // Notes
    const notesLabel = document.createElement('label');
    notesLabel.textContent = 'Notes:';
    const notesField = document.createElement('textarea');
    notesField.className = 'molabel-notes';
    notesField.rows = 3;
    notesField.placeholder = 'Add any notes about this example...';

    // Add notes, label, input selection to container
    const notesContainer = document.createElement('div');
    notesContainer.className = 'molabel-notes-container';

    const notesLabelContainer = document.createElement('div');
    notesLabelContainer.className = 'molabel-notes-label-container';

    notesLabelContainer.appendChild(notesLabel);
    notesLabelContainer.appendChild(buttonContainer);

    notesContainer.appendChild(notesLabelContainer);
    notesContainer.appendChild(notesField);

    // progress bar
    const progressContainer = document.createElement('div');
    progressContainer.className = 'molabel-progress-container';
    const progressBar = document.createElement('div');
    progressBar.className = 'molabel-progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'molabel-progress-fill';
    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);

    // Help overlay
    const helpOverlay = document.createElement('div');
    helpOverlay.className = 'molabel-help-overlay';
    const helpContent = document.createElement('div');
    helpContent.className = 'molabel-help-content';
    helpOverlay.appendChild(helpContent);

    // Set up main container
    const container = document.createElement('div');
    container.className = 'molabel-container';
    container.tabIndex = 0;

    container.appendChild(header);
    container.appendChild(progressContainer);
    container.appendChild(exampleContainer);
    container.appendChild(lastChoiceDisplay);
    container.appendChild(controls);
    container.appendChild(notesContainer);
    container.appendChild(helpOverlay);

    el.appendChild(container);



    /* --------------------------

            STATE VARIABLES

      -------------------------- */
    // Gamepad
    let gamepadConnected = false;
    let gamepadIndex = -1;
    let lastButtonStates = {};

    // Speech recognition
    let speechRecognition = null;
    let speechAvailable = false;
    let isRecording = false;
    let speechGamepadPressed = false;
    let originalNotesText = '';

    // Speech selection
    let isSpeechSelectionMode = false;
    let speechSelectionToggledOn = false;
    let speechSelectionHotkeyDown = false;
    let isHelpVisible = false;

    /* --------------------------

              CONSTANTS

      -------------------------- */

    // Gamepad

    const GAMEPAD_NAMES = {
      // TODO:
      // - [ ] Verify if button mapping is correct
      // - [ ] Add additional buttons: menu, share, ...

        'button_0': {
            text: 'A',
            className: 'gamepad-btn gamepad-btn-round',
            style: {
                color: '#a3e82d',
                textShadow: '0 0 8px #1a2a02'
            }
        },
        'button_1': {
            text: 'B',
            className: 'gamepad-btn gamepad-btn-round',
            style: {
                color: '#ff4d4d',
                textShadow: '0 0 8px #4d0000'
            }
        },
        'button_2': {
            text: 'X',
            className: 'gamepad-btn gamepad-btn-round',
            style: {
                color: '#55b4ff',
                textShadow: '0 0 8px #002a4d'
            }
        },
        'button_3': {
            text: 'Y',
            className: 'gamepad-btn gamepad-btn-round',
            style: {
                color: '#ffde55',
                textShadow: '0 0 8px #4d3c00'
            }
        },
        'button_4': {
            text: 'LB',
            className: 'gamepad-btn gamepad-btn-rect'
        },
        'button_5': {
            text: 'RB',
            className: 'gamepad-btn gamepad-btn-rect'
        },
        'button_6': {
            text: 'LT',
            className: 'gamepad-btn gamepad-btn-trigger'
        },
        'button_7': {
            text: 'RT',
            className: 'gamepad-btn gamepad-btn-trigger'
        },
        'button_8': {
            className: 'gamepad-btn gamepad-btn-round',
            style: {
                color: 'white'
            },
            html: `<svg class="gamepad-view-icon" viewBox="0 0 70 70" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,-1052.5)"><circle cx="35" cy="1087.5" r="32.5"/><rect x="31.25" y="1085" width="20" height="15"/><path d="m38.75 1077.5v-5h-20v15h5"/></g></svg>`
        },
    };


    const gamepad = navigator.getGamepads()[gamepadIndex];



    /* -----------------------

          EVENT LISTENERS

    ------------------------- */

    // Navigation
    prevBtn.addEventListener('click', () => navigate('prev'));
    yesBtn.addEventListener('click', () => annotate('yes'));
    noBtn.addEventListener('click', () => annotate('no'));
    skipBtn.addEventListener('click', () => annotate('skip'));

    // Input select buttons
    micButton.addEventListener('click', () => {
        if (isRecording) stopSpeechRecognition();
        else startSpeechRecognition();
    });

    speechSelectionBtn.addEventListener('click', () => {
        speechSelectionToggledOn = !speechSelectionToggledOn;
        if (speechSelectionToggledOn) {
            startSpeechSelectionMode();
        } else {
            stopSpeechSelectionMode();
        }
    });

    container.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isHelpVisible) {
            e.preventDefault();
            e.stopPropagation();
            toggleHelpOverlay();
            return;
        }

        const shortcutString = parseShortcut(e);

        if (shortcutString.toLowerCase() === 'alt+i') {
            e.preventDefault();
            e.stopPropagation();
            toggleHelpOverlay();
            return;
        }

        const shortcuts = model.get('shortcuts');
        const action = shortcuts[shortcutString];

        if (action === 'speech_selection') {
            e.preventDefault();
            e.stopPropagation();
            if (speechSelectionToggledOn) {
                speechSelectionToggledOn = false;
                stopSpeechSelectionMode();
            } else if (!isSpeechSelectionMode) {
                speechSelectionHotkeyDown = true;
                startSpeechSelectionMode();
            }
            return;
        }

        if (action) {
            e.preventDefault();
            e.stopPropagation();
            handleAction(action);
        }
    });

    // Keyboard shortcuts
    container.addEventListener('keyup', (e) => {
        const shortcuts = model.get('shortcuts');
        const shortcutString = parseShortcut(e);
        const action = shortcuts[shortcutString];

        if (action === 'speech_selection' && speechSelectionHotkeyDown) {
            e.preventDefault();
            e.stopPropagation();
            speechSelectionHotkeyDown = false;
            stopSpeechSelectionMode();
        }
    });

    helpBtn.addEventListener('click', () => handleAction('help_overlay'));
    helpOverlay.addEventListener('click', (e) => {
        if (e.target === helpOverlay) {
            toggleHelpOverlay();
        }
    });

    //.Gamepad detection
    window.addEventListener('gamepadconnected', (e) => {
        gamepadConnected = true;
        gamepadIndex = e.gamepad.index;
        gamepadIndicator.style.display = 'inline';
    });

    window.addEventListener('gamepaddisconnected', (e) => {
        gamepadConnected = false;
        gamepadIndex = -1;
        gamepadIndicator.style.display = 'none';
    });




    /* ------------------------------------------------

                          FUNCTIONS

    -------------------------------------------------- */

    // --------------
    // Initialization
    // --------------
    initSpeechRecognition();
    updateDisplay();

    model.on('change:current_index', updateDisplay);
    model.on('change:examples', updateDisplay);
    model.on('change:notes', updateDisplay);
    model.on('change:shortcuts', updateDisplay);
    model.on('change:gamepad_shortcuts', updateDisplay);

    pollGamepad();

    const existingGamepads = navigator.getGamepads();
    for (let i = 0; i < existingGamepads.length; i++) {
        if (existingGamepads[i]) {
            gamepadConnected = true;
            gamepadIndex = i;
            gamepadIndicator.style.display = 'inline';
            break;
        }
    }

    // ---------------------------
    // Rendering, display, actions
    // ---------------------------
    function renderExample(example) {
        if (typeof example === 'object') {
            return JSON.stringify(example, null, 2);
        }
        return String(example);
    }

    function updateDisplay() {
        const examples = model.get('examples');
        const currentIndex = model.get('current_index');
        const showNotes = model.get('notes');

        status.textContent = `Example ${currentIndex + 1} of ${examples.length}`;

        if (examples.length > 0 && currentIndex < examples.length) {
            const currentExample = examples[currentIndex];
            if (currentExample._html) {
                exampleContainer.innerHTML = currentExample._html;
            } else {
                exampleContainer.textContent = renderExample(currentExample);
            }
        } else {
            exampleContainer.textContent = 'No examples to display';
        }

        const annotations = model.get('annotations');
        const existingAnnotation = annotations.find(ann => ann.index === currentIndex);
        const newNotesValue = existingAnnotation ? existingAnnotation._notes || '' : '';

        if (!isRecording) {
            notesField.value = newNotesValue;
        }

        notesContainer.style.display = showNotes ? 'block' : 'none';

        const progress = examples.length > 0 ? (currentIndex / examples.length) * 100 : 0;
        progressFill.style.width = `${progress}%`;

        prevBtn.disabled = currentIndex === 0;
        const noMoreExamples = currentIndex >= examples.length;

        yesBtn.disabled = noMoreExamples;
        noBtn.disabled = noMoreExamples;
        skipBtn.disabled = noMoreExamples;

        if (currentIndex >= examples.length - 1 && currentIndex < examples.length) {
            status.textContent = `Example ${currentIndex + 1} of ${examples.length} (Last example)`;
        } else if (noMoreExamples) {
            status.textContent = 'All examples annotated!';
        }
    }
    function handleAction(action) {
        switch (action) {
            case 'prev':
                navigate('prev');
                break;
            case 'yes':
                annotate('yes');
                break;
            case 'no':
                annotate('no');
                break;
            case 'skip':
                annotate('skip');
                break;
            case 'focus_notes':
                notesField.focus();
                break;
            case 'speech_notes':
                if (isSpeechSelectionMode) return;
                if (isRecording) stopSpeechRecognition();
                else startSpeechRecognition();
                break;
            case 'help_overlay':
                toggleHelpOverlay();
                break;
        }
    }

    // ----------
    // Annotation
    // ----------
    function annotate(label) {
        const examples = model.get('examples');
        const currentIndex = model.get('current_index');
        const annotations = model.get('annotations');
        const showNotes = model.get('notes');

        if (currentIndex >= examples.length) return;

        const annotation = {
            index: currentIndex,
            example: examples[currentIndex],
            _label: label,
            _notes: showNotes ? notesField.value : '',
            _timestamp: new Date().toISOString()
        };

        const feedbackClass = label === 'yes' ? 'success-feedback' : label === 'no' ? 'error-feedback' : 'skip-feedback';
        const button = label === 'yes' ? yesBtn : label === 'no' ? noBtn : skipBtn;
        button.classList.add(feedbackClass);
        setTimeout(() => {
            button.classList.remove(feedbackClass);
        }, 300);

        const newAnnotations = annotations.filter(ann => ann.index !== currentIndex);
        newAnnotations.push(annotation);
        model.set('annotations', newAnnotations);

        model.set('current_index', currentIndex + 1);
        model.save_changes();
    }

    function navigate(direction) {
        const currentIndex = model.get('current_index');
        if (direction === 'prev' && currentIndex > 0) {
            prevBtn.classList.add('prev-feedback');
            setTimeout(() => {
                prevBtn.classList.remove('prev-feedback');
            }, 300);
            model.set('current_index', currentIndex - 1);
            model.save_changes();
        }
    }

    // ------------------
    // Keyboard shortcuts
    // ------------------
    function parseShortcut(event) {
        const modifiers = [];
        if (event.ctrlKey) modifiers.push('Ctrl');
        if (event.altKey) modifiers.push('Alt');
        if (event.shiftKey) modifiers.push('Shift');
        if (event.metaKey) modifiers.push('Meta');

        let key = event.code;
        const modifierCodes = ['ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight', 'MetaLeft', 'MetaRight'];
        if (modifierCodes.includes(key)) return '';

        key = key.replace('Key', '').replace('Digit', '');
        return modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
    }


    // --------------------------
    // Speech recording & parsing
    // --------------------------
    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            speechRecognition = new SpeechRecognition();
            speechRecognition.lang = 'en-US';

            speechRecognition.onresult = (event) => {
                if (isSpeechSelectionMode) {
                    const fullTranscript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
                    const command = fullTranscript.split(' ')[0];

                    lastChoiceDisplay.textContent = `Heard: "${command}"`;
                    let actionFound = true;
                    switch (command) {
                        case 'yes':
                            handleAction('yes');
                            break;
                        case 'no':
                            handleAction('no');
                            break;
                        case 'skip':
                            handleAction('skip');
                            break;
                        case 'previous':
                            handleAction('prev');
                            break;
                        case 'stop':
                            if (speechSelectionToggledOn) stopSpeechSelectionMode();
                            break;
                        default:
                            actionFound = false;
                            lastChoiceDisplay.textContent += ' (not valid)';
                            break;
                    }
                    if (!actionFound) {
                        setTimeout(() => {
                            if (lastChoiceDisplay.textContent.includes('(not valid)')) lastChoiceDisplay.textContent = '';
                        }, 2000);
                    }
                } else {
                    let newFinalTranscript = '';
                    let newInterimTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) newFinalTranscript += transcript;
                        else newInterimTranscript += transcript;
                    }
                    if (newFinalTranscript) {
                        const separator = originalNotesText ? ' ' : '';
                        originalNotesText += separator + newFinalTranscript;
                    }
                    const separator = originalNotesText ? ' ' : '';
                    notesField.value = originalNotesText + separator + newInterimTranscript;
                }
            };

            speechRecognition.onend = () => {
                if (isSpeechSelectionMode) {
                    if (speechSelectionToggledOn && isSpeechSelectionMode) {
                        try {
                            speechRecognition.start();
                        } catch (e) {
                            stopSpeechSelectionMode(true);
                        }
                    } else if (!speechSelectionToggledOn) {
                        stopSpeechSelectionMode();
                    }
                } else {
                    isRecording = false;
                    notesField.value = originalNotesText;
                    updateRecordingUI();
                }
            };

            speechRecognition.onerror = (event) => {
                if (isSpeechSelectionMode) {
                    lastChoiceDisplay.textContent = `Error: ${event.error}`;
                    stopSpeechSelectionMode(true);
                } else {
                    console.error('Speech recognition error for notes:', event.error);
                    isRecording = false;
                    notesField.value = originalNotesText;
                    updateRecordingUI();
                }
            };
            speechAvailable = true;
        } else {
            speechAvailable = false;
        }
        updateMicButtonState();
    }

    function updateRecordingUI() {
        if (isRecording) {
            micButton.classList.add('recording');
            notesField.classList.add('recording');
            micButton.innerHTML = '🔴';
        } else {
            micButton.classList.remove('recording');
            notesField.classList.remove('recording');
            micButton.innerHTML = speechAvailable ? '🎤' : '❌';
        }
    }

    function updateMicButtonState() {
        micButton.disabled = !speechAvailable;
        speechSelectionBtn.disabled = !speechAvailable;
        updateRecordingUI();
    }

    function startSpeechRecognition() {
        if (speechAvailable && !isRecording && !isSpeechSelectionMode) {
            isRecording = true;
            originalNotesText = notesField.value;
            speechRecognition.continuous = true;
            speechRecognition.interimResults = true;
            try {
                speechRecognition.start();
                updateRecordingUI();
            } catch (error) {
                console.error("Error starting speech recognition for notes:", error);
                isRecording = false;
            }
        }
    }

    function stopSpeechRecognition() {
        if (speechAvailable && isRecording) {
            speechRecognition.stop();
        }
    }

    // -----------------------
    // Speech button selection
    // -----------------------
    function startSpeechSelectionMode() {
        if (isSpeechSelectionMode || !speechAvailable) return;
        isSpeechSelectionMode = true;
        if (isRecording) stopSpeechRecognition();
        micButton.disabled = true;
        container.classList.add('speech-selection-active');
        speechSelectionBtn.classList.add('active');

        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
        const speechRecognitionList = new SpeechGrammarList();
        const grammar = '#JSGF V1.0; grammar commands; public <command> = yes | no | skip | previous | stop;';
        speechRecognitionList.addFromString(grammar, 1);

        speechRecognition.grammars = speechRecognitionList;
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;

        try {
            speechRecognition.start();
        } catch (e) {
            stopSpeechSelectionMode(true);
        }
    }

    function stopSpeechSelectionMode(force = false) {
        if (!isSpeechSelectionMode && !force) return;

        isSpeechSelectionMode = false;
        speechSelectionToggledOn = false;
        speechSelectionHotkeyDown = false;

        container.classList.remove('speech-selection-active');
        speechSelectionBtn.classList.remove('active');
        lastChoiceDisplay.textContent = '';
        micButton.disabled = !speechAvailable;

        if (speechRecognition) {
            speechRecognition.stop();
            const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
            speechRecognition.grammars = new SpeechGrammarList();
        }
    }

    // ------------
    // Help overlay
    // ------------

    function toggleHelpOverlay() {
        isHelpVisible = !isHelpVisible;
        if (isHelpVisible) {
            renderHelpContent();
            helpOverlay.classList.add('is-visible');
        } else {
            helpOverlay.classList.remove('is-visible');
        }
    }

    function renderHelpContent() {


        function createGamepadBadge(buttonKey) {
            const span = document.createElement('span');

            const badgeInfo = GAMEPAD_NAMES[buttonKey] || {
                    text: buttonKey.replace(/button_/, 'B'),
                    className: 'molabel-key'
                };
            if (badgeInfo.className) {
                span.className = badgeInfo.className;
            }
            if (badgeInfo.style) {
                Object.assign(span.style, badgeInfo.style);
            }
            if (badgeInfo.html) {
                span.innerHTML = badgeInfo.html;
            } else {
                span.textContent = badgeInfo.text;
            }
            return span;
        }

        function createKeyBadge(shortcutString) {
            const container = document.createElement('span');
            container.className = 'inline-flex items-center gap-1';
            const keys = shortcutString.split('+');
            keys.forEach((key, index) => {
                const kbd = document.createElement('kbd');
                kbd.className = 'molabel-key';
                kbd.textContent = key;
                container.appendChild(kbd);
                if (index < keys.length - 1) {
                    const separator = document.createElement('span');
                    separator.className = 'key-separator';
                    separator.textContent = '+';
                    container.appendChild(separator);
                }
            });
            return container;
        }

        const shortcuts = model.get('shortcuts');
        const gamepadShortcuts = model.get('gamepad_shortcuts');

        const allActions = new Set();
        Object.values(shortcuts).forEach(action => allActions.add(action));
        Object.values(gamepadShortcuts).forEach(action => allActions.add(action));

        const actionOrder = ['prev', 'yes', 'no', 'skip', 'focus_notes', 'speech_notes', 'speech_selection'];
        const sortedActions = actionOrder.filter(action => allActions.has(action));

        const keyForAction = Object.fromEntries(Object.entries(shortcuts).map(([k, v]) => [v, k]));
        const gamepadForAction = Object.fromEntries(Object.entries(gamepadShortcuts).map(([k, v]) => [v, k]));

        helpContent.innerHTML = ''; // Clear previous content

        const title = document.createElement('h2');
        title.className = 'molabel-help-title';
        title.textContent = 'Shortcuts';
        helpContent.appendChild(title);

        const table = document.createElement('table');
        table.className = 'molabel-help-table';

        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        ['Action', 'Keyboard', 'Gamepad'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        const tbody = table.createTBody();
        const addRow = (action, fixedKeys) => {
            const row = tbody.insertRow();
            const actionCell = row.insertCell();
            actionCell.className = 'action-name-cell';
            actionCell.textContent = action.replace(/_/g, ' ');

            const keyboardCell = row.insertCell();
            keyboardCell.className = 'shortcut-cell';
            const keyboardKey = fixedKeys ? fixedKeys.keyboard : keyForAction[action];
            if (keyboardKey) {
                keyboardCell.appendChild(createKeyBadge(keyboardKey));
            }

            const gamepadCell = row.insertCell();
            gamepadCell.className = 'shortcut-cell';
            const gamepadKey = fixedKeys ? fixedKeys.gamepad : gamepadForAction[action];
            if (gamepadKey) {
                gamepadCell.appendChild(createGamepadBadge(gamepadKey));
            }
        };
        sortedActions.forEach(action => addRow(action));
        addRow('Show / Hide Help', {
            keyboard: 'Alt+i',
            gamepad: 'button_8'
        });
        helpContent.appendChild(table);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'absolute top-2 right-3 text-2xl text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors';
        closeBtn.innerHTML = '×';
        closeBtn.title = 'Close (Esc)';
        closeBtn.onclick = toggleHelpOverlay;
        helpContent.appendChild(closeBtn);
    }

    // -------
    // Gamepad
    // -------
    function pollGamepad() {
        if (!gamepadConnected) {
            requestAnimationFrame(pollGamepad);
            return;
        }
        if (gamepad) {
            const gamepadShortcuts = model.get('gamepad_shortcuts');
            gamepad.buttons.forEach((button, index) => {
                const buttonKey = `button_${index}`;
                const wasPressed = lastButtonStates[buttonKey] || false;
                const isPressed = button.pressed;


                if (isPressed && !wasPressed) {
                    if (buttonKey === 'button_8') {
                        toggleHelpOverlay();
                    }

                    gamepadIndicator.style.display = 'inline';
                    const action = gamepadShortcuts[buttonKey];
                    if (action) {
                        if (action === 'speech_selection') {
                            if (speechSelectionToggledOn) {
                                speechSelectionToggledOn = false;
                                stopSpeechSelectionMode();
                            } else if (!isSpeechSelectionMode) {
                                speechSelectionHotkeyDown = true;
                                startSpeechSelectionMode();
                            }
                        } else if (action === 'speech_notes') {
                            if (isSpeechSelectionMode) return;
                            speechGamepadPressed = true;
                            startSpeechRecognition();
                        } else {
                            handleAction(action);
                        }
                    }
                }

                if (!isPressed && wasPressed) {
                    const action = gamepadShortcuts[buttonKey];
                    if (action === 'speech_selection' && speechSelectionHotkeyDown) {
                        speechSelectionHotkeyDown = false;
                        stopSpeechSelectionMode();
                    } else if (action === 'speech_notes' && speechGamepadPressed) {
                        speechGamepadPressed = false;
                        stopSpeechRecognition();
                    }
                }
                lastButtonStates[buttonKey] = isPressed;
            });
        }
        requestAnimationFrame(pollGamepad);
    }
}

export default {
    render
};
