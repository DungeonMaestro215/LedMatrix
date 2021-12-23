// Initialize some stuff
// const backend_url = "https://storri.herokuapp.com";
// const rand = Math.ceil(Math.random() * 1000);
// const author = `User${rand}`;

let data = {
    rows: 64,
    cols: 64,
    tool: undefined,
    colors: []
};

window.onload = () => {
    document.getElementById('clear').addEventListener('click', () => {
        clearAll();
    });

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.getElementById('colorpicker2').remove();
        document.getElementById('colorpicker2-label').remove();
        document.getElementById('colorpicker1-label').innerHTML = "Color";
    }

    document.getElementById('brushsize').oninput = function() {
        document.getElementById('brushsize-value').innerHTML = this.value;
    };

    for (let i=0; i<data.rows*data.cols; i++) {
        data.colors[i] = '#ffffff';
    }

    setUpGrid(data.rows, data.cols);
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

    if (!e.target.classList.contains('cell')) {
        return;
    }

    if (e.touches) {
        let cell_num = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY).getAttribute('cell-num');
        let button = 1;
        let color = document.getElementById(`colorpicker${button}`).value;
        let size = document.getElementById('brushsize').value;
        colorCell(cell_num, color, size);
        colorAll();
        return;
    }

    let cell_num = document.elementFromPoint(e.clientX, e.clientY).getAttribute('cell-num');
    let button = e.buttons;
    if (button == 1) {
    // if (button == 1 || button == 2) {
        let color = document.getElementById(`colorpicker${button}`).value;
        let size = document.getElementById('brushsize').value;
        colorCell(cell_num, color, size);
        colorAll();
    }

    if (button == 2) {
        let color = document.getElementById(`colorpicker${button}`).value;
        fill(cell_num, color);
    }
}

function colorCell(cell_num, color, size=1) {
    cell_num = parseInt(cell_num);
    if (cell_num < 0 || cell_num > data.colors.length) {
        return;
    }
        
    data.colors[cell_num] = color;

    if (size <= 1) {
        return;
    } else {
        colorCell(cell_num+1, color, size-1);
        colorCell(cell_num-1, color, size-1);
        colorCell(cell_num+data.cols, color, size-1);
        colorCell(cell_num-data.cols, color, size-1);
    }
}

function colorAll() {
    let cells = document.querySelectorAll('.cell');

    cells.forEach((cell) => {
        let idx = cell.getAttribute('cell-num');
        cell.style.backgroundColor = data.colors[idx];
    });
}

function clearAll() {
    // let colors = []
    let cell_count = document.querySelectorAll('.cell').length;

    for (let i=0; i<cell_count; i++) {
        data.colors[i] = '#ffffff';
    }

    colorAll();
}

function fill(cell_num, color) {
    cell_num = parseInt(cell_num);
    floodFill(cell_num, data.colors[cell_num], color);
    colorAll();
}

function floodFill(cell_num, old_color, new_color) {
    if (cell_num < 0 || cell_num > data.colors.length) {
        return;
    }
        
    if (data.colors[cell_num] != old_color || data.colors[cell_num] == new_color) {
        return;
    }

    data.colors[cell_num] = new_color;
    floodFill(cell_num+1, old_color, new_color);
    floodFill(cell_num-1, old_color, new_color);
    floodFill(cell_num+data.cols, old_color, new_color);
    floodFill(cell_num-data.cols, old_color, new_color);
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