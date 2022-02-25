/* View will handle updating the webpage 
 * and send any click events to the controller
 */
class View {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.setup();
        [this.canvas, this.ctx, this.bounds] = this.setUpGrid(rows, cols);
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
            document.getElementById('colorpicker2').remove();
            document.getElementById('colorpicker2-label').remove();
            document.getElementById('colorpicker1-label').innerHTML = "Color";
        }
    }

    // Initially sets up the grid which will serve as the canvas 
    setUpGrid(rows, cols) {
        // const grid = document.createElement('div');
        // grid.id = 'grid';

        const canvas = document.getElementById("grid-canvas");
        const bounds = canvas.getBoundingClientRect();
        let ctx = null;
        canvas.width = 300;
        canvas.height = 300;
        if (canvas.getContext) {
            ctx = canvas.getContext('2d');
            ctx.strokeStyle = "black";
            ctx.linewidth = 1;
            ctx.beginPath()
            ctx.moveTo(0, 0);
            // ctx.fillStyle = 'rgb(200, 0, 0)';
            // ctx.fillRect(10, 10, 50, 50);

            // ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
            // ctx.fillRect(30, 30, 50, 50);
        }
    
        // Allow for right click painting
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        canvas.addEventListener('mousedown', (e) => this.handlePainting(e));
        canvas.addEventListener('mousemove', (e) => this.handlePainting(e));
        canvas.addEventListener('mouseup', (e) => this.handlePainting(e));
        canvas.addEventListener('touchstart', (e) => this.handlePainting(e));
        canvas.addEventListener('touchmove', (e) => this.handlePainting(e));
        canvas.addEventListener('touchend', (e) => this.handlePainting(e));

        // Create the rows
        // for (let i=0; i<rows; i++) {
        //     let row = document.createElement('div')
        //     row.classList.add('row');
        //     grid.appendChild(row);

        //     // Create the cells
        //     for (let j=0; j<cols; j++) {
        //         let cell = document.createElement('div')
        //         cell.classList.add('cell');

        //         // Calculate the cell number
        //         let cell_num = i*cols + j
        //         cell.setAttribute('cell-num', cell_num);
        //         row.appendChild(cell);
        //     }
        // }

        return [canvas, ctx, bounds];
    }

    setColor(color, button) {
        document.getElementById(`colorpicker${button}`).value = color;
    }

    // Updates all of the cells in the grid based on the given data
    colorAll(data) {
        console.log(data);

        const color = 'rgb(200, 0, 0)';
        const width = this.canvas.width / this.rows;
        const height = this.canvas.height / this.cols;

        data.forEach((datum, idx) => {
            console.log(idx);
            const [x, y] = this.getCoordsFromCell(idx);
            this.colorCell(x, y, width, height, color);
        });

        // const cells = document.querySelectorAll('.cell');

        // cells.forEach((cell) => {
        //     let idx = parseInt(cell.getAttribute('cell-num'));
        //     cell.style.backgroundColor = data[idx];
        // });
    }

    colorCell(x, y, width, height, color) {
        console.log(height);
        this.ctx.linewidth = 1;
        this.ctx.beginPath()
        this.ctx.moveTo(x, y);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
        // this.ctx.fillRect(10, 10, 50, 50);
        // this.ctx.stroke();
    }

    // Handler for when a cell is clicked
    handlePainting(e) {
        e.preventDefault();
        // console.log(e.target.style.backgroundColor);

        if (!e.target.id === "grid-canvas") {
            return;
        }

        let type = 'click';
        if (e.type === 'mousemove' || e.type === 'touchmove') type = 'drag';
        else if (e.type === 'mouseup' || e.type === 'touchend') {
            type = 'stop';
            this.updateListeners({ tool: this.tool, type: type });
        }

        if (e.touches) {
            try {
                const cell_num = parseInt(document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY).getAttribute('cell-num'));
                const button = 1;
                const color = document.getElementById(`colorpicker${button}`).value;
                const size = document.getElementById('brushsize').value;
                this.updateListeners({ tool: this.tool, type: type, cell_num: cell_num, color: color, size: size, button: button });
            } catch (TypeError) {
                console.log("Out of Bounds");
            }

            return;
        }

        // const cell_num = parseInt(document.elementFromPoint(e.clientX, e.clientY).getAttribute('cell-num'));
        const cell_num = this.getCellFromCoords(e.clientX, e.clientY);
        // console.log(cell_num);
        const button = e.buttons;

        // Dropper tool to match colors
        // if (this.tool === 'dropper') {
        //     const color = document.getElementById(`colorpicker${button}`).value;
        //     return
        // }

        // if (button == 1) {
        if (button == 1 || button == 2) {
            const color = document.getElementById(`colorpicker${button}`).value;
            const size = document.getElementById('brushsize').value;
            this.updateListeners({ tool: this.tool, type: type, cell_num: cell_num, color: color, size: size, button: button });
            // console.log(e.clientX - this.bounds.left, e.clientY - this.bounds.top);
            this.ctx.lineTo(e.clientX - this.bounds.left, e.clientY - this.bounds.top);
            this.ctx.stroke();
        }

        // if (button == 2) {
        //     const color = document.getElementById(`colorpicker${button}`).value;
        //     this.updateListeners({ tool: this.tool, type: type, cell_num: cell_num, color: color });
        // }
    }

    getCellFromCoords(x, y) {
        const row = Math.floor((x - this.bounds.left) / this.canvas.width * this.rows);
        const col = Math.floor((y - this.bounds.top) / this.canvas.height * this.cols);
        
        return row + this.rows * col;
    }

    getCoordsFromCell(num) {
        const x = 0;
        const y = 0;
        return [x, y];
    }
}