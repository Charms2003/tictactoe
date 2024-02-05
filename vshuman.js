
//retrieve user selections from localStorage
const difficul = localStorage.getItem('aiDifficulty');
const playerTyp = localStorage.getItem('playerType');

//game js
var origBoard;
const player1 = 'X';
const player2 = 'O';
let currentPlayer = player1;
let player1Score = 0;
let player2Score = 0;
let gameFrozen = false;


const winConditions = [ //combination of winning patterns

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
startGame();
updateTurnInfo(player1);

function startGame() {

    origBoard = Array.from(Array(30).keys());

    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].removeEventListener('click', turnClick, false);
        cells[i].addEventListener('click', turnClick, false);
    }

    document.getElementById("restartButton").addEventListener("click", restartButton);


    currentPlayer = player1;
    updateTurnInfo(player1)
}

function resetScores() {
    player1Score = 0;
    player2Score = 0;

    const scoreX = document.getElementById("scoreX");
    const scoreO = document.getElementById("scoreO");

    if (scoreX) {
        scoreX.innerText = `X: ${player1Score}`;
    }

    if (scoreO) {
        scoreO.innerText = `O: ${player2Score}`;
    }
}


function turnClick(square) {
    console.log('Turn Clicked'); // Debugging

    if (typeof origBoard[square.target.id] === 'number' && !gameFrozen) {
        // Human move
        turn(square.target.id, currentPlayer);

        currentPlayer = currentPlayer === player1 ? player2 : player1;
        updateTurnInfo(currentPlayer);

        // Check for win and tie conditions
        if (!checkWin(origBoard, currentPlayer) && !checkTie()) {
            // Continue with the next player's turn
        }
    }
}


function updateTurnInfo(player) {
    const turnInfoElement = document.getElementById("turnInfo");
    turnInfoElement.innerText = `Turn: Player ${player}`;
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerHTML = player;

    const nextPlayer = player === player1 ? player2 : player1;

    updateTurnInfo(nextPlayer);

    let gameWon = checkWin(origBoard, player);
    if (gameWon) gameOver(gameWon);
    checkTie();
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winConditions.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    console.log('gameWon:', gameWon);

    gameFrozen = true; // Set the flag

    for (let index of winConditions[gameWon.index]) {
        document.getElementById(index).style.backgroundColor = gameWon.player == player1 ? "green" : "blue";
    }

    setTimeout(() => {
        for (let index of winConditions[gameWon.index]) {
            document.getElementById(index).style.backgroundColor = "";
        }

        // Clear the board and reset the game
        startGame();

        declareWinner(gameWon.player == player1 ? "Player X Earns a Point!" : "Player O Earns a Point!");
        if (gameWon.player == player1) {
            player1Score++;
            scoreX.innerText = `X: ${player1Score}`;
        } else {
            player2Score++;
            scoreO.innerText = `O: ${player2Score}`;
        }

        if (player1Score === 5 || player2Score === 5) {
            setTimeout(() => {
                alert("Game Over! Player X: " + player1Score + ", Player O: " + player2Score);
                resetScores();  //reset scores and continue the game
                startGame();
            }, 500);
        }

        gameFrozen = false; // Reset the flag
    }, 1100); // Adjust the delay (in milliseconds) as needed
}



function checkTie() {
    if (emptySquares().length == 0) {
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "#393939";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game!")
        tieRestart()
        return true;
    }
    return false;
}

function declareWinner(who) {
    const winCheckElement = document.getElementById("winCheck");
    winCheckElement.innerText = who;

    // Show the message
    winCheckElement.style.display = "block";

    // Set a timeout to hide the message after the delay
    setTimeout(() => {
        winCheckElement.style.display = "none";
    }, 1100); // Adjust the delay (in milliseconds) as needed
}


function tieRestart() {
    setTimeout(() => {
        startGame();
    }, 1100); // Adjust the delay (in milliseconds) as needed
}

function emptySquares() {
    return origBoard.filter(s => typeof s == 'number');
}

function updateScore(player) {
    if (player === player1) {
        player1Score++;
        scoreX.innerText = `X: ${player1Score}`;
    } else if (player === player2) {
        player2Score++;
        scoreO.innerText = `O: ${player2Score}`;
    }
}

function restartButton() { //changed to startgame instead of reload
    console.log("Restart button clicked");
    resetScores();
    startGame(); // Refresh the page
}

