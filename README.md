# Monster Mayhem

Monster Mayhem is a strategic web-based board game where two players take turns placing and moving monsters on a 10x10 grid. The objective is to eliminate the opponent's monsters based on specific rules. The game is built using HTML, CSS, and JavaScript, with Node.js and Express to serve the application.

## Game Rules according to Sam's CA descriptor

- **Players**: Two players
- **Monsters**: Each player can place a Vampire, Ghost, or Werewolf on their respective edges of the grid.
  - Vampire (V)
  - Ghost (G)
  - Werewolf (W)
- **Turns**: Players take turns placing and moving monsters on the grid.
  - Players take turns based on the number of monsters they have on the grid, with the player having fewer monsters going first.
  - In case of a tie, the first player is chosen randomly.
- **Movement**: Monsters can move any number of squares horizontally or vertically, or up to two squares diagonally.
  - Monsters cannot move over other players' monsters but can move over their own.
- **Conflicts**: When monsters meet on the same square, the following rules apply:
  - Vampire defeats Werewolf
  - Werewolf defeats Ghost
  - Ghost defeats Vampire
  - If two of the same type meet, both are removed.
- **Winning Condition**: A player is eliminated if they lose 10 monsters. The game ends when only one player remains.

## Installation

1. **Ensure you have Node.js and npm installed**
   - You can download and install Node.js from [nodejs.org](https://nodejs.org/).
   - npm (Node Package Manager) is included with Node.js.
   
   ## Leonardo Oliveira - 2021361