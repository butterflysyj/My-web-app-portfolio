let gameState = {
    isPlaying: false,
    score: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    currentQuestion: null,
    operation: 'mixed',
    difficulty: 'easy',
    gameMode: 'time',
    timeLeft: 60,
    maxQuestions: 10,
    timer: null
};

function getDifficultyRange(difficulty) {
    switch(difficulty) {
        case 'easy': return { min: 1, max: 10 };
        case 'medium': return { min: 1, max: 50 };
        case 'hard': return { min: 1, max: 100 };
        default: return { min: 1, max: 10 };
    }
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
    const range = getDifficultyRange(gameState.difficulty);
    let num1, num2, operation, answer;
    
    if (gameState.operation === 'mixed') {
        const operations = ['addition', 'subtraction', 'multiplication', 'division'];
        operation = operations[Math.floor(Math.random() * operations.length)];
    } else {
        operation = gameState.operation;
    }
    
    switch(operation) {
        case 'addition':
            num1 = getRandomNumber(range.min, range.max);
            num2 = getRandomNumber(range.min, range.max);
            answer = num1 + num2;
            return {
                text: `${num1} + ${num2} = ?`,
                answer: answer,
                operation: '+'
            };
            
        case 'subtraction':
            num1 = getRandomNumber(range.min, range.max);
            num2 = getRandomNumber(range.min, Math.min(num1, range.max));
            answer = num1 - num2;
            return {
                text: `${num1} - ${num2} = ?`,
                answer: answer,
                operation: '-'
            };
            
        case 'multiplication':
            const multRange = gameState.difficulty === 'easy' ? 
                { min: 1, max: 10 } : 
                gameState.difficulty === 'medium' ? 
                { min: 1, max: 12 } : 
                { min: 1, max: 15 };
            num1 = getRandomNumber(multRange.min, multRange.max);
            num2 = getRandomNumber(multRange.min, multRange.max);
            answer = num1 * num2;
            return {
                text: `${num1} × ${num2} = ?`,
                answer: answer,
                operation: '×'
            };
            
        case 'division':
            num2 = getRandomNumber(2, gameState.difficulty === 'easy' ? 10 : 12);
            const quotient = getRandomNumber(1, gameState.difficulty === 'easy' ? 10 : 20);
            num1 = num2 * quotient;
            answer = quotient;
            return {
                text: `${num1} ÷ ${num2} = ?`,
                answer: answer,
                operation: '÷'
            };
            
        default:
            return generateQuestion();
    }
}

function displayQuestion() {
    gameState.currentQuestion = generateQuestion();
    document.getElementById('question').textContent = gameState.currentQuestion.text;
    document.getElementById('answer-input').value = '';
    document.getElementById('answer-input').focus();
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
}

function updateStats() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('correct-count').textContent = gameState.correctAnswers;
    document.getElementById('total-count').textContent = gameState.totalQuestions;
    
    if (gameState.gameMode === 'time') {
        document.getElementById('timer').textContent = gameState.timeLeft;
        updateProgress();
    } else {
        document.getElementById('timer').textContent = `${gameState.totalQuestions}/${gameState.maxQuestions}`;
        const progress = (gameState.totalQuestions / gameState.maxQuestions) * 100;
        document.getElementById('progress').style.width = progress + '%';
    }
}

function updateProgress() {
    if (gameState.gameMode === 'time') {
        const progress = ((60 - gameState.timeLeft) / 60) * 100;
        document.getElementById('progress').style.width = progress + '%';
    }
}

function startTimer() {
    if (gameState.gameMode !== 'time') return;
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateStats();
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

function submitAnswer() {
    if (!gameState.isPlaying) return;
    
    const userAnswer = parseInt(document.getElementById('answer-input').value);
    const feedback = document.getElementById('feedback');
    
    if (isNaN(userAnswer)) {
        feedback.textContent = '숫자를 입력해주세요!';
        feedback.className = 'feedback incorrect';
        return;
    }
    
    gameState.totalQuestions++;
    
    if (userAnswer === gameState.currentQuestion.answer) {
        gameState.correctAnswers++;
        gameState.score += 10;
        feedback.textContent = '정답입니다! 🎉';
        feedback.className = 'feedback correct';
    } else {
        feedback.textContent = `틀렸습니다. 정답: ${gameState.currentQuestion.answer}`;
        feedback.className = 'feedback incorrect';
    }
    
    updateStats();
    
    if (gameState.gameMode === 'questions' && gameState.totalQuestions >= gameState.maxQuestions) {
        setTimeout(endGame, 1500);
    } else {
        setTimeout(displayQuestion, 1500);
    }
}

function startGame() {
    gameState.operation = document.getElementById('operation').value;
    gameState.difficulty = document.getElementById('difficulty').value;
    gameState.gameMode = document.getElementById('game-mode').value;
    
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.totalQuestions = 0;
    gameState.timeLeft = 60;
    
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    
    updateStats();
    displayQuestion();
    
    if (gameState.gameMode === 'time') {
        startTimer();
    }
}

function endGame() {
    gameState.isPlaying = false;
    stopTimer();
    
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    
    const accuracy = gameState.totalQuestions > 0 ? 
        Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100) : 0;
    
    document.getElementById('final-score').textContent = `${gameState.score}점`;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    document.getElementById('total-questions').textContent = gameState.totalQuestions;
    document.getElementById('correct-answers').textContent = gameState.correctAnswers;
}

function restartGame() {
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');
    
    gameState.isPlaying = false;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.totalQuestions = 0;
    gameState.timeLeft = 60;
    stopTimer();
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('answer-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });
    
    document.getElementById('answer-input').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9-]/g, '');
    });
});