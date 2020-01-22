'use strict';
var MINES = '*';
var EMPTY = ' ';
var FLAG = '<img class="flag" src="/img/flag.png">';

var gFirstClick = true;
var gBoard = [];
var gWatch;


var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    hint: 3,
    isWin: false,
    lives: 3
}


function initGame() {
    var elTimerContainer = document.querySelector('.timer');
    gWatch = new timerWatch(elTimerContainer);
    setLife();
    gBoard = buildBoard();
    printMat(gBoard, '.board-container');
    gGame.isOn = true;
    gGame.hint = 3;
    gGame.isWin = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.lives = 3;
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            board[i][j] = cell;
        }
    }
    return board;
}

function renderBoard(board) {
    for (var i = 0; i < gLevel.MINES; i++) {
        addRandomMine();
    }
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            var negsCount = setMinesNegsCount(i, j);
            if (negsCount) cell.minesAroundCount = negsCount;
        }
    }
}

function setMinesNegsCount(posI, posJ) {
    var minesCount = 0
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === posI && j === posJ) continue;
            if (gBoard[i][j].isMine) minesCount++
        }
    }
    return minesCount;
}

function cellClicked(elCell, i, j) {

    if (!gGame.isOn) return;
    if (elCell.innerHTML === FLAG) return;
    if (gFirstClick) {
        gWatch.start();
        gFirstClick = false;
        renderBoard(gBoard);
    }

    var board = gBoard[i][j];
    board.isShown = true;
    if (board.isMine) {
        gGame.lives--;
        setLife();
        if (gGame.lives === 0) return gameOver();
    } else {
        gGame.shownCount++;
    }
    elCell.style = 'background-color: lightgray';
    renderCell(i, j);
    checkGameOver();
}

function renderCell(posI, posJ) {
    var elCell = document.querySelector(`.cell${posI}-${posJ}`);
    var board = gBoard[posI][posJ];
    if (!board.isShown) return elCell.innerHTML = EMPTY;
    if (board.minesAroundCount) elCell.innerHTML = board.minesAroundCount;
    if (board.isMine) {
        if (!gGame.isWin) {
            elCell.innerHTML = MINES;
            elCell.style = 'background-color: red';
        }
    }
}

function addRandomMine() {
    var i = getRandomInt(0, gLevel.SIZE - 1);
    var j = getRandomInt(0, gLevel.SIZE - 1);
    if (gBoard[i][j].isMine) return addRandomMine();
    gBoard[i][j].isMine = true;
}

function gameOver() {
    gWatch.stop();
    gGame.isOn = false;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
                renderCell(i, j);
            }
        }
    }
    var elSmile = document.querySelector('.smile');
    if (!gGame.isWin) {
        elSmile.innerHTML = '<img class="smile-img" src="/img/lose-smile.png">';
    } else {
        elSmile.innerHTML = '<img class="smile-img" src="/img/win-smile.png">';
    }
}

function hintReveal() {
    if (!gGame.isOn) return;
    if (gFirstClick) return;
    if (gGame.hint === 0) return;
    var emptyCells = [];
    gGame.hint--;

    //find empty cells
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var pos = { i: i, j: j };
            if (gBoard[i][j].minesAroundCount === 0 && !gBoard[i][j].isMine) emptyCells.push(pos);
        }
    }

    var randomIdx = getRandomInt(0, emptyCells.length - 1);
    var randomPos = emptyCells[randomIdx];
    var elCell = document.querySelector(`.cell${randomPos.i}-${randomPos.j}`);

    expandShown(gBoard, elCell, randomPos.i, randomPos.j);
}

function getNeighbors(posI, posJ) {
    var neighbors = [];
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard.length) continue;
            if (i === posI && j === posJ) continue;
            neighbors.push({ i, j });
        }
    }
    return neighbors;
}

function startOver() {
    gFirstClick = true;
    // gGame.secsPassed = 0;
    gWatch.reset();
    var elSmile = document.querySelector('.smile');
    elSmile.innerHTML = '<img class="smile-img" src="/img/smile.png">';
    initGame();
}

function expandShown(board, elCell, posI, posJ) {

    elCell.classList.add('hint');
    elCell.classList.add('center');
    renderCell(posI, posJ);

    var neighbors = getNeighbors(posI, posJ);

    for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];
        if (board[neighbor.i][neighbor.j].isShown || board[neighbor.i][neighbor.j].isMarked) {
            var idx = neighbors.indexOf(neighbor);
            neighbors.splice(idx, 1);
            i--;
            continue;
        }
        board[neighbor.i][neighbor.j].isShown = true;
        document.querySelector(`.cell${neighbor.i}-${neighbor.j}`).classList.add('hint');
        renderCell(neighbor.i, neighbor.j);
    }
    setTimeout(() => {
        var elTds = document.querySelectorAll('.hint');
        for (var td of elTds) {
            td.classList.remove('hint');
        }
        var elCenter = document.querySelector('.center');
        elCenter.classList.remove('center');
        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];
            board[neighbor.i][neighbor.j].isShown = false;
            renderCell(neighbor.i, neighbor.j);
        }
    }, 1000);
}

function checkGameOver() {
    if (gGame.shownCount === (gBoard.length ** 2 - gLevel.MINES)) {
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (gBoard[i][j].isMine) {
                    var elCell = document.querySelector(`.cell${i}-${j}`);
                    if (elCell.innerHTML !== FLAG) {
                        if (!gBoard[i][j].isShown) return;
                    }
                }
            }
        }
        gGame.isWin = true;
        gameOver();
    }
}


function cellMarked(elCell, ev, i, j) {
    if (gGame.isWin) return;
    if (!(ev.button === 2)) return;
    if (elCell.innerHTML !== FLAG) {
        elCell.innerHTML = FLAG;
        gGame.markedCount++;
        gBoard[i][j].isMarked = true;
    } else {
        elCell.innerHTML = EMPTY;
    }
    checkGameOver();
}

function changeLevel(elCell) {

    switch (elCell.innerText) {
        case 'Beginner':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            break;
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            break;
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            break;
        default:
            break;
    }
    gWatch.stop();
    gWatch.reset();
    initGame();
}

function setLife() {
    var elCell = document.querySelector('.live-counter span');
    elCell.innerHTML = gGame.lives;
}