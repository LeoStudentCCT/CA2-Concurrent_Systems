let activeGame = null; // Variable to hold the current game instance
let matchCount = 0; // Variable to keep track of the number of matches played
let playerStats = {
    player1: { victories: 0, defeats: 0 },
    player2: { victories: 0, defeats: 0 }
};

// Function to start a new game and notify the server
function initiateNewGame() {
    activeGame = new Battle();
    activeGame.initialize();
    matchCount++;
    refreshGameSummary();
}

// Function to end the current game
function concludeCurrentGame() {
    if (activeGame) {
        activeGame.finishGame();
    }
}

// Battle class to manage the game logic
class Battle {
    constructor() {
        this.gridDimension = 10;
        this.grid = [];
        this.participants = ["player1", "player2"];
        this.activeTurnIndex = 0;
        this.monsters = {
            player1: [],
            player2: []
        };
        this.removedMonsters = {
            player1: 0,
            player2: 0
        };
        this.turnFinished = false;
        this.newMonsterPlaced = false;
    }

    // Initialize the game
    initialize() {
        this.buildGrid();
        this.showPlayerDetails();
        this.setInitialTurnOrder();
    }

    // Build the grid with row and column labels
    buildGrid() {
        const battleGrid = document.getElementById('battle-grid');
        battleGrid.innerHTML = '';
        // Create column labels
        for (let col = 0; col <= this.gridDimension; col++) {
            const colLabel = document.createElement('div');
            colLabel.className = 'col-label';
            colLabel.innerText = col > 0 ? col - 1 : '';
            battleGrid.appendChild(colLabel);
        }
        // Create grid with row labels
        for (let row = 0; row < this.gridDimension; row++) {
            // Create row label
            const rowLabel = document.createElement('div');
            rowLabel.className = 'row-label';
            rowLabel.innerText = row;
            battleGrid.appendChild(rowLabel);
            for (let col = 0; col < this.gridDimension; col++) {
                const cell = document.createElement('div');
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.onclick = () => this.handleGridCellClick(row, col);
                battleGrid.appendChild(cell);
            }
        }
        // Initialize the grid array
        this.grid = Array.from({ length: this.gridDimension }, () => Array(this.gridDimension).fill(null));
    }

    // Show player details (number of monsters and whose turn it is)
    showPlayerDetails() {
        const playerDetails = document.getElementById('player-details');
        playerDetails.innerHTML = `
            Player 1 Monsters: ${this.monsters.player1.length}<br>
            Player 2 Monsters: ${this.monsters.player2.length}<br>
            Active Turn: ${this.participants[this.activeTurnIndex]}
        `;
    }

    // Handle clicks on the grid cells
    handleGridCellClick(row, col) {
        if (this.turnFinished) return;
        const activePlayer = this.participants[this.activeTurnIndex];
        if (!this.newMonsterPlaced && this.isPlayerEdge(row, col, activePlayer)) {
            const monsterType = this.promptMonsterTypeFromPlayer();
            if (monsterType) {
                this.placeMonster(row, col, activePlayer, monsterType);
                this.newMonsterPlaced = true;
            }
        } else if (this.grid[row][col] && this.grid[row][col].player === activePlayer && !this.grid[row][col].hasMoved) {
            this.moveMonster(row, col, activePlayer);
        }
        this.showPlayerDetails();
    }

    // Check if the cell is on the player's edge of the grid
    isPlayerEdge(row, col, player) {
        if (player === "player1" && row === 0) return true;
        if (player === "player2" && row === this.gridDimension - 1) return true;
        return false;
    }

    // Prompt the player to enter the type of monster
    promptMonsterTypeFromPlayer() {
        const monsterType = prompt("Choose your beast (V for thirsty Vampire, G for holy Ghost, W for dirty Werewolf):");
        if (["V", "W", "G"].includes(monsterType)) {
            return monsterType;
        } else {
            alert("NAH! Wrong beast type!");
            return null;
        }
    }

    // Place a monster on the grid
    placeMonster(row, col, player, monsterType) {
        const monster = { type: monsterType, row, col, player, hasMoved: false };
        if (this.grid[row][col] && this.grid[row][col].player !== player) {
            this.resolveConflict(monster, this.grid[row][col]);
        } else {
            this.grid[row][col] = monster;
            this.monsters[player].push(monster);
        }
        this.renderGrid();
    }

    // Move a monster to a new position
    moveMonster(row, col, player) {
        const monster = this.grid[row][col];
        if (monster && monster.player === player && !monster.hasMoved) {
            const newRow = prompt("What's the row number to move monster to:");
            const newCol = prompt("What's the column number to move to:");
            if (this.isValidMove(row, col, newRow, newCol, player)) {
                this.grid[row][col] = null;
                monster.row = parseInt(newRow);
                monster.col = parseInt(newCol);
                monster.hasMoved = true;
                if (this.grid[newRow][newCol] && this.grid[newRow][newCol].player !== player) {
                    this.resolveConflict(monster, this.grid[newRow][newCol]);
                } else {
                    this.grid[newRow][newCol] = monster;
                }
                this.renderGrid();
            } else {
                alert("BOO! Wrong move! Are you scare? Try again!");
            }
        }
    }

    // Check if the move is valid
    isValidMove(oldRow, oldCol, newRow, newCol, player) {
        newRow = parseInt(newRow);
        newCol = parseInt(newCol);
        if (newRow < 0 || newRow >= this.gridDimension || newCol < 0 || newCol >= this.gridDimension) return false;
        const dRow = Math.abs(newRow - oldRow);
        const dCol = Math.abs(newCol - oldCol);
        return (dRow === 0 || dCol === 0 || (dRow === dCol && dRow <= 2)) && this.isPathFree(oldRow, oldCol, newRow, newCol, player);
    }

    // Check if the path is free for the monster to move
    isPathFree(oldRow, oldCol, newRow, newCol, player) {
        const stepRow = Math.sign(newRow - oldRow);
        const stepCol = Math.sign(newCol - oldCol);
        let row = oldRow + stepRow;
        let col = oldCol + stepCol;
        while (row !== newRow || col !== newCol) {
            if (this.grid[row][col] && this.grid[row][col].player !== player) return false;
            row += stepRow;
            col += stepCol;
        }
        return true;
    }

    // Render the monster on the grid
    renderMonster(monster) {
        const cell = document.querySelector(`[data-row='${monster.row}'][data-col='${monster.col}']`);
        cell.innerText = monster.type;
        cell.style.color = monster.player === "player1" ? "red" : "green";
    }

    // Render the entire grid
    renderGrid() {
        for (let i = 0; i < this.gridDimension; i++) {
            for (let j = 0; j < this.gridDimension; j++) {
                const cell = document.querySelector(`[data-row='${i}'][data-col='${j}']`);
                const monster = this.grid[i][j];
                cell.innerText = monster ? monster.type : '';
                cell.style.color = monster ? (monster.player === "player1" ? "red" : "green") : '';
            }
        }
    }

    // Set the initial turn order based on the number of monsters
    setInitialTurnOrder() {
        const monsterCounts = this.participants.map(player => this.monsters[player].length);
        const minCount = Math.min(...monsterCounts);
        const candidates = this.participants.filter((player, index) => monsterCounts[index] === minCount);

        if (candidates.length === 1) {
            this.activeTurnIndex = this.participants.indexOf(candidates[0]);
        } else {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            this.activeTurnIndex = this.participants.indexOf(candidates[randomIndex]);
        }
    }

    // Switch to the next player
    switchPlayer() {
        this.resetMonsterMoves();
        this.newMonsterPlaced = false;
        this.activeTurnIndex = this.nextPlayerIndex();
        if (this.activeTurnIndex === -1) {
            this.finishRound();
        }
    }

    // Reset the hasMoved flag for all monsters
    resetMonsterMoves() {
        this.participants.forEach(player => {
            this.monsters[player].forEach(monster => {
                monster.hasMoved = false;
            });
        });
    }

    // Determine the next player's index
    nextPlayerIndex() {
        const monsterCounts = this.participants.map(player => this.monsters[player].length);
        const minCount = Math.min(...monsterCounts);
        const candidates = this.participants.filter((player, index) => monsterCounts[index] === minCount);

        if (candidates.length === 1) {
            return this.participants.indexOf(candidates[0]);
        } else {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            return this.participants.indexOf(candidates[randomIndex]);
        }
    }

    // End the current player's turn
    finishTurn() {
        this.turnFinished = true;
        this.switchPlayer();
        this.turnFinished = false;
    }

    // End the round after all players have taken their turns
    finishRound() {
        alert("Oh NO, the Sun is rising! The round ended. All players have taken their turns.");
        this.activeTurnIndex = 0;
        this.switchPlayer();
    }

    // Resolve conflicts between monsters based on the rules
    resolveConflict(attacker, defender) {
        const result = this.conflictOutcome(attacker, defender);
        if (result === 1) {
            this.removeMonster(defender);
            this.grid[attacker.row][attacker.col] = attacker; // Ensure the attacker remains in the cell
        } else if (result === -1) {
            this.removeMonster(attacker);
            this.grid[defender.row][defender.col] = defender; // Ensure the defender remains in the cell
        } else if (result === 0) {
            this.removeMonster(attacker);
            this.removeMonster(defender);
        }
        this.renderGrid();
    }

    // Determine the outcome of a conflict between two monsters
    conflictOutcome(monster1, monster2) {
        const rules = {
            V: { W: 1, G: -1, V: 0 },
            W: { V: -1, G: 1, W: 0 },
            G: { V: 1, W: -1, G: 0 }
        };
        return rules[monster1.type][monster2.type];
    }

    // Remove a monster from the grid
    removeMonster(monster) {
        const { row, col, player } = monster;
        this.grid[row][col] = null;
        this.monsters[player] = this.monsters[player].filter(m => m !== monster);
        this.removedMonsters[player]++;
        this.verifyElimination();
    }

    // Check if a player has been eliminated
    verifyElimination() {
        const players = Object.keys(this.removedMonsters);
        players.forEach(player => {
            if (this.removedMonsters[player] >= 10) {
                this.finishGame(this.participants.find(p => p !== player));
            }
        });
    }

    // End the game and declare a winner
    finishGame(winningPlayer) {
        if (!winningPlayer) {
            winningPlayer = this.participants.find(p => p !== this.participants[this.activeTurnIndex]);
        }
        alert(`${winningPlayer} wins!`);
        playerStats[winningPlayer].victories++;
        playerStats[this.participants.find(p => p !== winningPlayer)].defeats++;
        refreshGameSummary();
        activeGame = null; 
    }
}

// Update the game summary display
function refreshGameSummary() {
    const gameSummary = document.getElementById('game-summary');
    gameSummary.innerHTML = `
        Matches Played: ${matchCount}<br>
        Player 1 - Victories: ${playerStats.player1.victories}, losses: ${playerStats.player1.defeats}<br>
        Player 2 - Victories: ${playerStats.player2.victories}, Losses: ${playerStats.player2.defeats}
    `;
}

// Initial refresh of the game summary
refreshGameSummary();
