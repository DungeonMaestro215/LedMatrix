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
            brush: this.handleBrush,
            bucket: this.handleBucket,
        }

        event_list[e.tool](e);
    }

    // Clear the model and update the view
    handleClear = (e) => {
        this.model.colorAll('#ffffff');
        this.view.colorAll(this.model.getData());
    }

    // Paint the cell and any neighbors, then update the view
    handleBrush = (e) => {
        if (e.type === 'click') {
            this.model.colorCell(e.cell_num, e.color, e.size);
            this.model.setLast(e.cell_num);
            this.view.colorAll(this.model.getData());
        } else if (e.type === 'drag') {
            this.model.line(model.getLast(), e.cell_num, e.color, e.size);
            this.model.setLast(e.cell_num);
            this.view.colorAll(this.model.getData());
        }
    }

    // Floodfill the model, the update the view
    handleBucket = (e) => {
        this.model.fill(e.cell_num, e.color);
        this.view.colorAll(this.model.getData());
    }

    handleTest = (e) => {
        console.log('Ladies and gentlemen');

    }
}