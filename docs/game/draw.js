
import { ctx } from "../game.js";
import { canvas } from "../game.js";
import { ROWS } from "../game.js";
import { COLS } from "../game.js";
import { pavementcolor } from "./colors.js";
import { pavementinner } from "./colors.js";
import { immovableWall } from "../game.js";
import { CELL_SIZE } from "../game.js";
import { exitPosition } from "../game.js";
import { movableWalls } from "../game.js";
import { moveCount } from "../game.js";
import { currentLevel } from "../game.js";
import { immovableborder } from "./colors.js";
import { exitcolor } from "./colors.js";
import { wallcolor } from "./colors.js";
function displayLevelAndMoves2() {
    const yPos = (ROWS - 1) * CELL_SIZE; // Y-position for the bottom row

    // Render the entire bottom row as part of the immovable walls
    for (let x = 0; x < COLS; x++) {
        const xPos = x * CELL_SIZE;
        immovableWall.renderSingleCell(ctx, x, ROWS - 1); // Render each cell in the bottom row
    }

    // Set the retro font style for displaying text
    ctx.fillStyle = immovableborder; // Neon green for text
    ctx.font = `${CELL_SIZE * 0.5}px 'Press Start 2P'`; // Use the retro font
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Display level in the bottom-left cell
    ctx.fillText(currentLevel, CELL_SIZE / 2, yPos + CELL_SIZE / 2);

    // Display each digit of the move count in its own cell on the bottom right
    const movesStartXPos = (COLS - 1) * CELL_SIZE; // Start at the bottom-right cell
    const moveDigits = moveCount.toString().split("").reverse(); // Reverse for right-to-left alignment
    moveDigits.forEach((digit, index) => {
        const xPos = movesStartXPos - index * CELL_SIZE;
        ctx.fillStyle = immovableborder; // Bright red for moves text
        ctx.fillText(digit, xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2);
    });
}

function displayLevelAndMoves() {
    const bottomRowYPos = (ROWS - 1) * CELL_SIZE; // Y-position for the bottom row
    const topRowYPos = 0; // Y-position for the top row

    // Render the entire bottom row as part of the immovable walls
    for (let x = 0; x < COLS; x++) {
        const xPos = x * CELL_SIZE;
        immovableWall.renderSingleCell(ctx, x, ROWS - 1); // Render each cell in the bottom row
        immovableWall.renderSingleCell(ctx, x, 0); // Render each cell in the top row
    }

    // Center the symbols in the top row
    const symbols = ["動", "く", "壁", "た", "ち"]; // Japanese symbols for "moving walls"
    const symbolStartX = Math.floor((COLS - symbols.length) / 2); // Center symbols

    // Set style for symbols and display them
    ctx.fillStyle = immovableborder; // Color for symbols
    ctx.font = `${CELL_SIZE * 0.5}px 'Noto Sans JP', sans-serif`; // Adjusted multiplier
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    symbols.forEach((symbol, index) => {
        const xPos = (symbolStartX + index) * CELL_SIZE + CELL_SIZE / 2;
        ctx.fillText(symbol, xPos, topRowYPos + CELL_SIZE / 2);
    });

    // Display level in the bottom-left cell on the bottom row
    ctx.fillText(currentLevel, CELL_SIZE / 2, bottomRowYPos + CELL_SIZE / 2);

    // Display each digit of the move count in its own cell on the bottom right
    const movesStartXPos = (COLS - 1) * CELL_SIZE; // Start at the bottom-right cell
    const moveDigits = moveCount.toString().split("").reverse(); // Reverse for right-to-left alignment
    moveDigits.forEach((digit, index) => {
        const xPos = movesStartXPos - index * CELL_SIZE;
        ctx.fillStyle = immovableborder; // Neon color for moves text
        ctx.fillText(digit, xPos + CELL_SIZE / 2, bottomRowYPos + CELL_SIZE / 2);
    });
}




export function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
// Draw the base pavement layer for all cells
for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
        const xPos = x * CELL_SIZE;
        const yPos = y * CELL_SIZE;

        // Set pavement style: dark with a small dot in the center
        ctx.fillStyle = pavementcolor; // Dark pavement background
        ctx.fillRect(xPos, yPos, CELL_SIZE, CELL_SIZE);

        // Check if this cell is the exit
        if (x !== exitPosition[1] || y !== exitPosition[0]) { 
            // Draw the central dot only if it's not the exit
            ctx.fillStyle = pavementinner; // Slightly lighter dot color
            ctx.beginPath();
            ctx.arc(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE * 0.05, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

    // Render immovable walls from the pre-initialized instance
    immovableWall.render(ctx);

    // Render the exit
    if (exitPosition) {
        const [exitY, exitX] = exitPosition;
        const xPos = exitX * CELL_SIZE;
        const yPos = exitY * CELL_SIZE;

          // Draw exit with a radiant violet-pink diamond symbol
          ctx.fillStyle = exitcolor; // Bright violet-pink for the diamond
          ctx.font = `${CELL_SIZE * 0.7}px Arial`; // Font size relative to cell size
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
      
          // Draw glow effect by creating a shadow
          ctx.shadowColor = exitcolor; // Lighter pink for the glow
          ctx.shadowBlur = 1; // Adjust for the level of glow effect
      
          // Draw the diamond symbol
          ctx.fillText("✕", xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 1.7);
      
          // Reset shadow settings for other elements
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
    }

    // Render movable walls and player
    movableWalls.forEach(wall => wall.render(ctx));

    // Display level and moves in the bottom row
    displayLevelAndMoves();
}
