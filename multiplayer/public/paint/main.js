// Initialize some stuff
// const backend_url = "https://storri.herokuapp.com";
// const rand = Math.ceil(Math.random() * 1000);
// const author = `User${rand}`;

window.onload = () => {
    document.getElementById('clear').addEventListener('click', () => {
        clearAll();
    });

    document.getElementById('brushsize').oninput = function() {
        document.getElementById('brushsize-value').innerHTML = this.value;
    };

    let rows = 64;
    let cols = 64;

    setUpGrid(rows, cols);
    clearAll();
}



// Create the grid of cells
function setUpGrid(rows, cols) {
    let grid = document.getElementById('grid');
    
    // Allow for right click painting
    grid.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    grid.addEventListener('mousedown', handlePainting);
    grid.addEventListener('mousemove', handlePainting);
    grid.addEventListener('touchstart', handlePainting);
    grid.addEventListener('touchmove', handlePainting);


    // Create the rows
    for (let i=0; i<rows; i++) {
        let row = document.createElement('div')
        row.classList.add('row');
        grid.appendChild(row);

        // Create the cells
        for (let j=0; j<cols; j++) {
            let cell = document.createElement('div')
            cell.classList.add('cell');
            cell.classList.add('red-cell');

            // Change cell color if clicked
            // cell.addEventListener('mousedown', handleCellClick);

            // Change cell color if mouse is clicked and dragged over the cell
            // cell.addEventListener('mouseenter', handleCellClick);

            // Color for mobile
            // cell.addEventListener('touchstart', handleCellClick);
            // cell.addEventListener('touchmove', handleCellClick);
            

            // Calculate the cell number
            let cell_num = i*cols + j
            cell.setAttribute('cell-num', cell_num);
            row.appendChild(cell);
        }
    }
}

function handlePainting(e) {
    e.preventDefault();


    if (e.touches) {
        let cell = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        let button = 1;
        let color = document.getElementById(`colorpicker${button}`).value;
        colorCell(cell, color);
        return;
    }

    let cell = document.elementFromPoint(e.clientX, e.clientY);
    let button = e.buttons;
    if (button == 1 || button == 2) {
        let color = document.getElementById(`colorpicker${button}`).value;
        colorCell(cell, color);
    }
}

function colorCell(cell, color) {
    if (!cell.classList.contains('cell')) {
        return;
    }
    cell.style.backgroundColor = color;
}

function colorAll(colors) {
    let cells = document.querySelectorAll('.cell');

    cells.forEach((cell) => {
        let idx = cell.getAttribute('cell-num');
        colorCell(cell, colors[idx]);
    });
}

function clearAll() {
    let colors = []
    let cell_count = document.querySelectorAll('.cell').length;

    for (let i=0; i<cell_count; i++) {
        colors[i] = '#ffffff';
    }

    colorAll(colors);
}

// Cell click handler
function cellClickHandler() {
    getAsciiFace();
}

async function getAsciiFace() {
    let res = await axios({
        url: `http://localhost:3000/ascii`,
        method: 'get'
    });

    console.log(res.data);
}