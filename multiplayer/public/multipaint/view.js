/* View will handle updating the webpage 
 * and send any click events to the controller
 */
class View {
    constructor(rows, cols) {
        this.setup();
        this.div = this.setUpGrid(rows, cols);
        this.listeners = [];
        this.tool = 'brush';
        this.cursor = {
            id: null,
            color: null,
            x: 0,
            y: 0
        }
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

        // Add cursor handlers
        document.getElementById('main').addEventListener('mousemove', (e) => this.handleCursor(e));
        document.getElementById('main').addEventListener('touchmove', (e) => this.handleCursor(e));
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
        grid.addEventListener('mouseup', (e) => this.handlePainting(e));
        grid.addEventListener('touchstart', (e) => this.handlePainting(e));
        grid.addEventListener('touchmove', (e) => this.handlePainting(e));
        grid.addEventListener('touchend', (e) => this.handlePainting(e));

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

    setColor(color, button) {
        document.getElementById(`colorpicker${button}`).value = color;
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
        // console.log(e.target.style.backgroundColor);

        if (!e.target.classList.contains('cell')) {
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
            this.updateListeners({ tool: this.tool, type: type, cell_num: cell_num, color: color, size: size, button: button });
        }

        // if (button == 2) {
        //     const color = document.getElementById(`colorpicker${button}`).value;
        //     this.updateListeners({ tool: this.tool, type: type, cell_num: cell_num, color: color });
        // }
    }
    
    getOrCreateCursorFor(id, name, color) {
        if (id === null) return;

        const existing = document.querySelector(`[data-sender='${id}']`);
        if (existing) {
            existing.querySelector('.name').innerHTML = name;
            return existing;
        }

        this.cursor.id = id;
        this.cursor.color = color;

        const cursor = document.createElement('div');
        cursor.style.border = `#${color} solid 5px`;
        cursor.classList.add('cursor');

        const duck = document.createElement('img');
        duck.src = '../images/duck2.png';
        cursor.appendChild(duck);

        const name_div = document.createElement('div');
        name_div.classList.add('name');
        cursor.appendChild(name_div);
        name_div.innerHTML = name;

        cursor.setAttribute("data-sender", id);
        document.getElementById('main').appendChild(cursor);

        return cursor;
    }

    getCursor() {
        return this.cursor;
    }

    // Cursor handlers
    handleCursor(e) {
        // e.preventDefault();
        let x = e.clientX;
        let y = e.clientY;
        if ( (!x || !y) && e.touches) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
            if (!x || !y) return;
        }

        let username = document.getElementById('name').value;
        this.moveCursor(this.cursor.id, username, this.cursor.color, x, y);

        let messageBody = { x: x, y: y, name: username };
        // ws.send(JSON.stringify(messageBody));
        this.updateListeners({ tool: "cursor", type: "cursor", message: messageBody });
    }

    moveCursor(id, name, color, x, y) {
        if (id === null) return;

        this.cursor.x = x;
        this.cursor.y = y;
        const cursor = this.getOrCreateCursorFor(id, name, color);
        cursor.style.transform = `translate(${x-35}px, ${y-35}px)`;
    }

    removeCursor(id) {
        document.querySelector(`[data-sender='${id}']`).remove();
    }
}