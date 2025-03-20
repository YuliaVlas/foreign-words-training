"use strict"
const words = [
    {
        english: "cat",
        russian: "кот",
        example: 'Cat loves sour cream',
        img: "./img/cat.jpg",
    },
    {
        english: "dog",
        russian: "собака",
        example: 'Dog loves meat',
        img: "./img/dog.jpg",
    },
    {
        english: "mouse",
        russian: "мышь",
        example: 'Mouse loves cheese',
        img: "./img/mouse.jpg",
    },
    {
        english: "cow",
        russian: "корова",
        example: 'Cow loves grass',
        img: "./img/cow.jpg",
    },
    {
        english: "rabbit",
        russian: "кролик",
        example: 'Rabbit loves carrot',
        img: "./img/rabbit.jpg",
    },
];

let currentIndex = 0;
let firstCard = null;  
let secondCard = null;  
let lockBoard = false;
let matchedPairs = 0;
let correctAnswers = 0;
let seconds = 0;
let minutes = 0; 
let interval = null;
let wordStatistics = {};

const flipCard = document.querySelector('.flip-card');
const cardFront = document.getElementById('card-front');
const cardBack = document.getElementById('card-back');
const nextButton = document.getElementById('next');
const backButton = document.getElementById('back');
const currentWord = document.getElementById('current-word');
const progress = document.getElementById('words-progress');
const studyCards = document.querySelector('.study-cards');
const examCards = document.getElementById('.exam-cards');
const examButton = document.getElementById('exam'); 
const studyMode = document.getElementById('study-mode');
const examMode = document.getElementById('exam-mode');
const totalWords = words.length;
const correctPercent = document.getElementById('correct-percent');
const examProgress = document.getElementById('exam-progress');
const timerElement = document.getElementById('time');

flipCard.addEventListener('click', () => {
    flipCard.classList.toggle('active');
});

function loadCard() {
    cardFront.querySelector('.front-word').textContent = words[currentIndex].english;
    cardFront.style.backgroundImage = `url('${words[currentIndex].img}')`;
    cardFront.style.backgroundSize = 'cover';
    cardFront.style.backgroundPosition = 'center';
    
    cardBack.querySelector('.back-word').textContent = words[currentIndex].russian;
    cardBack.querySelector('.word-example').textContent = words[currentIndex].example;

    currentWord.textContent = currentIndex + 1;

    updateButtonStates();
    updateProgress();
}

function updateButtonStates() {
    backButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === words.length - 1;
}

function updateProgress() {
    const progressValue = ((currentIndex + 1) / totalWords) * 100;
    progress.value = progressValue;
}

nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % words.length; 
    loadCard();
});

backButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + words.length) % words.length;
    loadCard();
});

loadCard();

document.getElementById('shuffle-words').addEventListener('click', shuffleWords);

function shuffleWords() {
    const previousIndex = currentIndex;

    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]]; 
    }
    currentIndex = Math.min(previousIndex, words.length - 1);

    loadCard();
    updateProgress();
}

function enterExamMode() {
    studyMode.classList.add('hidden');
    examMode.classList.remove('hidden');   
    studyCards.classList.add('hidden');
    startExam();
}  

examButton.addEventListener('click', enterExamMode);

function startExam() { 
    const examCards = document.getElementById('exam-cards');  
    examCards.innerHTML = '';  
 
    const englishWords = words.map(word => word.english);  
    const russianWords = words.map(word => word.russian);  

    const allWords = [...englishWords, ...russianWords];  

    const shuffledWords = allWords.sort(() => Math.random() - 0.5);

    shuffledWords.forEach(word => {  
        const card = document.createElement('div');  
        card.classList.add('exam-card');  
        card.textContent = word;

        card.addEventListener('click', () => onCardClick(card)); 

        examCards.appendChild(card);  
    });
    startTimer();
}  

function onCardClick(card) {
    if (lockBoard) return; 
    if (card === firstCard) return;

    card.classList.add('correct'); 

    if (!firstCard) {
        firstCard = card;
    } else {
        secondCard = card; 
        checkForMatch(); 
    }
}

function checkForMatch() {
    lockBoard = true;

    const firstWord = firstCard.textContent.trim().toLowerCase();
    const secondWord = secondCard.textContent.trim().toLowerCase();

    const firstWordObject = words.find(word => 
        word.english.toLowerCase() === firstWord || word.russian.toLowerCase() === firstWord);
    
    const secondWordObject = words.find(word => 
        word.english.toLowerCase() === secondWord || word.russian.toLowerCase() === secondWord);

    const isMatch = firstWordObject && secondWordObject && (
        (firstWordObject.english.toLowerCase() === firstWord && secondWordObject.russian.toLowerCase() === secondWord) ||
        (firstWordObject.russian.toLowerCase() === firstWord && secondWordObject.english.toLowerCase() === secondWord)
    ); // если подбирать изначально правильно карточки,то код вроде как работает верно, НО если выбрать любое слово на английском и любое слово на русском,то тоже будет считать правильным... я не понимаю,почем так полчается.

    if (firstWordObject) {  
        recordAttempt(firstWordObject.english, isMatch);  
    } 
    if (!isMatch && secondWordObject) {  
        recordAttempt(secondWordObject.english, false);
    }   

    if (isMatch) {
        matchedPairs++;
        correctAnswers++;
        firstCard.classList.add('correct');   
        secondCard.classList.add('correct');
        setTimeout(() => {  
            firstCard.classList.add('hidden'); 
            secondCard.classList.add('hidden');
            resetCards();
            updateProgressTest();
            setTimeout(checkEndGame, 500);
        }, 500); 
    } else {
        firstCard.classList.add('wrong'); 
        secondCard.classList.add('wrong'); 
        setTimeout(() => {  
            firstCard.classList.remove('correct');
            secondCard.classList.remove('correct');
            firstCard.classList.remove('wrong');
            secondCard.classList.remove('wrong'); 
            resetCards();
        }, 500);
    }  
}

function resetCards() {  
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

function checkEndGame() { 
    const totalPairs = words.length;

    if (matchedPairs === totalPairs) {
        stopTimer();
        showResults();
        alert('Поздравляем! Вы успешно завершили проверку знаний.');  
    }  
}  
function updateProgressTest() {  
    const percent = (correctAnswers / totalWords) * 100;
    correctPercent.textContent = `${Math.round(percent)}%`;
    examProgress.value = percent; 
}  

function format(time) {
    return time < 10 ? '0' + time : time;
}

function startTimer() {  
    if (!interval) {  
        interval = setInterval(() => {  
            seconds++;  

            if (seconds === 60) {  
                minutes++;  
                seconds = 0;  
            }  
            timerElement.textContent = `${format(minutes)}:${format(seconds)}`;  
        }, 1000);  
    }  
}  
 
function stopTimer() {  
    clearInterval(interval);  
    interval = null; 
}  

function recordAttempt(word, isCorrect) {  
    if (!wordStatistics[word]) {  
        wordStatistics[word] = { attempts: 0, correct: 0 };  
    }  
    wordStatistics[word].attempts++;  
    if (isCorrect) {  
        wordStatistics[word].correct++;  
    }  
}  

function showResults() {  
    const resultsModal = document.querySelector('.results-modal');  
    const resultsContent = resultsModal.querySelector('.results-content');  
    resultsContent.innerHTML = '';
 
    const formattedTime = `${format(minutes)}:${format(seconds)}`;  
    document.getElementById('timer').textContent = formattedTime;  
    
    for (const word in wordStatistics) {  
        const { attempts } = wordStatistics[word];  
         
        const template = document.getElementById('word-stats');  
        const clone = template.content.cloneNode(true);  
         
        clone.querySelector('.word span').textContent = word;
        clone.querySelector('.attempts span').textContent = attempts; 

        resultsContent.appendChild(clone);  
    }  

    resultsModal.classList.remove('hidden');  
}  

function saveProgress() {  
    const progress = {  
        currentIndex,  
        //shuffledWords,  
        minutes,  
        seconds,  
        correctAnswers,   
    };  
    localStorage.setItem('progress', JSON.stringify(progress));  
}  

function loadProgress() {  
    try {  
        const savedProgress = JSON.parse(localStorage.getItem('progress'));  
        if (savedProgress) {  
            currentIndex = savedProgress.currentIndex;  
            minutes = savedProgress.minutes;  
            seconds = savedProgress.seconds;  
            correctAnswers = savedProgress.correctAnswers;  
 
            //shuffledWords = savedProgress.shuffledWords;  
  
            loadCard();  
            updateProgress();

            timerElement.textContent = `${format(minutes)}:${format(seconds)}`;  
        } else {  
            console.log('Нет сохраненного прогресса.');
        }  
    } catch (err) {  
        console.error("Ошибка разбора данных:", err);  
    }  
}  

window.onload = () => {  
    loadProgress();
};  
 
nextButton.addEventListener('click', saveProgress);  
backButton.addEventListener('click', saveProgress);  
document.getElementById('shuffle-words').addEventListener('click', saveProgress);  
examButton.addEventListener('click', saveProgress); 