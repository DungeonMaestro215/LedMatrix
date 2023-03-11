// let model = null;
// let view = null;
// let control = null;

window.onload = () => {
    // settings
    const rows = 64;
    const cols = 64;

    // Setup MVC
    const model = new Model(rows, cols);
    view = new View(rows, cols);
    const control = new Controller(model, view);
};