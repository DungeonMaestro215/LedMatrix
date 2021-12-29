/* Controller handles communication between the model and the view
 * as well as handling websocket connections (later version).
 * Possible events that it listens for:
    * Clear
    * Coloring a cell
    * Fill
 * Once the model is updated, its data will be sent back to the view 
 */
class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        view.addListener((e) => this.handleEvent(e));
    }

    // Given an event, what should happen?
    handleEvent(e) {
        const event_list = {
            clear: this.handleClear,
            test: this.handleTest,
            color: this.handleColor,
            fill: this.handleFill
        }

        event_list[e.type](e);
    }

    // Clear the model and update the view
    handleClear = (e) => {
        this.model.colorAll('#ffffff');
        this.view.colorAll(this.model.getData());
    }

    // Paint the cell and any neighbors, then update the view
    handleColor = (e) => {
        this.model.colorCell(e.cell_num, e.color, e.size);
        this.view.colorAll(this.model.getData());
    }

    // Floodfill the model, the update the view
    handleFill = (e) => {
        this.model.fill(e.cell_num, e.color);
        this.view.colorAll(this.model.getData());
    }

    handleTest = (e) => {
        console.log('Ladies and gentlemen');

    }
}