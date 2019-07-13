var board = ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'];
var humanPlayer = '';
var aiPlayer = '';
var gameOver = false;
var moves = 0;
var choiceDiv = document.getElementById('choice');
var squares = document.getElementsByClassName('square');
var resetDiv = document.getElementById('reset');
// Set the player
function setPlayer(player) {
	if (player === 'X') {
		humanPlayer = 'X';
		aiPlayer = 'O';
	} else {
		humanPlayer = 'O';
		aiPlayer = 'X';
	}
	choiceDiv.style.display = 'none';
	resetDiv.style.display = 'block';
}
// Players choice
function flip(id, i) {
	moves++;
	if (board[i] === 'E' && gameOver === false && humanPlayer) {
		// Put player choice into the board array
		board.splice(i, 1, humanPlayer);
		var contents = document.getElementsByClassName('back');
		contents[i].textContent = humanPlayer;
		id.classList.add('flip');
		setTimeout(function () {
			startGame();
		}, 950)
	}
}
// Reset the game
function reset() {
	// Flip all squares back over
	squares = Array.from(squares);
	squares.forEach(function (e) {
		e.classList.remove('flip');
	})
	// Empty the board array
	board = ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'];
	gameOver = false;
	humanPlayer = '';
	aiPlayer = '';
	moves = 0;
	choiceDiv.style.display = 'block';
	resetDiv.style.display = 'none';
}
// Start the game and check winnings
function startGame() {
	if (gameOver === false && !checkWin(humanPlayer) && !checkWin(aiPlayer) && moves < 9) {
		MachineAI();
	}
	if (checkWin(humanPlayer)) {
		gameOver = true;
		alert("You Won!");
	} else if (checkWin(aiPlayer)) {
		gameOver = true;
		alert("You Loose!");
	} else if (moves === 9) {
		gameOver = true;
		alert("Draw!");
	}
	if (gameOver === true) {
		reset();
	}
}
// Win state checking
function checkWin(player) {
	if (
		(board[0] === player && board[1] === player && board[2] === player) ||
		(board[3] === player && board[4] === player && board[5] === player) ||
		(board[6] === player && board[7] === player && board[8] === player) ||
		(board[0] === player && board[3] === player && board[6] === player) ||
		(board[1] === player && board[4] === player && board[7] === player) ||
		(board[2] === player && board[5] === player && board[8] === player) ||
		(board[0] === player && board[4] === player && board[8] === player) ||
		(board[2] === player && board[4] === player && board[6] === player)
	) {
		return true;
	} else {
		return false;
	}
}
// AI (needs improvment)
function MachineAI() {
	moves++;
	var contents = document.getElementsByClassName('back');
	rand = Math.floor(Math.random(0, board.length) * 10);
	// If square is empty use random number
	if (board[rand] === 'E') {
		// Splice that number into the board array
		board.splice(rand, 1, aiPlayer);
		contents[rand].textContent = aiPlayer;
		squares[rand].classList.add('flip');
	} else {
		// Simple AI
		switch (true) {
			case board[0] === 'E':
				board.splice(0, 1, aiPlayer);
				contents[0].textContent = aiPlayer;
				squares[0].classList.add('flip');
				break;
			case board[1] === 'E':
				board.splice(1, 1, aiPlayer);
				contents[1].textContent = aiPlayer;
				squares[1].classList.add('flip');
				break;
			case board[2] === 'E':
				board.splice(2, 1, aiPlayer);
				contents[2].textContent = aiPlayer;
				squares[2].classList.add('flip');
				break;
			case board[3] === 'E':
				board.splice(3, 1, aiPlayer);
				contents[3].textContent = aiPlayer;
				squares[3].classList.add('flip');
				break;
			case board[4] === 'E':
				board.splice(4, 1, aiPlayer);
				contents[4].textContent = aiPlayer;
				squares[4].classList.add('flip');
				break;
			case board[5] === 'E':
				board.splice(5, 1, aiPlayer);
				contents[5].textContent = aiPlayer;
				squares[5].classList.add('flip');
				break;
			case board[6] === 'E':
				board.splice(6, 1, aiPlayer);
				contents[6].textContent = aiPlayer;
				squares[6].classList.add('flip');
				break;
			case board[7] === 'E':
				board.splice(7, 1, aiPlayer);
				contents[7].textContent = aiPlayer;
				squares[7].classList.add('flip');
				break;
			case board[8] === 'E':
				board.splice(8, 1, aiPlayer);
				contents[8].textContent = aiPlayer;
				squares[8].classList.add('flip');
				break;
		}
	}
}