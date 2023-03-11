/* Model will hold the data for the array of colors
 * and run the algorithms for painting cells and filling.
 */

class Model {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];
        this.colorAll('#ffffff');
        this.listeners = [];
<<<<<<< HEAD
        this.last = 0;
=======
        this.last = null;
>>>>>>> 8296ac15860ce458c7b43d0c5983df759f4d0b1b
        this.changes = [];
    }

    // Send back the data
    getData() {
        return this.data;
    }

    getChanges() {
        return this.changes;
    }

    clearChanges() {
        this.changes = [];
    }

    // Getters and setters for the 'last' property
    getLast() {
        return this.last;
    }
    
    setLast(last) {
        this.last = last;
    }

    // Given new data, update the model's
    updateData(new_data) {
        this.data = new_data;
    }

    updateFromChanges(changes) {
        changes.forEach(change => {
            this.data[change.cell_num] = change.color;
        });
    }

    // Handle painting a cell
    // Larger brush sizes will recursively call this
    colorCell(cell_num, color, size=1) {
        // OOB?
        if (cell_num < 0 || cell_num > this.data.length) {
            return;
        }
        
        this.data[cell_num] = color;
        this.changes.push({ cell_num: cell_num, color: color });

        // Recursivel color around the cell
        // Also obey the boundaries of the box
        if (size <= 1) {
            return;
        } else {
            if (cell_num % this.cols !== this.cols-1) {
                this.colorCell(cell_num+1, color, size-1);
            }

            if (cell_num % this.cols !== 0) {
                this.colorCell(cell_num-1, color, size-1);
            }

            this.colorCell(cell_num+this.cols, color, size-1);
            this.colorCell(cell_num-this.cols, color, size-1);
        }
    }

    // Reset the array
    colorAll(color) {
        this.data = Array(this.rows*this.cols).fill(color);
    }

    // Calls the floodfill alg
    fill(cell_num, color) {
        this.floodFill(cell_num, this.data[cell_num], color);
    }
    
    // Colors in a line from point A to point B using Bresenham's line algorithm
    // from https://jstutorial.medium.com/how-to-code-your-first-algorithm-draw-a-line-ca121f9a1395
    line = (a, b, color, size=1) => {
        if (a === null) a = b;
        else if (b === null) return;

        let y1 = Math.floor(a / this.cols);
        let x1 = a % this.cols;
        let y2 = Math.floor(b / this.cols);
        let x2 = b % this.cols;

        // Iterators, counters required by algorithm
        let x, y, dx, dy, dx1, dy1, px, py, xe, ye, i;
        // Calculate line deltas
        dx = x2 - x1;
        dy = y2 - y1;
        // Create a positive copy of deltas (makes iterating easier)
        dx1 = Math.abs(dx);
        dy1 = Math.abs(dy);
        // Calculate error intervals for both axis
        px = 2 * dy1 - dx1;
        py = 2 * dx1 - dy1;
        // The line is X-axis dominant
        if (dy1 <= dx1) {
            // Line is drawn left to right
            if (dx >= 0) {
                x = x1; y = y1; xe = x2;
            } else { // Line is drawn right to left (swap ends)
                x = x2; y = y2; xe = x1;
            }
            this.colorCell(x + y * this.cols, color, size);
            // Rasterize the line
            for (i = 0; x < xe; i++) {
                x = x + 1;
                // Deal with octants...
                if (px < 0) {
                    px = px + 2 * dy1;
                } else {
                    if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                        y = y + 1;
                    } else {
                        y = y - 1;
                    }
                    px = px + 2 * (dy1 - dx1);
                }
                // Draw pixel from line span at
                // currently rasterized position
                this.colorCell(x + y * this.cols, color, size);
            }
        } else { // The line is Y-axis dominant
            // Line is drawn bottom to top
            if (dy >= 0) {
                x = x1; y = y1; ye = y2;
            } else { // Line is drawn top to bottom
                x = x2; y = y2; ye = y1;
            }
            this.colorCell(x + y * this.cols, color, size);
            // Rasterize the line
            for (i = 0; y < ye; i++) {
                y = y + 1;
                // Deal with octants...
                if (py <= 0) {
                    py = py + 2 * dx1;
                } else {
                    if ((dx < 0 && dy<0) || (dx > 0 && dy > 0)) {
                        x = x + 1;
                    } else {
                        x = x - 1;
                    }
                    py = py + 2 * (dx1 - dy1);
                }
                // Draw pixel from line span at
                // currently rasterized position
                this.colorCell(x + y * this.cols, color, size);
            }
        }
    }

    // Flood fill algorithm
    // Also obey the boundaries of the box
    floodFill(cell_num, old_color, new_color) {
        if (cell_num < 0 || cell_num > this.data.length) {
            return;
        }
        
        if (this.data[cell_num] != old_color || this.data[cell_num] == new_color) {
            return;
        }

        this.data[cell_num] = new_color;
        this.changes.push({ cell_num: cell_num, color: new_color });

        if (cell_num % this.cols !== this.cols-1) {
            this.floodFill(cell_num+1, old_color, new_color);
        }
        
        if (cell_num % this.cols !== 0) {
            this.floodFill(cell_num-1, old_color, new_color);
        }
        this.floodFill(cell_num+this.cols, old_color, new_color);
        this.floodFill(cell_num-this.cols, old_color, new_color);
    }
}