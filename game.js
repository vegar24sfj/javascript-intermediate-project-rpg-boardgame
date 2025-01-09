let player = {
    x: 0, // Starting position (row)
    y: 0, // Starting position (column)
    health: 100,
    inventory: [],
    move: function (direction) {
        if (gameOver) return; // Prevent movement if the game is over

        let newX = this.x;
        let newY = this.y;

        // Handle movement based on direction
        if (direction === 'up' && this.x > 0) newX--;
        if (direction === 'down' && this.x < 4) newX++;
        if (direction === 'left' && this.y > 0) newY--;
        if (direction === 'right' && this.y < 4) newY++;

        // Handle different types of cells (treasure, monster, door)
        if (gameBoard[newX][newY] === 'T') {
            this.collectTreasure(newX, newY);
        } else if (gameBoard[newX][newY].startsWith('M:')) {
            this.fightMonster(newX, newY);
            return;
        } else if (gameBoard[newX][newY] === 'D') {
            this.exitDoor();
            return;
        }

        this.x = newX;
        this.y = newY;

        renderBoard();
        updateGameMessages();
    },
    collectTreasure: function (x, y) {
        this.inventory.push('Treasure');
        gameBoard[x][y] = ''; // Remove treasure from board

        // Update game messages
        const remainingTreasures = countRemainingTreasures();
        document.getElementById('gameMessages').innerText = `Treasure collected! Treasures left: ${remainingTreasures}`;
        updatePlayerStats();
        checkGameStatus();
    },
    fightMonster: function (x, y) {
        if (gameOver) return;

        let monsterHealth = parseInt(gameBoard[x][y].split(':')[1]); // Get monster health

        monsterHealth -= 45; // Deal 45 damage to the monster

        if (monsterHealth <= 0) {
            gameBoard[x][y] = ''; // Monster defeated, remove from board
            document.getElementById('gameMessages').innerText = 'You defeated the monster!';
        } else {
            gameBoard[x][y] = `M:${monsterHealth}`; // Update monster health
            document.getElementById('gameMessages').innerText = `You dealt 45 damage to the monster! Monster health left: ${monsterHealth}`;
        }

        this.health -= 25; // Decrease player health

        if (this.health <= 0) {
            this.health = 0;
            document.getElementById('gameMessages').innerText = 'Game Over! You were defeated by the monster.';
            document.getElementById('startAgainButton').style.display = 'inline-block';
            document.getElementById('gameBoard').style.display = 'none';
            gameOver = true;
            updatePlayerStats();
        } else {
            updatePlayerStats();
        }
    },
    exitDoor: function () {
        if (gameOver) return;

        // Check if all treasures have been collected
        const remainingTreasures = countRemainingTreasures();
        if (remainingTreasures === 0) {
            document.getElementById('gameMessages').innerText = 'Victory! All treasures collected!';
            document.getElementById('startAgainButton').style.display = 'inline-block';
            document.getElementById('gameBoard').style.display = 'none';
            gameOver = true;
        } else {
            document.getElementById('gameMessages').innerText = `You must collect all treasures before exiting the door! Remaining treasures: ${remainingTreasures}`;
        }
    }
};

let gameOver = false;

// Generate a random board with treasures and monsters
function generateRandomBoard() {
    let newBoard = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
    ];

    let availableCells = [];
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            availableCells.push({ x: i, y: j });
        }
    }

    function pickRandomCell() {
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        return availableCells.splice(randomIndex, 1)[0];
    }

    let treasuresToPlace = Math.floor(Math.random() * 2) + 2; // Randomly place 2 or 3 treasures
    let treasuresPlaced = 0;
    while (treasuresPlaced < treasuresToPlace) {
        let cell = pickRandomCell();
        newBoard[cell.x][cell.y] = 'T';
        treasuresPlaced++;
    }

    let monstersPlaced = 0;
    while (monstersPlaced < 2) {
        let cell = pickRandomCell();
        newBoard[cell.x][cell.y] = 'M:80'; // Monsters have 80 health
        monstersPlaced++;
    }

    newBoard[4][4] = 'D'; // The exit door is placed at (4, 4)

    return newBoard;
}

// Render the game board
function renderBoard() {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = ''; // Clear the existing board

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
            } else if (gameBoard[i][j].startsWith('M:')) {
                let monsterHealth = gameBoard[i][j].split(':')[1];
                cell.classList.add('monster');
                cell.innerText = `M:${monsterHealth}`;
            } else if (gameBoard[i][j] === 'D') {
                cell.classList.add('door');
                cell.innerText = 'D';
            }
            row.appendChild(cell);
        }
        boardElement.appendChild(row);
    }
}

// Update the player stats (health, inventory)
function updatePlayerStats() {
    const playerStats = document.getElementById('playerStats');
    playerStats.innerHTML =
        `<p>Health: ${player.health}</p>
        <p>Inventory: ${player.inventory.length} item(s)</p>`;
}

// Update the game messages (treasure collected, etc.)
function updateGameMessages() {
    const gameMessages = document.getElementById('gameMessages');
    const remainingTreasures = countRemainingTreasures();
    if (player.inventory.length > 0 && gameBoard[player.x][player.y] === '') {
        gameMessages.innerText = `Treasure collected! Treasures left: ${remainingTreasures}`;
    }
    checkGameStatus();
}

// Count the remaining treasures on the board
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

// Count how many treasures need to be collected to win
function countTreasuresToWin() {
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

// Check if the player has won or is able to exit the door
function checkGameStatus() {
    const remainingTreasures = countRemainingTreasures();

    // Check for victory if all treasures are collected and the player is at the door
    if (remainingTreasures === 0 && gameBoard[player.x][player.y] === 'D') {
        document.getElementById('gameMessages').innerText = 'Victory! All treasures collected!';
        document.getElementById('startAgainButton').style.display = 'inline-block';
        document.getElementById('gameBoard').style.display = 'none';
        gameOver = true;
    }
}

// Handle player movement based on arrow keys
function handleKeyPress(event) {
    if (gameOver) return; // Don't handle key presses if the game is over

    event.preventDefault();
    if (event.key === 'ArrowUp') player.move('up');
    if (event.key === 'ArrowDown') player.move('down');
    if (event.key === 'ArrowLeft') player.move('left');
    if (event.key === 'ArrowRight') player.move('right');
}

// Function to start a new game
function startNewGame() {
    // Reset player position and inventory
    player.x = 0;
    player.y = 0;
    player.inventory = [];
    player.health = 100;

    // Generate a new game board with random treasures and monsters
    gameBoard = generateRandomBoard();

    // Render the board and update player stats
    renderBoard();
    updatePlayerStats();

    // Display the initial game message
    document.getElementById('gameMessages').innerText = 'Use the arrow keys to begin your quest!';

    // Reset game over status
    gameOver = false;
    document.getElementById('startAgainButton').style.display = 'none'; // Hide the Start Again button
    document.getElementById('gameBoard').style.display = 'block'; // Show the game board
}

// Event listener for key presses
document.addEventListener('keydown', handleKeyPress);

// Initialize the game board and start the game when the page loads
let gameBoard = generateRandomBoard();
startNewGame();
