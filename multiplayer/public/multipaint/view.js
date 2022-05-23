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
        this.id = null;
        this.cursor = {
            hue_rotate: null,
            x: 0,
            y:0
        };
        this.last_cell = null;
        this.last_button = null;
        // this.setCursor(null, null, 0, 0);
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

            this.updateCursorImage(this.id, `my${this.tool}.png`);

            const messageBody = { type: "cursorimg", tool: this.tool };
            this.updateListeners({ type: 'cursorimg', tool: "cursor", message: messageBody });
        }));

        // On mobile devices, remove the secondary color option
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // document.getElementById('colorpicker2').remove();
            // document.getElementById('colorpicker2-label').remove();
            // document.getElementById('colorpicker1-label').innerHTML = "Color";
            this.gridsize = 320;
        }

        // Add cursor handlers
        // document.getElementById('main').addEventListener('mousemove', (e) => this.handleCursor(e));
        // document.getElementById('main').addEventListener('touchmove', (e) => this.handleCursor(e));
        document.getElementById('main').addEventListener('pointermove', (e) => this.handleCursor(e));
    }

    // Initially sets up the grid which will serve as the canvas 
    setUpGrid(rows, cols) {
        const canvas = document.getElementById("grid-canvas");
        let ctx = null;
        canvas.width = this.gridsize;
        canvas.height = this.gridsize;

        if (canvas.getContext) {
            ctx = canvas.getContext('2d');
            
            // Default to black canvas
            console.log('black');
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, this.gridsize-1, this.gridsize-1);
        }
    
        // Allow for right click painting
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Events
        // canvas.addEventListener('mousemove', (e) => e.preventDefault());

        canvas.addEventListener('pointerdown', (e) => this.handlePainting(e));
        canvas.addEventListener('pointermove', (e) => this.handlePainting(e));
        canvas.addEventListener('pointerup', () => this.stopPainting());
        canvas.addEventListener('pointerleave', () => this.stopPainting());

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

    // setCursor(id, color, x, y) {
    //     this.cursor.id = id;
    //     this.cursor.color = color;
    //     this.cursor.x = x;
    //     this.cursor.y =y;
    // }

    getId() {
        return this.id;
    }

    setId(id) {
        console.log('ID: ' + this.id);
        this.id = id;
    }

    setCursorHueRotate(hue_rotate) {
        this.cursor.hue_rotate = hue_rotate;
    }

    // setCursorColor(color) {
    //     this.cursor.color = color;
    // }

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
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    randomColor() {
        let color = Math.floor(Math.random()*16777215).toString(16);  // Random number 0-16^6 (0-ffffff)
        color = '#' + '0'.repeat(6 - color.length) + color;   // Pad with 0's
        return color;
    }

    // blend two hex colors together by an amount
    // https://stackoverflow.com/questions/6367010/average-2-hex-colors-together-in-javascript
    blendColors(colorA, colorB, amount) {
        const [rA, gA, bA] = colorA.match(/\w\w/g).map((c) => parseInt(c, 16));
        const [rB, gB, bB] = colorB.match(/\w\w/g).map((c) => parseInt(c, 16));
        const r = Math.round(rA + (rB - rA) * amount).toString(16).padStart(2, '0');
        const g = Math.round(gA + (gB - gA) * amount).toString(16).padStart(2, '0');
        const b = Math.round(bA + (bB - bA) * amount).toString(16).padStart(2, '0');
        return '#' + r + g + b;
    }

    // Handler for when a cell is clicked
    handlePainting(e) {
        e.preventDefault();
        // console.log(e.type);

        if (e.target.id !== "grid-canvas") return;
        if (e.buttons === 0) return;

        // Get the cell clicked
        const clamp = (num, min, max) => Math.max(Math.min(num, max), min);
        const cell_num = this.getCellFromCoords(clamp(e.offsetX, 0, this.gridsize-1), clamp(e.offsetY, 0, this.gridsize-1));

        const button = e.buttons;

        // Dragging is different because it is made up of lines to keep continuity
        let type = 'click';
        if (e.type === 'pointermove') {
            // This allows the mixed color to not be overridden if one mouse button is released just before the other
            if (this.last_button === 3 && button !== 3 && cell_num === this.last_cell) {
                this.stopPainting();
                return;
            }
            type = 'drag';
        };
        this.last_cell = cell_num;

        // Different button options
        let color = null;
        if (button === 1 || button == 2) {
            color = document.getElementById(`colorpicker${button}`).value;
        } else if (button === 4) {
            // Random button for middle mouse
            color = this.randomColor();
        } else {
            // Mix Colors with both clicked (button 3)
            let color1 = document.getElementById(`colorpicker1`).value;
            let color2 = document.getElementById(`colorpicker2`).value;
            color = this.blendColors(color1, color2, 0.5);
        }

        // Fixes one of the two main colors covering mixed color when button released

        // console.log(this.last_button, button, type, e);
        // if (this.last_button === 3 && button !== 3 && button !== 0) {
        //     this.stopPainting();
        //     return
        // }
        this.last_button = button;

        // const color = document.getElementById(`colorpicker1`).value;
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

        // console.log(x, y, row, col);

        let cell_num = row + this.rows * col;
        
        return cell_num;
    }

    getCoordsFromCell(num) {
        const x = (num % this.rows) * (this.canvas.width / this.rows);
        const y = Math.floor(num / this.cols) * (this.canvas.height / this.cols);
        return [x, y];
    }

    getOrCreateCursorFor(id, name, hue_rotate) {
        if (id === null) return;

        const existing = document.querySelector(`[data-sender='${id}']`);
        if (existing) {
            existing.querySelector('.name').innerHTML = name;
            return existing;
        }

        console.log("new cursor");
        console.log(this.id);

        const cursor = document.createElement('div');
        // cursor.style.border = `#${color} solid 5px`;
        // const rot = Math.floor(Math.random()*360);
        // console.log(rot);
        cursor.style.filter = `hue-rotate(${hue_rotate}deg)`;
        cursor.classList.add('cursor');

        const image = document.createElement('img');
        image.src = '../images/mybrush.png';
        cursor.appendChild(image);

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
        // console.log(e);

        // X and Y with respect to the canvas
        let x = e.clientX - this.canvas.getBoundingClientRect().x;
        let y = e.clientY - this.canvas.getBoundingClientRect().y;
        // if ( (!x || !y) && e.touches) {
        //     x = e.touches[0].clientX;
        //     y = e.touches[0].clientY;
        //     if (!x || !y) return;
        // }

        let username = document.getElementById('name').value;
        this.moveCursor(this.id, username, this.cursor.hue_rotate, this.tool, x, y);

        let messageBody = { type: "cursor", x: x, y: y, name: username, tool: this.tool };
        // ws.send(JSON.stringify(messageBody));
        this.updateListeners({ tool: "cursor", type: "cursor", message: messageBody });
    }

    moveCursor(id, name, color, tool, x, y) {
        if (id === null) return;

        // this.cursor.x = x;
        // this.cursor.y = y;
        const cursor = this.getOrCreateCursorFor(id, name, color);
        // [...document.getElementsByClassName("cursor")].filter(cursor => cursor.getAttribute('data-sender') == id)[0].getElementsByTagName('img')[0].src = `../images/my${tool}.png`;

        // Offset with respect to the canvas
        const offsetX = this.canvas.getBoundingClientRect().x;
        const offsetY = -cursor.getBoundingClientRect().height + this.canvas.getBoundingClientRect().y;
        cursor.style.transform = `translate(${x + offsetX}px, ${y + offsetY}px)`;
    }

    updateCursorImage(id, img) {
        [...document.getElementsByClassName("cursor")].filter(cursor => cursor.getAttribute('data-sender') == id)[0].getElementsByTagName('img')[0].src = `../images/${img}`;
    }

    removeCursor(id) {
        document.querySelector(`[data-sender='${id}']`).remove();
    }
}