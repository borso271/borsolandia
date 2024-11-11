import { immovablecolor } from "./colors.js";
import { immovableborder } from "./colors.js";
import { wallcolor } from "./colors.js";
import { wallborder } from "./colors.js";
import { CELL_SIZE } from "../game.js";
import { borderWidth } from "../game.js";
import { inset } from "../game.js";
import { playercolor } from "./colors.js";
export class ImmovableWall {
    constructor(coordinates, color = immovablecolor, borderColor = immovableborder) {
        this.coordinates = coordinates; // Array of [y, x] pairs for immovable wall cells
        this.color = color;
        this.borderColor = borderColor;
    }

    // Check if a neighboring cell is part of the same immovable wall
    isSameWall(y, x, wy, wx) {
        return this.coordinates.some(([cy, cx]) => cy === y + wy && cx === x + wx);
    }

    // Determine the wall cell state based on neighboring cells
    getWallCellState(y, x) {
        const top = this.isSameWall(y, x, -1, 0) ? 1 : 0;
        const right = this.isSameWall(y, x, 0, 1) ? 1 : 0;
        const bottom = this.isSameWall(y, x, 1, 0) ? 1 : 0;
        const left = this.isSameWall(y, x, 0, -1) ? 1 : 0;
        return (top << 3) | (right << 2) | (bottom << 1) | left;
    }


    drawBorders(ctx, xPos, yPos, state, inset, borderWidth) {
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = borderWidth;
        ctx.setLineDash([5, 3]); // Dashed pattern for immovable walls

        ctx.beginPath();
        if (!(state & 0b1000)) { // No top neighbor
            ctx.moveTo(xPos + inset, yPos + inset);
            ctx.lineTo(xPos + CELL_SIZE - inset, yPos + inset);
        }
        if (!(state & 0b0100)) { // No right neighbor
            ctx.moveTo(xPos + CELL_SIZE - inset, yPos + inset);
            ctx.lineTo(xPos + CELL_SIZE - inset, yPos + CELL_SIZE - inset);
        }
        if (!(state & 0b0010)) { // No bottom neighbor
            ctx.moveTo(xPos + CELL_SIZE - inset, yPos + CELL_SIZE - inset);
            ctx.lineTo(xPos + inset, yPos + CELL_SIZE - inset);
        }
        if (!(state & 0b0001)) { // No left neighbor
            ctx.moveTo(xPos + inset, yPos + CELL_SIZE - inset);
            ctx.lineTo(xPos + inset, yPos + inset);
        }
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash for other elements
    }

    render(ctx) {
        

        this.coordinates.forEach(([y, x]) => {
            const state = this.getWallCellState(y, x);
            const xPos = x * CELL_SIZE;
            const yPos = y * CELL_SIZE;

            // Fill the cell with the wall color
            ctx.fillStyle = this.color;
            ctx.fillRect(xPos, yPos, CELL_SIZE, CELL_SIZE);

            // Call the drawBorders helper to render the borders based on neighbors
            this.drawBorders(ctx, xPos, yPos, state, inset, borderWidth);
        });
    }

    renderSingleCell(ctx, x, y) {
        const state = this.getWallCellState(y, x);
        const xPos = x * CELL_SIZE;
        const yPos = y * CELL_SIZE;
       // const inset = 1;
       // const borderWidth = 1;

        // Fill the cell with the wall color
        ctx.fillStyle = this.color;
        ctx.fillRect(xPos, yPos, CELL_SIZE, CELL_SIZE);

        // Call the drawBorders helper to render the borders based on neighbors
        this.drawBorders(ctx, xPos, yPos, state, inset, borderWidth);
    }
}


export class Wall {
    constructor(coordinates, color = wallcolor, borderColor = wallborder, isPlayer = false) {
        this.coordinates = coordinates;
        this.color = color; // Bright green for walls
        this.borderColor = borderColor; // Neon cyan border
        this.isPlayer = isPlayer;
        this.blocked = undefined;
    }

    // Check if neighboring cell is part of the same wall
    isSameWall(y, x, wy, wx) {
        return this.coordinates.some(([cy, cx]) => cy === y + wy && cx === x + wx);
    }

    // Determine the wall cell state based on neighboring cells
    getWallCellState(y, x) {
        const top = this.isSameWall(y, x, -1, 0) ? 1 : 0;
        const right = this.isSameWall(y, x, 0, 1) ? 1 : 0;
        const bottom = this.isSameWall(y, x, 1, 0) ? 1 : 0;
        const left = this.isSameWall(y, x, 0, -1) ? 1 : 0;
        return (top << 3) | (right << 2) | (bottom << 1) | left;
    }

    render(ctx) {
        //const inset = 1; // Inset for borders
       // const borderWidth = 1; // Border width

        this.coordinates.forEach(([y, x]) => {
            const state = this.getWallCellState(y, x);
            const xPos = x * CELL_SIZE;
            const yPos = y * CELL_SIZE;

            if (this.isPlayer) {
                // Style the player as a radiant electric blue double circle
                ctx.fillStyle = playercolor; // Electric blue for inner circle
                ctx.strokeStyle = playercolor; // Slightly lighter blue for outer stroke
                ctx.lineWidth = 2;

                // Outer glow effect
                ctx.shadowColor = playercolor; // Glow color
                ctx.shadowBlur = 10; // Intensity of the glow


                // Draw inner circle
                ctx.beginPath();
                ctx.arc(xPos + CELL_SIZE / 2, yPos + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
                ctx.fill();

                // Reset shadow for other elements
                ctx.shadowColor = "transparent";
                ctx.shadowBlur = 0;
            } else {
            // Fill the cell
            ctx.fillStyle = this.color;
            ctx.fillRect(xPos, yPos, CELL_SIZE, CELL_SIZE);

            // Set border color and width
            ctx.strokeStyle = this.isPlayer ? "#ff0" : this.borderColor;
            //ctx.setLineDash([5, 3]); // Dashed pattern for immovable walls
            ctx.lineWidth = borderWidth;

            // Draw individual borders based on state within the cell boundaries
            ctx.beginPath();
            if (!(state & 0b1000)) { // No top neighbor
                ctx.moveTo(xPos + inset, yPos + inset);
                ctx.lineTo(xPos + CELL_SIZE - inset, yPos + inset);
            }
            if (!(state & 0b0100)) { // No right neighbor
                ctx.moveTo(xPos + CELL_SIZE - inset, yPos + inset);
                ctx.lineTo(xPos + CELL_SIZE - inset, yPos + CELL_SIZE - inset);
            }
            if (!(state & 0b0010)) { // No bottom neighbor
                ctx.moveTo(xPos + CELL_SIZE - inset, yPos + CELL_SIZE - inset);
                ctx.lineTo(xPos + inset, yPos + CELL_SIZE - inset);
            }
            if (!(state & 0b0001)) { // No left neighbor
                ctx.moveTo(xPos + inset, yPos + CELL_SIZE - inset);
                ctx.lineTo(xPos + inset, yPos + inset);
            }
            ctx.stroke();}
        });
    }
}