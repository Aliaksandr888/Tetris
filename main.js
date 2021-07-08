let main = document.querySelector(".main");
const scroeElem = document.getElementById("score");
const levelElem = document.getElementById("level");
const nextTetroElem = document.getElementById("next-tetro");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const gameOver = document.getElementById("game-over");

let playfield = [
    [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

let score = 0;
let gameTimerID;
let currentLevel = 1;
let isPaused = true;
let possibleLevels = {
    1: {
        scorePerLine: 10,
        speed: 400,
        nextLevelScore: 20,
    },
    2: {
        scorePerLine: 15,
        speed: 300,
        nextLevelScore: 500,
    },
    3: {
        scorePerLine: 20,
        speed: 200,
        nextLevelScore: 1000,
    },
    4: {
        scorePerLine: 30,
        speed: 100,
        nextLevelScore: 2000,
    },
    5: {
        scorePerLine: 50,
        speed: 50,
        nextLevelScore: Infinity,
    },
};

let figures = {
    O: [
        [1, 1],
        [1, 1],
    ],
    I: [
        // [0, 0, 0, 0],
        [1, 1, 1, 1],
        // [0, 0, 0, 0],
        // [0, 0, 0, 0],
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        // [0, 0, 0],
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        // [0, 0, 0],
    ],
    L: [
        [1, 0, 0],
        [1, 1, 1],
        // [0, 0, 0],
    ],
    J: [
        [0, 0, 1],
        [1, 1, 1],
        // [0, 0, 0],
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0],
        // [0, 0, 0], 
    ],
};

let activeTetro = getNewTetro();
let nextTetro = getNewTetro();

function draw() {
    let mainInnerHTML = "";
    for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
            if (playfield[y][x] === 1) {
                mainInnerHTML += '<div class="cell movingCell"></div>';
            } else if (playfield[y][x] === 2) {
                mainInnerHTML += '<div class="cell fixedCell"></div>';
            } else {
                mainInnerHTML += '<div class="cell"></div>';
            }
        }
    }
    main.innerHTML = mainInnerHTML;
}

function drawNextTetro() {
    let nextTetroInnerHTML = "";
    for (let y = 0; y < nextTetro.shape.length; y++) {
        for (let x = 0; x < nextTetro.shape[y].length; x++) {
            if (nextTetro.shape[y][x]) {
                nextTetroInnerHTML += '<div class="cell movingCell next-movingCell"></div>';

            } else {
                nextTetroInnerHTML += '<div class="next-cell"></div>';
            }
        }
        nextTetroInnerHTML += "<br/>";
    }
    nextTetroElem.innerHTML = nextTetroInnerHTML;
}

function removePrevActiveTetro() {
    for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
            if (playfield[y][x] === 1) {
                playfield[y][x] = 0;
            }
        }
    }
}
let clickAudio = new Audio("sound/vyibor-nujnogo-deystviya.mp3");
let fullLineAudio = new Audio("sound/igrovaya-sreda-audio-energoobespechenie-audio-material-39368.mp3");
let gameOverAudio = new Audio("sound/silno-stimulirovat-zvuk-igrovoy-stsenyi-39544.mp3");

function clickSoundInit() {
    gameOverAudio.play();
    gameOverAudio.pause();
    fullLineAudio.play();
    fullLineAudio.pause();
    clickAudio.play(); // запускаем звук
    clickAudio.pause(); // и сразу останавливаем
}
function gameOverSound() {
    gameOverAudio.currentTime = 0;
    gameOverAudio.play();
}
function fullLineSound() {
    fullLineAudio.currentTime = 0;
    fullLineAudio.play();
}
function clickSound() {
    clickAudio.currentTime = 0; // в секундах
    clickAudio.play();
}
function addActiveTetro() {
    removePrevActiveTetro();
    for (let y = 0; y < activeTetro.shape.length; y++) {
        for (let x = 0; x < activeTetro.shape[y].length; x++) {
            if (activeTetro.shape[y][x] === 1) {
                playfield[activeTetro.y + y][activeTetro.x + x] =
                    activeTetro.shape[y][x];

            }
        }
    }
}

function rotateTetro() {
    const prevTetroState = activeTetro.shape;

    activeTetro.shape = activeTetro.shape[0].map((val, index) =>
        activeTetro.shape.map((row) => row[index]).reverse()
    );

    if (hasCollisions()) {
        activeTetro.shape = prevTetroState;
    }
}

function hasCollisions() {
    for (let y = 0; y < activeTetro.shape.length; y++) {
        for (let x = 0; x < activeTetro.shape[y].length; x++) {
            if (
                activeTetro.shape[y][x] &&
                (playfield[activeTetro.y + y] === undefined ||
                    playfield[activeTetro.y + y][activeTetro.x + x] === undefined ||
                    playfield[activeTetro.y + y][activeTetro.x + x] === 2)
            ) {
                return true;
            }
        }
    }
    return false;
}

function removeFullLines() {
    let canRemoveLine = true,
        filledLines = 0;
    for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
            if (playfield[y][x] !== 2) {
                canRemoveLine = false;
                break;
            }
        }
        if (canRemoveLine) {
            playfield.splice(y, 1);
            playfield.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            filledLines += 1;
            fullLineSound();
        }
        canRemoveLine = true;
    }

    switch (filledLines) {
        case 1:
            score += possibleLevels[currentLevel].scorePerLine;
            break;
        case 2:
            score += possibleLevels[currentLevel].scorePerLine * 3;
            break;
        case 3:
            score += possibleLevels[currentLevel].scorePerLine * 6;
            break;
        case 4:
            score += possibleLevels[currentLevel].scorePerLine * 12;
            break;
    }

    scroeElem.innerHTML = score;

    if (score >= possibleLevels[currentLevel].nextLevelScore) {
        currentLevel++;
        levelElem.innerHTML = currentLevel;
    }
}

function getNewTetro() {
    const possibleFigures = "IOLJTSZ";
    const rand = Math.floor(Math.random() * 7);
    const newTetro = figures[possibleFigures[rand]];

    return {
        x: Math.floor((10 - newTetro[0].length) / 2),
        y: 0,
        shape: newTetro,
    };
}

function fixTetro() {
    for (let y = 0; y < playfield.length; y++) {
        for (let x = 0; x < playfield[y].length; x++) {
            if (playfield[y][x] === 1) {
                playfield[y][x] = 2;
            }
        }
    }
}

function moveTetroDown() {
    activeTetro.y += 1;
    if (hasCollisions()) {
        activeTetro.y -= 1;
        fixTetro();
        removeFullLines();
        activeTetro = nextTetro;
        if (hasCollisions()) {
            reset();
        }
        nextTetro = getNewTetro();
    }
}

function dropTetro() {
    for (let y = activeTetro.y; y < playfield.length; y++) {
        activeTetro.y += 1;
        if (hasCollisions()) {
            activeTetro.y -= 1;
            break;
        }
    }
}

function reset() {
    isPaused = true;
    clearTimeout(gameTimerID);
    playfield = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    draw();
    // gameOverSound();
    gameOver.style.display = "block";

    startBtn.disabled = false;
}

document.onkeydown = function (e) {
    if (!isPaused) {
        if (e.keyCode === 37) {
            activeTetro.x -= 1;
            clickSound();
            if (hasCollisions()) {
                activeTetro.x += 1;
                clickSound();
            }
        } else if (e.keyCode === 39) {
            activeTetro.x += 1;
            clickSound();
            if (hasCollisions()) {
                activeTetro.x -= 1;
                clickSound();
            }
        } else if (e.keyCode === 40) {
            dropTetro();
        } else if (e.keyCode === 38) {
            rotateTetro();
        }

        updateGameState();
    }
};

function updateGameState() {
    if (!isPaused) {
        addActiveTetro();
        draw();
        drawNextTetro();
    }
}

pauseBtn.addEventListener("click", (e) => {
    if (e.target.innerHTML === "Pause") {
        e.target.innerHTML = "Play";
        clearTimeout(gameTimerID);
    } else {
        e.target.innerHTML = "Pause";
        gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
    }
    isPaused = !isPaused;
});

startBtn.addEventListener("click", (e) => {
    e.target.innerHTML = "Start";
    isPaused = false;
    startBtn.disabled = true;

    gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
    gameOver.style.display = "none";

});

scroeElem.innerHTML = score;
levelElem.innerHTML = currentLevel;

draw();

function startGame() {
    clickSoundInit();
    moveTetroDown();
    if (!isPaused) {
        updateGameState();
        gameTimerID = setTimeout(startGame, possibleLevels[currentLevel].speed);
    }
}
let ghostBtn = document.querySelector('#btn-ghost');
countRotate = 0;
function creatingGhostBtn() {
    for (let i = 0; i < 4; i++) {
        let ghostBtnCircle = document.createElement('div');
        let inputGhost = document.createElement('input');
        ghostBtn.appendChild(ghostBtnCircle);
        ghostBtnCircle.appendChild(inputGhost);
        inputGhost.type = 'button';
        inputGhost.className = 'input-ghost';
        inputGhost.value = "\u{25B2}"
        ghostBtnCircle.className = 'circle-ghost';
        countRotate += 90;
        ghostBtnCircle.style.transformOrigin = '50% 50px';
        ghostBtnCircle.style.transform = `rotate(${countRotate}deg)`;

        if (ghostBtnCircle.style.transform === "rotate(90deg)") {
            inputGhost.ontouchstart = function () {
                activeTetro.x += 1;
                if (hasCollisions()) {
                    activeTetro.x -= 1;
                }
            }
        }
        else if (ghostBtnCircle.style.transform === "rotate(270deg)") {
            inputGhost.ontouchstart = function () {
                activeTetro.x -= 1;
                if (hasCollisions()) {
                    activeTetro.x += 1;
                }
            }
        }
        else if (ghostBtnCircle.style.transform === "rotate(180deg)") {
            inputGhost.ontouchstart = function () {
                dropTetro();
                activeTetro.y -= 1
                if (hasCollisions()) {
                    activeTetro.y -= activeTetro.shape.length
                }
            }
        }
        else if (ghostBtnCircle.style.transform === "rotate(360deg)") {
            inputGhost.ontouchstart = function () {
                rotateTetro();
            }
        }
        updateGameState();
    }
}
creatingGhostBtn();