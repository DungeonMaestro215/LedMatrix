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
        this.setupWS();
        this.id = null;
        // this.ws = await this.connectToServer();
        // ws.onmessage = this.onMessage;
        // window.onbeforeunload = () => this.ws.close();

        view.addListener((e) => this.handleEvent(e));
        this.view.colorAll(this.model.getData());
    }

    // Set up WS connection
    async setupWS() {
        this.ws = await this.connectToServer();
        this.ws.onmessage = this.onMessage;
        window.onbeforeunload = () => this.ws.close();
    }

    // Given an event, what should happen?
    handleEvent(e) {
        const event_list = {
            clear: this.handleClear,
            test: this.handleTest,
            brush: this.handleBrush,
            bucket: this.handleBucket,
            dropper: this.handleDropper,
            cursor: this.handleCursor,
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
            // this.ws.send(JSON.stringify({ type: "click", data: { cell_num: e.cell_num, color: e.color, size: e.size } }));
            this.ws.send(JSON.stringify({ type: "paint", changes: this.model.getChanges() }));
            this.model.clearChanges();
        } else if (e.type === 'drag') {
            this.model.line(this.model.getLast(), e.cell_num, e.color, e.size);
            this.model.setLast(e.cell_num);
            this.view.colorAll(this.model.getData());
            // this.ws.send(JSON.stringify({ type: "drag", data: { cell_num: e.cell_num, last: this.model.getLast(), color: e.color, size: e.size } }));
            this.ws.send(JSON.stringify({ type: "paint", changes: this.model.getChanges() }));
            this.model.clearChanges();
        } else if (e.type === 'stop') {
            this.model.setLast(null);
        }
    }

    // Floodfill the model, the update the view
    handleBucket = (e) => {
        this.model.fill(e.cell_num, e.color);
        this.view.colorAll(this.model.getData());
    }

    handleDropper = (e) => {
        // console.log(e.cell_num);
        // console.log(this.model.getData()[e.cell_num]);
        let color = this.model.getData()[e.cell_num];
        let button = e.button;
        this.view.setColor(color, button);
    }

    handleTest = (e) => {
        console.log('Ladies and gentlemen');
    }
    
    async connectToServer() {
        // const ws = new WebSocket('ws://afternoon-plateau-82522.herokuapp.com/:3000', 'cursors');
        const ws = new WebSocket('ws://localhost:5000', 'paint');
        return new Promise((resolve, reject) => {
            const timer = setInterval(() => {
                if(ws.readyState === 1) {
                    clearInterval(timer)
                    resolve(ws);
                }
            }, 10);
        });
    }

    onMessage = (webSocketMessage) => {
        const messageBody = JSON.parse(webSocketMessage.data);

        console.log(messageBody);

        if (messageBody.type === "id") {
            this.view.setId(messageBody.id);
            this.view.setCursorColor(messageBody.color);
        }

        if (messageBody.type === 'delete') {
            this.view.removeCursor(messageBody.sender);
            return;
        }

        if (messageBody.type === "cursor" && messageBody.sender != this.view.getCursor().id) {
            console.log(messageBody.sender);
            // console.log("test");
            this.view.moveCursor(messageBody.sender, messageBody.name, messageBody.color, messageBody.x, messageBody.y);
        }

        // if (messageBody.type === "click") {
        //     let data = messageBody.data;
        //     this.model.colorCell(data.cell_num, data.color, data.size);
        //     this.view.colorAll(this.model.getData());
        // } else if (messageBody.type === "drag") {
        //     let data = messageBody.data;
        //     this.model.line(data.last, data.cell_num, data.color, data.size);
        //     this.view.colorAll(this.model.getData());
        // }

        // if (messageBody.type === "paint") {
        if (messageBody.type === "paint" && messageBody.sender != this.view.getCursor().id) {
            console.log(messageBody.sender);
            console.log(this.view.getId());
            let changes = messageBody.changes;
            this.model.updateFromChanges(changes);
            this.view.colorAll(this.model.getData());
        }
    }

    handleCursor = (e) => {
        // console.log(e);
        this.ws.send(JSON.stringify(e.message));
    }
}