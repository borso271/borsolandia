import { Wall } from "./game/classes.js";
import { ImmovableWall } from "./game/classes.js";
//import { drawMaze } from "./game/draw.js";
import { wallcolor } from "./game/colors.js";
import { wallborder } from "./game/colors.js";
import { drawMaze } from "./game/draw.js";



import { pavementcolor } from "./game/colors.js";
import { pavementinner } from "./game/colors.js";



export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");
export let moveCount = 0; // Initialize move counter
export let currentLevel = 1; // Set the initial level
let maze = []; // Will be set based on level data
export let movableWalls = [];
export let player = null; // Will be loaded from level1.json
export let ROWS;
export let COLS; // Will be set dynamically
export let CELL_SIZE = 40;

export let immovableWall; // Store immovable wall instance

export let exitPosition = null; // Global variable to store the exit position
import { level5 } from "./levels/level5.js";
let exitPos;
let playerPos;
export let inset = 1; // Inset for borders
export let borderWidth = 1; // Border width
/* ['up', 'left', 'left', 'left', 'down',
'down', 'down', 'down', 'down', 'down',
'down', 'down', 'down','down', 'right',
'right', 'up', 'up', 'right', 'up' */




function setCanvasResolution() {
    const scale = window.devicePixelRatio; // Get pixel ratio for high-DPI screens
    canvas.width = Math.floor(canvas.width * scale);
    canvas.height = Math.floor(canvas.height * scale);
    ctx.scale(scale, scale); // Scale the drawing context
    drawMaze(); // Redraw to apply scaling
}
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Define max game area size based on the smaller viewport dimension
    const maxGameSize = Math.min(viewportWidth, viewportHeight) * 0.9; // 90% of viewport
    canvas.width = maxGameSize * dpr;
    canvas.height = maxGameSize * dpr;
    canvas.style.width = `${maxGameSize}px`;
    canvas.style.height = `${maxGameSize}px`;

    ctx.scale(dpr, dpr);

    // Set cell size, avoiding subpixel values
    CELL_SIZE = Math.floor(maxGameSize / COLS);
    borderWidth = Math.max(1, Math.floor(CELL_SIZE / 60)); // Ensure border width is at least 1 pixel
    inset = 0; //Math.max(0.5, CELL_SIZE / 60); // Ensure a minimum inset

    ctx.imageSmoothingEnabled = false; // Disable image smoothing

    drawMaze(); // Redraw the maze with updated cell size
}

// Load level function should also set currentLevel if levels change dynamically
async function loadLevel(level) {
    try {
        const data = level;
        
        console.log("Loaded level data:", data);
        
        currentLevel = data.level || 1; // Set level if provided in data
        moveCount = 0; // Reset moves when loading a new level

        maze = initializeMaze(data); // Initialize the maze grid and get ROWS, COLS

        // Set up canvas resizing only after the level data (and dimensions) are loaded
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas(); // Initial call after maze is initialized
    } catch (error) {
        console.error("Error loading level:", error);
    }
    console.log(maze);

    return maze;
}



export function initializeMaze(data) {
    maze = data.grid;
    ROWS = maze.length;
    COLS = maze[0].length;

    exitPos = maze.exit;
    playerPos = maze.PLAYER;

    // Initialize the player separately as `PLAYER`
   // player = new Wall(data.player.coordinates, wallcolor, wallborder, true);
   // movableWalls.push(player); // Keep player in movableWalls for easy movement handling

    // Initialize other movable walls with unique identifiers like W1, W2, etc.
    data.movableWalls.forEach((wallData, index) => {
        const wall = new Wall(wallData.coordinates, wallcolor, wallborder);
        movableWalls.push(wall);

        // Assign a unique identifier for each wall (W1, W2, etc.)
        wall.coordinates.forEach(([y, x]) => {
            maze[y][x] = `W${index}`; // Start from W1, avoiding W0
        });
    });
    movableWalls[0].isPlayer = true;

    // Initialize immovable walls (for example, all cells marked as 'n' in the grid)
    const immovableWallCoordinates = [];
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (maze[y][x] === 'n') {
                immovableWallCoordinates.push([y, x]);
            } else if (maze[y][x] === 'EXIT') {
                exitPosition = [y, x]; // Store the exit position
            }
        }
    }

    // Initialize immovable walls as an instance
    immovableWall = new ImmovableWall(immovableWallCoordinates);
    console.log(maze)
    return maze;
}


// Function to update the move counter in the info panelfunction

function move(direction) {
    let dx = 0, dy = 0;
    if (direction === "ArrowUp") dy = -1;
    else if (direction === "ArrowDown") dy = 1;
    else if (direction === "ArrowLeft") dx = -1;
    else if (direction === "ArrowRight") dx = 1;

    // Check if any movement occurred
    const moved = processWallMovement(dx, dy);
    drawMaze();

    // Increment move counter only if something moved
    if (moved) {
        moveCount++;
    }
}

export function processWallMovement(dx, dy) {
    let unsettledWalls = [...movableWalls];
    let settledWalls = [];
    let iterationLimit = 1000; // Failsafe limit to prevent infinite loop
    let iterationCount = 0;
    let moved = false; // Track if any movement occurs
  

    while (unsettledWalls.length > 0) {
        if (iterationCount++ > iterationLimit) {
            console.error("Failsafe triggered: Infinite loop detected in wall movement.");
            break; // Exit the loop if it exceeds the failsafe limit
        }

        let nextUnsettledWalls = [];

        unsettledWalls.forEach(wall => {
            let canMove = true;

            for (let [wy, wx] of wall.coordinates) {
                let newWy = wy + dy;
                let newWx = wx + dx;

                // Boundary check
                if (newWy < 0 || newWy >= ROWS || newWx < 0 || newWx >= COLS) {
                    wall.blocked = true;
                    settledWalls.push(wall);
                    return;
                }

                // Get the target cell content and check if it’s occupied by another wall
                const targetCellContent = maze[newWy][newWx];
                const targetWallIndex = targetCellContent && targetCellContent.startsWith('W') 
                    ? parseInt(targetCellContent.substring(1))
                    : null;

                // Allow only the player to move onto the EXIT cell
                if (targetCellContent === 'EXIT' && !wall.isPlayer) {
                    wall.blocked = true;
                    settledWalls.push(wall);
                    return;
                } else if (targetCellContent === 'n' || 
                           (targetWallIndex !== null && targetWallIndex !== movableWalls.indexOf(wall) && movableWalls[targetWallIndex].blocked === true)) {
                    
                    // Block movement if it's an immovable wall or a blocked wall
                    wall.blocked = true;
                    settledWalls.push(wall);
                    return;
                } else if (targetWallIndex !== null && targetWallIndex !== movableWalls.indexOf(wall) &&
                           movableWalls[targetWallIndex].blocked === undefined) {
                    // This wall depends on an unresolved wall
                    canMove = false;
                }
            }

            if (canMove) {
                wall.blocked = false;
                settledWalls.push(wall);
            } else {
                nextUnsettledWalls.push(wall); // Add to next iteration of checks
            }
        });

        // If nothing changes in unsettledWalls, break out to avoid an infinite loop
        if (unsettledWalls.length === nextUnsettledWalls.length) {
            console.warn("Unresolved dependencies; some walls could not be moved.");
            break;
        }
        console.log(maze);
        // Update unsettled walls for the next iteration
        unsettledWalls = nextUnsettledWalls;
    }

    // Move all unblocked walls
    settledWalls.forEach(wall => {
        if (!wall.blocked) {
            moved = true;
            wall.coordinates.forEach(([wy, wx]) => maze[wy][wx] = null);
            wall.coordinates = wall.coordinates.map(([wy, wx]) => [wy + dy, wx + dx]);

            wall.coordinates.forEach(([wy, wx]) => {
                // Boundary check before updating maze to avoid errors
                if (wy >= 0 && wy < ROWS && wx >= 0 && wx < COLS) {
                  
                    maze[wy][wx] = `W${movableWalls.indexOf(wall)}`;
                  
                }
            });
        }
        
    });

    // Reset blocked properties for all walls
    movableWalls.forEach(wall => {
        wall.blocked = undefined;
    });

//console.log(maze)
    return moved;
}


// Keyboard listener
document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
       
        move(e.key);
    }
});



let touchStartX = 0;
let touchStartY = 0;

// Listen for touchstart to record the initial touch position
canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

// Listen for touchend to determine the swipe direction
canvas.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Determine if the swipe is horizontal or vertical
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
            move("ArrowRight"); // Swipe right
        } else {
            move("ArrowLeft"); // Swipe left
        }
    } else {
        // Vertical swipe
        if (deltaY > 0) {
            move("ArrowDown"); // Swipe down
        } else {
            move("ArrowUp"); // Swipe up
        }
    }
});

// Load the level and initialize the game

//initializeMaze(data);

// Load the level and initialize the game
loadLevel(level5);
