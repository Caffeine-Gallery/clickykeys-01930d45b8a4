import { backend } from 'declarations/backend';

document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');
    const textOutput = document.querySelector('.text-output');
    const capsLockKey = document.getElementById('caps');
    let isCapsLock = false;
    let isShiftPressed = false;

    // Create audio context and sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    function createKeySound(frequency, type = 'sine') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.value = 0.1;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);
        
        setTimeout(() => {
            oscillator.stop();
        }, 100);
    }

    const keyMap = new Map([
        ['Space', ' '],
        ['ArrowLeft', '←'],
        ['ArrowRight', '→'],
        ['ArrowUp', '↑'],
        ['ArrowDown', '↓'],
        ['Backspace', 'Delete'],
        ['Enter', 'Return'],
        ['Control', 'control'],
        ['Alt', 'option'],
        ['Meta', 'command'],
    ]);

    const shortcuts = {
        'a': { key: 'A', cmd: true, action: 'selectAll' },
        'c': { key: 'C', cmd: true, action: 'copy' },
        'v': { key: 'V', cmd: true, action: 'paste' },
        'z': { key: 'Z', cmd: true, action: 'undo' },
    };

    function handleShortcut(e) {
        const key = e.key.toLowerCase();
        if (shortcuts[key] && e.metaKey) {
            e.preventDefault();
            const action = shortcuts[key].action;
            switch(action) {
                case 'selectAll':
                    textOutput.select();
                    break;
                case 'copy':
                    navigator.clipboard.writeText(textOutput.value);
                    break;
                case 'paste':
                    navigator.clipboard.readText().then(text => {
                        const cursorPos = textOutput.selectionStart;
                        const textBefore = textOutput.value.substring(0, cursorPos);
                        const textAfter = textOutput.value.substring(textOutput.selectionEnd);
                        textOutput.value = textBefore + text + textAfter;
                        updateBackendText();
                    });
                    break;
                case 'undo':
                    textOutput.value = textOutput.value.slice(0, -1);
                    updateBackendText();
                    break;
            }
        }
    }

    async function updateTextOutput(key) {
        if (key === 'Delete') {
            textOutput.value = textOutput.value.slice(0, -1);
        } else if (key === 'Return') {
            textOutput.value += '\n';
        } else if (key === 'Space') {
            textOutput.value += ' ';
        } else if (key.length === 1) {
            const char = isShiftPressed || isCapsLock ? key : key.toLowerCase();
            textOutput.value += char;
        }
        textOutput.scrollTop = textOutput.scrollHeight;
        await updateBackendText();
    }

    async function updateBackendText() {
        try {
            await backend.setText(textOutput.value);
        } catch (error) {
            console.error('Error updating backend text:', error);
        }
    }

    async function loadTextFromBackend() {
        try {
            const text = await backend.getText();
            textOutput.value = text;
        } catch (error) {
            console.error('Error loading text from backend:', error);
        }
    }

    // Handle physical keyboard input
    document.addEventListener('keydown', async (e) => {
        const keyToFind = keyMap.get(e.key) || keyMap.get(e.code) || e.key.toUpperCase();
        
        if (e.key === 'CapsLock') {
            isCapsLock = !isCapsLock;
            capsLockKey.classList.toggle('active', isCapsLock);
        }

        if (e.key === 'Shift') {
            isShiftPressed = true;
        }

        handleShortcut(e);

        keys.forEach(key => {
            if (key.textContent === keyToFind) {
                key.classList.add('active');
                createKeySound(200 + Math.random() * 100);
                updateTextOutput(key.textContent);
            }
        });
    });

    document.addEventListener('keyup', (e) => {
        const keyToFind = keyMap.get(e.key) || keyMap.get(e.code) || e.key.toUpperCase();
        
        if (e.key === 'Shift') {
            isShiftPressed = false;
        }

        keys.forEach(key => {
            if (key.textContent === keyToFind) {
                key.classList.remove('active');
            }
        });
    });

    // Handle mouse/touch input
    keys.forEach(key => {
        key.addEventListener('mousedown', () => {
            key.classList.add('active');
            createKeySound(200 + Math.random() * 100);
            updateTextOutput(key.textContent);
        });

        key.addEventListener('mouseup', () => {
            if (key.textContent !== 'Caps' || !isCapsLock) {
                key.classList.remove('active');
            }
        });

        key.addEventListener('mouseleave', () => {
            if (key.textContent !== 'Caps' || !isCapsLock) {
                key.classList.remove('active');
            }
        });
    });

    // Load initial text from backend
    loadTextFromBackend();
});