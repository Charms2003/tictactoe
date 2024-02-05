var origBoard;
const huPlayer = 'X';
const aiPlayer = 'O';
let currentPlayer = huPlayer;
const countX = document.getElementById("scoreX");
const countO = document.getElementById("scoreO");
const restartBtn = document.getElementById("restartButton");
const winCheckElement = document.getElementById("winCheck");
let player1Score = 0;
let player2Score = 0;

const winCombos = [ //combination of winning patterns

    //straight horizontal wins
    [0, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23],
    [24, 25, 26, 27, 28, 29],

    //straight vertical wins
    [0, 6, 12, 18, 24],
    [1, 7, 13, 19, 25],
    [2, 8, 14, 20, 26],
    [3, 9, 15, 21, 27],
    [4, 10, 16, 22, 28],
    [5, 11, 17, 23, 29],

    //diagonal wins 1
    [4, 11],
    [3, 10, 17],
    [2, 9, 16, 23],
    [1, 8, 15, 22, 29],
    [0, 7, 14, 21, 28],
    [6, 13, 20, 27],
    [12, 19, 26],
    [18, 25],

    //diagonal wins 2
    [1, 6],
    [2, 7, 12],
    [3, 8, 13, 18],
    [4, 9, 14, 19, 24],
    [5, 10, 15, 20, 25],
    [11, 16, 21, 26],
    [17, 22, 27],
    [23, 28]

];

const cells = document.querySelectorAll('.cell');

let turnInfoElement;

function updateTurnInfo(player) {
    if (turnInfoElement) {
        turnInfoElement.innerText = `Turn: Player ${player}`;
    }
}

function startGame() {
    restartBtn.addEventListener("click", restartButton);

    if (player1Score === 5 || player2Score === 5) {
        alert("Game Over! Human: " + player1Score + ", AI: " + player2Score);
        resetScores();  //reset scores and continue the game
    }

    origBoard = Array.from(Array(30).keys());
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].removeEventListener('click', turnClick, false);
        cells[i].addEventListener('click', turnClick, false);
    }
    
    turnInfoElement = document.getElementById("turnInfo");
    updateTurnInfo(currentPlayer);
}

startGame();

function resetScores() {
    player1Score = 0;
    player2Score = 0;
    countO.innerText = "AI: " + player1Score;
    countX.innerText = "Human: " + player2Score;
}

function turnClick(square) {
    if (typeof origBoard[square.target.id] === 'number') {
        //human move
        turn(square.target.id, huPlayer);

        //check for win and tie conditions
        if (!checkWin(origBoard, huPlayer) && !checkTie()) {
            updateTurnInfo(aiPlayer);
            setTimeout(() => {
                turn(bestSpot(), aiPlayer);
                updateTurnInfo(huPlayer);
            }, 200);
            //AI turn to move

        }
    }
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerHTML = player;
    let gameWon = checkWin(origBoard, player);
    if (gameWon) gameOver(gameWon);
    checkTie();
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor = gameWon.player == huPlayer ? "green" : "blue";
    }

    setTimeout(() => {
        for (let index of winCombos[gameWon.index]) {
            document.getElementById(index).style.backgroundColor = "";
        }

        // Clear the board and reset the game
        startGame();
        winCheckElement.innerText = "";
    }, 1100); // Adjust the delay (in milliseconds) as needed

    for (let i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }

    declareWinner(gameWon.player == huPlayer ? "Human Earned a Point!" : "AI Earned a Point.");

    // Update scores and display with labels
    if (gameWon.player == huPlayer) {
        player1Score++;
        countX.innerText = "Human: " + player1Score;
    } else {
        player2Score++;
        countO.innerText = "AI: " + player2Score;
    }
}

function checkTie() {
    if (emptySquares().length == 0) {
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "#393939";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game!");
        tieRestart()
        return true;
    }
    return false;
}

function declareWinner(who) {
    winCheckElement.innerText = who;
}

function tieRestart() {
    setTimeout(() => {
        winCheckElement.innerText = "";
        startGame();
    }, 1100); // Adjust the delay (in milliseconds) as needed
}

function emptySquares() {
    return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
    const availableSpots = emptySquares();

    //evaluate each available spot and assign scores
    const scores = availableSpots.map(move => {
        let score = 0;

        //check if the move leads win
        let tempBoard = [...origBoard];
        tempBoard[move] = aiPlayer;
        if (checkWin(tempBoard, aiPlayer)) {
            score = 1;
        }

        //check if the player move leads to a win, if yes try to block
        tempBoard[move] = huPlayer;
        if (checkWin(tempBoard, huPlayer)) {
            score = 0.5;
        }

        if (score === 0) {
            //check if move contributes to a potential win
            for (let combo of winCombos) {
                if (combo.includes(move)) {
                    const opponentMoves = combo.filter(pos => origBoard[pos] === huPlayer);
                    if (opponentMoves.length === 1) {
                        score = 0.2 + Math.random() * 0.1; //random
                    }
                }
            }
        }

        return { move, score };
    });

    //AI finds the move with the highest score
    const bestMove = scores.reduce((prev, current) => (current.score > prev.score) ? current : prev);

    return bestMove.move;
}

function randomMove() {
    const availableSpots = emptySquares();
    const randomIndex = Math.floor(Math.random() * availableSpots.length);
    return availableSpots[randomIndex];
}

function restartButton() {
    console.log("Restart button clicked");
    winCheckElement.innerText = "";
    resetScores();
    startGame(); // Refresh the page
}
