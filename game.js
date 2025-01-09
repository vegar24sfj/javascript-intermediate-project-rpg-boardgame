// Game board (2D array)
let gameBoard = [
    ['', '', 'T', '', ''],
    ['M', '', '', 'T', ''],
    ['', 'T', 'M', '', ''],
    ['', '', '', 'M', ''],
    ['', 'M', '', '', 'D']
];

// Player object
let player = {
    x: 0, // Starting row
    y: 0, // Starting column
    inventory: [],
    move: function (direction) {
        // Implement movement logic
        let newX = this.x;
        let newY = this.y;

        if (direction === 'up' && this.x > 0) newX--;
        if (direction === 'down' && this.x < 4) newX++;
        if (direction === 'left' && this.y > 0) newY--;
        if (direction === 'right' && this.y < 4) newY++;

        // Check for collisions with treasures or monsters
        if (gameBoard[newX][newY] === 'T') {
            this.collectTreasure(newX, newY);
        } else if (gameBoard[newX][newY] === 'M') {
            this.fightMonster();
            return;
        }

        this.x = newX;
        this.y = newY;

        renderBoard();
        updateGameMessages();
    },
    collectTreasure: function (x, y) {
        // Collect the treasure and update the inventory
        this.inventory.push('Treasure');
        gameBoard[x][y] = ''; // Remove the treasure from the board
        updateGameMessages();
        checkGameStatus();
    },
    fightMonster: function () {
        // Display Game Over when a monster is encountered
        document.getElementById('gameMessages').innerText = 'Game Over! You landed on a monster.';
        document.getElementById('startAgainButton').style.display = 'inline-block';
        document.getElementById('gameBoard').style.display = 'none'; // Hide the game board
    }
};

// Function to render the game board
function renderBoard() {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('td');
            if (i === player.x && j === player.y) {
                cell.classList.add('player');
                cell.innerText = 'P';
            } else if (gameBoard[i][j] === 'T') {
                cell.classList.add('treasure');
                cell.innerText = 'T';
            } else if (gameBoard[i][j] === 'M') {
                cell.classList.add('monster');
                cell.innerText = 'M';
            }
            row.appendChild(cell);
        }
        boardElement.appendChild(row);
    }
}

// Function to update game messages
function updateGameMessages() {
    const gameMessages = document.getElementById('gameMessages');

    // Calculate remaining treasures
    const remainingTreasures = countRemainingTreasures();

    // Only display the treasure collected message if the player stepped on a treasure
    if (player.inventory.length > 0 && gameBoard[player.x][player.y] === '') {
        gameMessages.innerText = `Treasure collected! Treasures left: ${remainingTreasures}`;
    }

    // If the player collects all the treasures, display the victory message
    if (remainingTreasures === 0) {
        gameMessages.innerText = 'Victory! All treasures collected!';
        document.getElementById('startAgainButton').style.display = 'inline-block';  // Show button when game is over
        document.getElementById('gameBoard').style.display = 'none'; // Hide the game board
    }
}

// Function to count remaining treasures on the board
function countRemainingTreasures() {
    let count = 0;
    for (let i = 0; i < gameBoard.length; i++) {
        for (let j = 0; j < gameBoard[i].length; j++) {
            if (gameBoard[i][j] === 'T') {
                count++;
            }
        }
    }
    return count;
}

// Function to check game status
function checkGameStatus() {
    if (player.inventory.length === 3) {
        document.getElementById('gameMessages').innerText = 'Victory! All treasures collected!';
        document.getElementById('startAgainButton').style.display = 'inline-block';
        document.getElementById('gameBoard').style.display = 'none'; // Hide the game board
    }
}

// Function to handle player movement based on arrow keys
function handleKeyPress(event) {
    // Prevent default behavior (scrolling)
    event.preventDefault();

    if (event.key === 'ArrowUp') {
        player.move('up');
    } else if (event.key === 'ArrowDown') {
        player.move('down');
    } else if (event.key === 'ArrowLeft') {
        player.move('left');
    } else if (event.key === 'ArrowRight') {
        player.move('right');
    }
}

// Event listener for keypresses
document.addEventListener('keydown', handleKeyPress);

// Function to start a new game
function startNewGame() {
    // Reset player position and inventory
    player.x = 0;
    player.y = 0;
    player.inventory = [];

    // Reinitialize the game board with random positions for treasures and monsters
    gameBoard = generateRandomBoard();

    // Render the board
    renderBoard();

    // Show initial game messages
    document.getElementById('gameMessages').innerText = 'Use the arrow keys to begin your quest!';

    // Reset game status (in case it was ended with a victory or defeat)
    document.getElementById('startAgainButton').style.display = 'none'; // Hide the button initially
    document.getElementById('gameBoard').style.display = 'block'; // Show the game board
}

// Function to generate a new random board
function generateRandomBoard() {
    let newBoard = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
    ];

    // Place treasures
    let treasuresPlaced = 0;
    while (treasuresPlaced < 3) {
        let randRow = Math.floor(Math.random() * 5);
        let randCol = Math.floor(Math.random() * 5);
        if (newBoard[randRow][randCol] === '') {
            newBoard[randRow][randCol] = 'T';
            treasuresPlaced++;
        }
    }

    // Place monsters
    let monstersPlaced = 0;
    while (monstersPlaced < 2) {
        let randRow = Math.floor(Math.random() * 5);
        let randCol = Math.floor(Math.random() * 5);
        if (newBoard[randRow][randCol] === '') {
            newBoard[randRow][randCol] = 'M';
            monstersPlaced++;
        }
    }

    return newBoard;
}

// Initialize the game when the page loads
startNewGame();