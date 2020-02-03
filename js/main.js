'use strict';
var MINES = '*';
var EMPTY = ' ';
var FLAG = '<img class="flag" src="img/flag.png">';

var gFirstClick = true;
var gBoard = [];
var gWatch;
var gRaveal = false;
var gManuallyMode = false;

var gLevel = {
    LEVEL: 'Medium',
    SIZE: 8,
    MINES: 12
};

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    hint: 3,
    safe: 3,
    lives: 3,
    isWin: false
}

var undoBoard = [];

function initGame() {
    gGame.isOn = true;
    gGame.hint = 3;
    gGame.isWin = false;
    gGame.shownCount = 0;
    gGame.markedCount = 0;
    gGame.lives = 3;
    gGame.safe = 3;

    undoBoard = [];

    var elTimerContainer = document.querySelector('.timer span');
    gWatch = new timerWatch(elTimerContainer);

    setLife();
    setHint();
    setSafe();

    gBoard = buildBoard();
    // undoBoard.push(copyBoard(gBoard));
    printMat(gBoard);
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
                isEmpty: false
            }
            board[i][j] = cell;
        }
    }
    return board;
}
function renderBoard(board) {
    var countMines = 0;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            if (cell.isMine) countMines++;
        }
    }
    if (countMines === 0) {
        for (var i = 0; i < gLevel.MINES; i++) {
            addRandomMine();
        }
    }
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            var negsCount = setMinesNegsCount(i, j);
            (negsCount) ? cell.minesAroundCount = negsCount : cell.isEmpty = true;
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
    if (gBoard[i][j].isShown) return;
    if (gManuallyMode) {
        manuallyCreateMode(i, j);
        return;
    }
    if (gFirstClick) {
        gWatch.start();
        gFirstClick = false;
        renderBoard(gBoard);
    }
    if (gRaveal) {
        hintReveal(elCell, i, j);
        return;
    }

    var board = gBoard[i][j];
    board.isShown = true;

    // if its empty reveal all emtpy
    if (board.isEmpty) {
        revealEmptyCells(i, j);
    }

    if (board.isMine) {
        gGame.lives--;
        setLife();
        if (gGame.lives === 0) return gameOver();
    } else {
        gGame.shownCount++;
    }
    elCell.classList.add('opened');
    renderCell(i, j);

    // undoBoard.push(copyBoard(gBoard));
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
            if (gRaveal || gManuallyMode) return;
            elCell.style = 'background-color: red';
            elCell.innerHTML = MINES
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
        if (gGame.isWin) continue;
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
                renderCell(i, j);
            }
        }
    }
    var elSmile = document.querySelector('.smile');
    if (!gGame.isWin) {
        elSmile.innerHTML = '<img class="smile-img" src="img/lose-smile.png">';
    } else {
        elSmile.innerHTML = '<img class="smile-img" src="img/win-smile.png">';
    }
}
function revealBtn(elBtn) {
    if (gGame.hint < 0 || !gGame.isOn) return;
    gGame.hint--;
    if (gGame.hint < 0) elBtn.querySelector('span').innerText = 0;
    else elBtn.querySelector('span').innerText = gGame.hint;
    gRaveal = true;
}
function hintReveal(elCell, i, j) {
    if (!gGame.isOn) return;
    if (gFirstClick) return;
    if (gGame.hint < 0) return gRaveal = false;
    expandShown(gBoard, elCell, i, j);
    gRaveal = false;
}
function getNeighbors(posI, posJ) {
    var neighbors = [];
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue;
            if (i === posI && j === posJ) continue;
            neighbors.push({ i, j });
        }
    }
    return neighbors;
}
function startOver() {
    gFirstClick = true;
    gWatch.stop();
    gWatch.reset();
    var elSmile = document.querySelector('.smile');
    elSmile.innerHTML = '<img class="smile-img" src="img/smile.png">';
    initGame();
}
function expandShown(board, elCell, posI, posJ) {

    elCell.classList.add('hint');

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

    board[posI][posJ].isShown = true;
    document.querySelector(`.cell${posI}-${posJ}`).classList.add('hint');
    renderCell(posI, posJ);

    setTimeout(() => {
        var elTds = document.querySelectorAll('table .hint');
        for (var td of elTds) {
            td.classList.remove('hint');
        }

        for (var i = 0; i < neighbors.length; i++) {
            var neighbor = neighbors[i];
            board[neighbor.i][neighbor.j].isShown = false;
            renderCell(neighbor.i, neighbor.j);
        }

        board[posI][posJ].isShown = false;
        renderCell(posI, posJ);

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
    if (gBoard[i][j].isShown) return;
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
            gLevel.LEVEL = 'Beginner';
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            break;
        case 'Medium':
            gLevel.LEVEL = 'Medium';
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            break;
        case 'Expert':
            gLevel.LEVEL = 'Expert';
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            break;
        default:
            break;
    }
    gWatch.stop(true);
    gWatch.reset();
    initGame();
}
function revealEmptyCells(posI, posJ) {
    if (gBoard[posI][posJ].isMine) return;
    var neighbors = getNeighbors(posI, posJ);

    for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];
        if (gBoard[neighbor.i][neighbor.j].isShown ||
            gBoard[neighbor.i][neighbor.j].isMarked ||
            gBoard[neighbor.i][neighbor.j].isMine) {
            var idx = neighbors.indexOf(neighbor);
            neighbors.splice(idx, 1);
            i--;
            continue;
        }
        gBoard[neighbor.i][neighbor.j].isShown = true;
        document.querySelector(`.cell${neighbor.i}-${neighbor.j}`).classList.add('opened');
        renderCell(neighbor.i, neighbor.j);
        gGame.shownCount++;

        if (gBoard[neighbor.i][neighbor.j].isEmpty) revealEmptyCells(neighbor.i, neighbor.j);
    }
}
function safeClick(elBtn) {
    if (!gGame.isOn) return;
    if (gGame.safe > 0) {
        gGame.safe--;

        var safeCells = [];
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                var pos = { i: i, j: j };
                if (!gBoard[i][j].isMine && !gBoard[i][j].isShown && !gBoard[i][j].isMarked) safeCells.push(pos);
            }
        }

        if (!safeCells[0]) return;
        elBtn.querySelector('.safe span').innerText = gGame.safe;
        var randomIdx = getRandomInt(0, safeCells.length - 1);
        var randomPos = safeCells[randomIdx];
        var elCell = document.querySelector(`.cell${randomPos.i}-${randomPos.j}`);
        elCell.classList.add('show');
        setTimeout(() => {
            elCell.classList.remove('show');
        }, 1000);
    }
}
function setSafe() {
    var elCell = document.querySelector('.safe span');
    elCell.innerText = gGame.safe;
}
function setLife() {
    var elCell = document.querySelector('.live-counter span');
    elCell.innerHTML = gGame.lives;
}
function setHint() {
    var elCell = document.querySelector('.hint span');
    elCell.innerText = gGame.hint;
}
function setManuallyMode(elBtn) {
    if (!gGame.isOn || !gFirstClick) return;
    if (!gManuallyMode) {
        elBtn.innerText = 'START PLAY';
        gManuallyMode = true
        gLevel.MINES = 0;
    } else {
        gManuallyMode = false;
        elBtn.innerText = 'CUSTOM MINE';
    }
}
function manuallyCreateMode(i, j) {

    gBoard[i][j].isMine = true;
    gLevel.MINES++;
    gBoard[i][j].isShown = true;
    renderCell(i, j);
    setTimeout(() => {
        gBoard[i][j].isShown = false;
        renderCell(i, j);
    }, 1000);
}

////////////////////////////// copy gBoard pointer.. try not to save pointer in the array ////////////////////////
// function undo() {
//     debugger;
//     if (!undoBoard[0]) return;
//     var board = [];
//     var idx = undoBoard.length - 1;
//     board = undoBoard[idx];
//     gBoard = copyBoard(board);
//     undoBoard.slice(idx ,1);
//     printMat(gBoard);
// }
// function copyBoard(mat) {
//     var board = mat;
//     var boardCopy = [];
//     for (var i = 0; i < board.length; i++) {
//         var row = board[i];
//         boardCopy[i] = [];
//         for (var j = 0; j < row.length; j++) {
//             var cell = row[j];
//             boardCopy[i][j] = cell;
//         }
//     }

//     return boardCopy;
// }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function themeMode(elBtn) {
//     if (elBtn.innerText === 'dark mode') {
//         elBtn.innerText = 'light mode';
//     } else {
//         elBtn.innerText = 'dark mode';
//     }

//     // var elBody = document.querySelector('body');
//     // elBody.classList.toggle('dark-mode');
//     // var elBtns = document.querySelectorAll('.btn');
//     // for(var btn of elBtns){
//     //     btn.classList.toggle('dark-mode');
//     // }
//     // var elCells = document.querySelectorAll('.cell');
//     // for (var cell of elCells) {
//     //     cell.classList.toggle('.cell-dark-mode');
//     // }
//     // var elBtns = document.querySelectorAll('.btn');
//     // for (var btn of elBtns) {
//     //     btn.classList.toggle('.btn-dark-mode');
//     // }

// }