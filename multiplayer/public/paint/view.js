/* View will handle updating the webpage 
 * and send any click events to the controller
 */
class View {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.gridsize = 640;
        this.setup();
        [this.canvas, this.ctx] = this.setUpGrid(rows, cols);
        this.listeners = [];
        this.tool = 'brush';
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

    // Setup the view and link settings with effects
    setup() {
        document.getElementById('clear').addEventListener('click', () => this.updateListeners({ tool: 'clear' }));
        document.getElementById('test').addEventListener('click', () => this.updateListeners({ tool: 'test' }));
        document.getElementById('swap').addEventListener('click', this.swapColors);
        document.getElementById('brushsize').oninput = function() {
            document.getElementById('brushsize-value').innerHTML = this.value;
        };

        // Tool selector
        document.getElementsByName('tool').forEach(button => button.addEventListener('input', (e) => {
            this.tool = e.target.value;
            // document.getElementById('grid').style.cursor = `url(../images/my${this.tool}.png) 0 32, auto`;
        }));

        // On mobile devices, remove the secondary color option
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // document.getElementById('colorpicker2').remove();
            // document.getElementById('colorpicker2-label').remove();
            // document.getElementById('colorpicker1-label').innerHTML = "Color";

            this.gridsize = 320;
        }
    }

    // Initially sets up the grid which will serve as the canvas 
    setUpGrid(rows, cols) {
        const canvas = document.getElementById("grid-canvas");
        let ctx = null;
        canvas.width = this.gridsize;
        canvas.height = this.gridsize;

        if (canvas.getContext) {
            ctx = canvas.getContext('2d');
            ctx.strokeStyle = "black";
        }
    
        // Allow for right click painting
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Events
        canvas.addEventListener('pointerdown', (e) => this.handlePainting(e));
        canvas.addEventListener('pointermove', (e) => this.handlePainting(e));
        canvas.addEventListener('pointerup', (e) => this.stopPainting());
        canvas.addEventListener('pointerleave', (e) => this.stopPainting());

        return [canvas, ctx];
    }

    setColor(color, button) {
        // Return if not a valid button
        if (!(button === 1 || button === 2)) return;

        // Set the color
        document.getElementById(`colorpicker${button}`).value = color;
    }

    swapColors() {
        const colorpicker1 = document.getElementById('colorpicker1');
        const colorpicker2 = document.getElementById('colorpicker2');

        const temp = colorpicker1.value;
        colorpicker1.value = colorpicker2.value;
        colorpicker2.value = temp;
    }

    // Updates all of the cells in the grid based on the given data
    colorAll(data) {
        const width = this.canvas.width / this.rows;
        const height = this.canvas.height / this.cols;

        data.forEach((datum, idx) => {
            const [x, y] = this.getCoordsFromCell(idx);
            this.colorCell(x, y, width, height, datum);
        });
    }
    
    colorSome(data) {
        const width = this.canvas.width / this.rows;
        const height = this.canvas.height / this.cols;

        data.forEach(datum => {
            const [x, y] = this.getCoordsFromCell(datum.cell_num);
            this.colorCell(x, y, width, height, datum.color);
        });
    }

    colorCell(x, y, width, height, color) {
        this.ctx.beginPath()
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.stroke();
    }

    // Handler for when a cell is clicked
    handlePainting(e) {
        if (e.target.id !== "grid-canvas") return;
        if (!(e.buttons === 1 || e.buttons == 2)) return;

        let type = 'click';
        if (e.type === 'pointermove') type = 'drag';

        const clamp = (num, min, max) => Math.max(Math.min(num, max), min);

        const cell_num = this.getCellFromCoords(clamp(e.offsetX, 0, this.gridsize-1), clamp(e.offsetY, 0, this.gridsize-1));
        const button = e.buttons;
        const color = document.getElementById(`colorpicker${button}`).value;
        const size = document.getElementById('brushsize').value;
        this.updateListeners({ tool: this.tool, type: type, cell_num: cell_num, color: color, size: size, button: button });
    }

    stopPainting() {
        this.updateListeners({ tool: this.tool, type: 'stop' });
    }

    getCellFromCoords(x, y) {
        // Sometimes the edges go just out of bounds of the grid. This makes sure no negatives.
        const row = Math.floor(x / this.canvas.width * this.rows);
        const col = Math.floor(y / this.canvas.height * this.cols);

        console.log(x, y, row, col);

        let cell_num = row + this.rows * col;
        
        return cell_num;
    }

    getCoordsFromCell(num) {
        const x = (num % this.rows) * (this.canvas.width / this.rows);
        const y = Math.floor(num / this.cols) * (this.canvas.height / this.cols);
        return [x, y];
    }
}