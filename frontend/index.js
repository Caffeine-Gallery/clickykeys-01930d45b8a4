import { backend } from 'declarations/backend';

document.addEventListener('DOMContentLoaded', () => {
    const keys = document.querySelectorAll('.key');
    const capsLockKey = document.getElementById('caps');
    const targetTextElement = document.getElementById('target-text');
    const userInputElement = document.getElementById('user-input');
    const resultElement = document.getElementById('result');
    const scoreElement = document.getElementById('score');
    const wordCountElement = document.getElementById('word-count');
    const accuracyElement = document.getElementById('accuracy');
    const timerElement = document.getElementById('timer');
    let isCapsLock = false;
    let isShiftPressed = false;
    let currentScore = 0;
    let currentTargetText = '';
    let startTime;
    let timerInterval;

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
                    userInputElement.select();
                    break;
                case 'copy':
                    navigator.clipboard.writeText(userInputElement.value);
                    break;
                case 'paste':
                    navigator.clipboard.readText().then(text => {
                        const cursorPos = userInputElement.selectionStart;
                        const textBefore = userInputElement.value.substring(0, cursorPos);
                        const textAfter = userInputElement.value.substring(userInputElement.selectionEnd);
                        userInputElement.value = textBefore + text + textAfter;
                        checkUserInput();
                    });
                    break;
                case 'undo':
                    userInputElement.value = userInputElement.value.slice(0, -1);
                    checkUserInput();
                    break;
            }
        }
    }

    function generateTargetText() {
        const words = ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog'];
        const randomWords = [];
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            randomWords.push(words[randomIndex]);
        }
        currentTargetText = randomWords.join(' ');
        targetTextElement.textContent = currentTargetText;
        highlightKeys(currentTargetText[0]);
        wordCountElement.textContent = `Words: ${randomWords.length}`;
    }

    function highlightKeys(char) {
        keys.forEach(key => {
            if (key.textContent.toLowerCase() === char.toLowerCase()) {
                key.classList.add('highlight');
            } else {
                key.classList.remove('highlight');
            }
        });
    }

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            timerElement.textContent = `Time: ${elapsedTime}s`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        return elapsedTime;
    }

    function calculateAccuracy(userInput, targetText) {
        let correctChars = 0;
        for (let i = 0; i < userInput.length; i++) {
            if (userInput[i] === targetText[i]) {
                correctChars++;
            }
        }
        return Math.floor((correctChars / targetText.length) * 100);
    }

    function checkUserInput() {
        const userInput = userInputElement.value;
        const targetText = currentTargetText.slice(0, userInput.length);

        if (!startTime) {
            startTimer();
        }

        const accuracy = calculateAccuracy(userInput, targetText);
        accuracyElement.textContent = `Accuracy: ${accuracy}%`;

        if (userInput === targetText) {
            if (userInput.length === currentTargetText.length) {
                const elapsedTime = stopTimer();
                resultElement.textContent = 'Correct! Well done!';
                resultElement.style.color = 'green';
                currentScore += 10;
                scoreElement.textContent = `Score: ${currentScore}`;
                backend.addScore(currentScore, elapsedTime);
                generateTargetText();
                userInputElement.value = '';
                startTime = null;
            } else {
                resultElement.textContent = 'Correct so far...';
                resultElement.style.color = 'green';
                highlightKeys(currentTargetText[userInput.length]);
            }
        } else {
            resultElement.textContent = 'Incorrect. Try again!';
            resultElement.style.color = 'red';
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
            const char = key.textContent === 'Space' ? ' ' : key.textContent;
            userInputElement.value += char;
            checkUserInput();
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

    // Typing game initialization
    generateTargetText();
    userInputElement.addEventListener('input', checkUserInput);
});
