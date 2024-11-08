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
    const progressElement = document.getElementById('progress');
    const gameModeSelect = document.getElementById('game-mode');
    const gameLengthInput = document.getElementById('game-length');
    const difficultySelect = document.getElementById('difficulty');
    const startGameButton = document.getElementById('start-game');

    let isCapsLock = false;
    let isShiftPressed = false;
    let currentScore = 0;
    let currentTargetText = '';
    let startTime;
    let timerInterval;
    let gameMode = 'words';
    let gameLength = 20;
    let difficulty = 'easy';
    let isGameActive = false;
    let wordsTyped = 0;
    let currentLevel = 1;

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

    async function generateTargetText() {
        try {
            currentTargetText = await backend.getRandomSentence(difficulty, currentLevel);
            targetTextElement.textContent = currentTargetText;
            highlightKeys(currentTargetText[0]);
            wordCountElement.textContent = `Words: ${currentTargetText.split(' ').length}`;
        } catch (error) {
            console.error('Error generating target text:', error);
        }
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
            if (gameMode === 'time' && elapsedTime >= gameLength) {
                endGame();
            }
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
        if (!isGameActive) return;

        const userInput = userInputElement.value;
        const targetText = currentTargetText.slice(0, userInput.length);

        const accuracy = calculateAccuracy(userInput, targetText);
        accuracyElement.textContent = `Accuracy: ${accuracy}%`;

        if (userInput === targetText) {
            if (userInput.length === currentTargetText.length) {
                currentScore += calculateScore(accuracy);
                scoreElement.textContent = `Score: ${currentScore}`;
                wordsTyped += currentTargetText.split(' ').length;
                if (gameMode === 'words' && wordsTyped >= gameLength) {
                    endGame();
                } else {
                    generateTargetText();
                    userInputElement.value = '';
                    updateLevel();
                }
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

    function updateLevel() {
        currentLevel = Math.floor(wordsTyped / 20) + 1;
        progressElement.textContent = `Level: ${currentLevel}`;
        difficulty = currentLevel <= 3 ? 'easy' : currentLevel <= 6 ? 'medium' : 'hard';
        difficultySelect.value = difficulty;
    }

    function startGame() {
        isGameActive = true;
        userInputElement.value = '';
        userInputElement.readOnly = false;
        userInputElement.focus();
        currentScore = 0;
        scoreElement.textContent = `Score: ${currentScore}`;
        wordsTyped = 0;
        currentLevel = 1;
        progressElement.textContent = `Level: ${currentLevel}`;
        generateTargetText();
        startTimer();
        startGameButton.textContent = 'End Game';
    }

    function endGame() {
        isGameActive = false;
        const elapsedTime = stopTimer();
        userInputElement.readOnly = true;
        resultElement.textContent = 'Game Over!';
        resultElement.style.color = 'blue';
        backend.addScore(currentScore, elapsedTime);
        startGameButton.textContent = 'Start Game';
    }

    function calculateScore(accuracy) {
        const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
        return Math.floor(10 * accuracy * difficultyMultiplier);
    }

    document.addEventListener('keydown', (e) => {
        if (!isGameActive) return;

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

    keys.forEach(key => {
        key.addEventListener('mousedown', () => {
            if (!isGameActive) return;
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

    gameModeSelect.addEventListener('change', (e) => {
        gameMode = e.target.value;
        gameLengthInput.placeholder = gameMode === 'words' ? 'Number of words' : 'Time in seconds';
    });

    gameLengthInput.addEventListener('change', (e) => {
        gameLength = parseInt(e.target.value);
    });

    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
    });

    startGameButton.addEventListener('click', () => {
        if (isGameActive) {
            endGame();
        } else {
            startGame();
        }
    });

    gameMode = gameModeSelect.value;
    gameLength = parseInt(gameLengthInput.value);
    difficulty = difficultySelect.value;
});
