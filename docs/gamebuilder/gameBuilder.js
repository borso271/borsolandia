// Canvas and grid settings
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const CELL_SIZE = 20;
const ROWS = 13;
const COLS = 13;

// Initialize grid array with "n" at the edges
let grid = Array.from(Array(ROWS), (_, rowIndex) => 
    Array(COLS).fill(null).map((_, colIndex) =>
        rowIndex === 0 || rowIndex === ROWS - 1 || colIndex === 0 || colIndex === COLS - 1 ? "n" : null
    )
);

// State variables
let mode = null; // Current mode for clicking cells
let movableWalls = []; // Array to store wall objects
let wallColors = []; // Array to store the color for each wall
let currentWall = null; // Current wall being created
let player = null; // Object to store player position
let exit = null; // Exit position

// Set up control buttons
document.getElementById("setPlayer").onclick = () => { mode = "player"; };
document.getElementById("setExit").onclick = () => { mode = "exit"; };
document.getElementById("setImmovableWall").onclick = () => { mode = "immovableWall"; };
document.getElementById("createMovableWall").onclick = () => {
    mode = "movableWall";
    currentWall = { coordinates: [], blocked: undefined, dependOn: [] }; // Initialize a new wall object
    movableWalls.push(currentWall); // Add the wall to the list
    wallColors.push(generateRandomColor()); // Assign a random color to this wall
};


document.getElementById("endCreation").onclick = () => {
    const gameData = {
        grid: grid,
        movableWalls: movableWalls,
        player: player,
        exit: exit
    };

    const jsonData = JSON.stringify(gameData, null, 2); // Convert to JSON format with indentation
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a temporary download link
    const a = document.createElement("a");
    a.href = url;
    a.download = "level1.json"; // Name the file as "level1.json"
    document.body.appendChild(a);
    a.click(); // Trigger download
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up the URL object

    console.log("Game data saved as level1.json");
};



// Draw the grid and objects
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (grid[y][x] === "n") {
                ctx.fillStyle = "black";
            } else if (grid[y][x] === "PLAYER") {
                ctx.fillStyle = "blue";
            } else if (grid[y][x] === "EXIT") {
                ctx.fillStyle = "yellow";
            } else {
                ctx.fillStyle = "white";
            }
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }

    // Draw movable walls with their unique colors
    movableWalls.forEach((wall, index) => {
        ctx.fillStyle = wallColors[index]; // Set the color for this wall
        wall.coordinates.forEach(([wy, wx]) => {
            ctx.fillRect(wx * CELL_SIZE, wy * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.strokeRect(wx * CELL_SIZE, wy * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });
    });
}

// Handle canvas clicks to place items on the grid
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (mode === "player") {
        clearPrevious("PLAYER"); // Ensure only one player
        grid[y][x] = "PLAYER";
        player = { coordinates: [[y, x]], blocked: undefined, dependOn: [], player: true }; // Store player as an object
    } else if (mode === "exit") {
        clearPrevious("EXIT"); // Ensure only one exit
        grid[y][x] = "EXIT";
        exit = [y, x]; // Store exit position
    } else if (mode === "immovableWall") {
        grid[y][x] = "n";
    } else if (mode === "movableWall" && currentWall) {
        currentWall.coordinates.push([y, x]); // Add the cell to the current wall's coordinates
        grid[y][x] = `W${movableWalls.indexOf(currentWall)}`; // Mark the cell in the grid with the wall's index
    }

    drawGrid();
});

// Clear previous instances of a specific type on the grid
function clearPrevious(type) {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (grid[y][x] === type) grid[y][x] = null;
        }
    }
}

// Generate a random color in hex format
function generateRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// Initial grid drawing with immovable walls at the edges
drawGrid();

