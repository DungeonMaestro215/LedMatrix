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
        this.last = null;
        this.changes = [];
    }

    // Uses listeners to update the controller of events
    addListener(listener) {
        const idx = this.listeners.findIndex((l) => l === listener);
        if (idx === -1) {
            this.listeners.push(listener);
        }
    }

    removeListener(listener) {
        const idx = this.listeners.findIndex((l) => l === listener);
        if (idx != -1) {
            this.listeners.splice(idx, 1);
        }
    }

    updateListeners(e) {
        this.listeners.forEach((l) => l(e));
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
            this.changes.push({ cell_num: change.cell_num, color: change.color });
        });
    }

    // Handle painting a cell
    // Larger brush sizes will recursively call this
    colorCell(cell_num, color, size=1) {
        // OOB?
        if (cell_num < 0 || cell_num > this.data.length) {
            return;
        }

        // Is there any actual change?
        if (this.data[cell_num] !== color) {
            this.data[cell_num] = color;
            this.changes.push({ cell_num: cell_num, color: color });
        }

        // Recursively color around the cell
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

        setTimeout(() => {
            if (cell_num % this.cols !== this.cols-1) {
                this.floodFill(cell_num+1, old_color, new_color);
            }
        
            if (cell_num % this.cols !== 0) {
                this.floodFill(cell_num-1, old_color, new_color);
            }
            this.floodFill(cell_num+this.cols, old_color, new_color);
            this.floodFill(cell_num-this.cols, old_color, new_color);

            this.updateListeners({ tool: "update" });
        }, 40);
    }

    oldfloodFill(cell_num, old_color, new_color) {
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

    // Blur
    blurCell(cell_num, size) {
        // OOB?
        if (cell_num < 0 || cell_num > this.data.length) {
            return;
        }

        // Calculate average of (8) neighbors
        const neighbors = [];

        // Recursively blur around the cell
        // Also obey the boundaries of the box
        if (size < 1) {
            return;
        } else {
            if (cell_num % this.cols !== this.cols-1) {
                neighbors.push(this.data[cell_num+1]);
                // neighbors.push(cell_num+1);
                this.blurCell(cell_num+1, size-1);
            }

            if (cell_num % this.cols !== 0) {
                neighbors.push(this.data[cell_num-1]);
                // neighbors.push(cell_num-1);
                this.blurCell(cell_num-1, size-1);
            }

            if (Math.floor(cell_num / this.rows) !== this.rows-1) {
                // neighbors.push(cell_num+this.cols);
                neighbors.push(this.data[cell_num+this.cols]);
                this.blurCell(cell_num+this.cols, size-1);
            }

            if (Math.floor(cell_num / this.rows) !== 0) {
                // neighbors.push(cell_num-this.cols);
                neighbors.push(this.data[cell_num-this.cols]);
                this.blurCell(cell_num-this.cols, size-1);
            }
        }

        let new_color = this.averageColors(neighbors);

        // Apply change
        if (this.data[cell_num] !== new_color) {
            this.data[cell_num] = new_color;
            this.changes.push({ cell_num: cell_num, color: new_color });
        }
    }

    averageColors(colors) {
        // Break up each color into rgb pieces and convert those to integers
        let average = colors.map(color => color.match(/\w\w/g).map(val => parseInt(val, 16)));
        
        // Sum up all of the r, g, and b values
        average = average.reduce((acc, curr_rgb) => {
            acc[0] += curr_rgb[0];
            acc[1] += curr_rgb[1];
            acc[2] += curr_rgb[2];
            return acc;
        }, [0, 0, 0]);

        // Divide by total and convert back to strings
        average = average.map(val => Math.round(val / colors.length).toString(16).padStart(2, '0'));

        return '#' + average[0] + average[1] + average[2];
    }

        // const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
        // const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
        // const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
        // const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
        // const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
        // return '#' + r + g + b;

}