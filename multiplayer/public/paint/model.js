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
    }

    // Send back the data
    getData() {
        return this.data;
    }

    // Given new data, update the model's
    updateData(new_data) {
        this.data = new_data;
    }

    // Handle painting a cell
    // Larger brush sizes will recursively call this
    colorCell(cell_num, color, size=1) {
        // OOB?
        if (cell_num < 0 || cell_num > this.data.length) {
            return;
        }
        
        this.data[cell_num] = color;

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