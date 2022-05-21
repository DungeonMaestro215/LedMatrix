// let model = null;
// let view = null;
// let control = null;

window.onload = () => {
    // settings
    const rows = 8;
    const cols = 8;

    // Setup MVC
    const model = new Model(rows, cols);
    const view = new View(rows, cols);
    const control = new Controller(model, view);

    // Load into DOM
    // document.getElementById('grid-wrapper').append(view.div);
};