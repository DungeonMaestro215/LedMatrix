/* View will handle updating the webpage 
 * and send any click events to the controller
 */
class View {
    constructor(rows, cols) {
        this.setup();
        this.div = this.setUpGrid(rows, cols);
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
            document.getElementById('grid').style.cursor = `url(../images/my${this.tool}.png) 0 32, auto`;
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
        const grid = document.createElement('div');
        grid.id = 'grid';
    
        // Allow for right click painting
        grid.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        grid.addEventListener('mousedown', (e) => this.handlePainting(e));
        grid.addEventListener('mousemove', (e) => this.handlePainting(e));
        grid.addEventListener('touchstart', (e) => this.handlePainting(e));
        grid.addEventListener('touchmove', (e) => this.handlePainting(e));

        // Create the rows
        for (let i=0; i<rows; i++) {
            let row = document.createElement('div')
            row.classList.add('row');
            grid.appendChild(row);

            // Create the cells
            for (let j=0; j<cols; j++) {
                let cell = document.createElement('div')
                cell.classList.add('cell');

                // Calculate the cell number
                let cell_num = i*cols + j
                cell.setAttribute('cell-num', cell_num);
                row.appendChild(cell);
            }
        }

        return grid;
    }

    // Updates all of the cells in the grid based on the given data
    colorAll(data) {
        const cells = document.querySelectorAll('.cell');

        cells.forEach((cell) => {
            let idx = parseInt(cell.getAttribute('cell-num'));
            cell.style.backgroundColor = data[idx];
        });
    }

    // Handler for when a cell is clicked
    handlePainting(e) {
        e.preventDefault();
        console.log(e.target.style.backgroundColor);

        if (!e.target.classList.contains('cell')) {
            return;
        }

        let type = 'click';
        if (e.type === 'mousemove') type = 'drag';

        if (e.touches) {
            const cell_num = parseInt(document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY).getAttribute('cell-num'));
            const button = 1;
            const color = document.getElementById(`colorpicker${button}`).value;
            const size = document.getElementById('brushsize').value;

            this.updateListeners({ tool: this.tool, type: type, cell_num: cell_num, color: color, size: size });
            return;
        }

        const cell_num = parseInt(document.elementFromPoint(e.clientX, e.clientY).getAttribute('cell-num'));
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
            this.updateListeners({ tool: this.tool, type: type, cell_num: cell_num, color: color, size: size });
        }

        // if (button == 2) {
        //     const color = document.getElementById(`colorpicker${button}`).value;
        //     this.updateListeners({ tool: this.tool, type: type, cell_num: cell_num, color: color });
        // }
    }
}