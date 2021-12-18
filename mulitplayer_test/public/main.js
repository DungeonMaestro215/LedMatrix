// Initialize some stuff
// const backend_url = "https://storri.herokuapp.com";
// const rand = Math.ceil(Math.random() * 1000);
// const author = `User${rand}`;

// Global variable for holding the grid data
const grid_data = []

window.onload = () => {
    document.getElementById('facebutt').addEventListener('click', getAsciiFace);

    let rows = 16;
    let cols = 16;
    let grid_size = rows*cols;
    for (let idx=0; idx<grid_size; idx++) {
        grid_data[idx] = 0
    }

    setUpGrid(rows, cols);
}

async function getAsciiFace() {
    let res = await axios({
        url: `http://localhost:3000/ascii`,
        method: 'get'
    });

    console.log(res.data);
}

// Create the grid of cells
function setUpGrid(rows, cols) {
    let grid = document.getElementById('grid');

    // Create the rows
    for (let i=0; i<rows; i++) {
        let row = document.createElement('div')
        row.classList.add('row');
        grid.appendChild(row);

        // Create the cells
        for (let j=0; j<cols; j++) {
            let cell = document.createElement('div')
            cell.classList.add('red-cell');

            // Toggle cell color if clicked
            cell.addEventListener('click', (e) => {
                let idx = e.target.getAttribute('cell-num');
                let data = grid_data[idx]

                if (data == 0) {
                    grid_data[idx] = 1;
                    cell.setAttribute('class', 'blue-cell')
                } else {
                    grid_data[idx] = 0;
                    cell.setAttribute('class', 'red-cell')
                }
            });

            // Calculate the cell number
            let cell_num = i*cols + j
            cell.setAttribute('cell-num', cell_num);
            row.appendChild(cell);
        }
    }
}

// Cell click handler
function cellClickHandler() {
    getAsciiFace();
}