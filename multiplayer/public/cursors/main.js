window.onload = async function() {
    const ws = await connectToServer();

    document.body.addEventListener('mousemove', (e) => {
        handleMoveEvent(e, ws);
    });
    document.body.addEventListener('touchmove', (e) => {
        handleMoveEvent(e, ws);
    });

    ws.onmessage = (webSocketMessage) => {
        const messageBody = JSON.parse(webSocketMessage.data);

        if (messageBody.type == 'delete') {
            document.querySelector(`[data-sender='${messageBody.sender}']`).remove();
            return;
        }

        const cursor = getOrCreateCursorFor(messageBody);
        cursor.style.transform = `translate(${messageBody.x}px, ${messageBody.y}px)`;
    };

    document.body.addEventListener('click', () => {
        document.getElementById('name').focus();
    });
    

    window.onbeforeunload = function() {
        ws.close();
    }
    // window.onunload = window.onbeforeunload;
    // document.addEventListener('visibilitychange', (e) => {
    //     if (document.visibilityState !== 'visible') {
    //         let messageBody = { type: 'delete' };
    //         ws.send(JSON.stringify(messageBody));
    //         ws.close();
    //     }
    // });
}

function handleMoveEvent(e, ws) {
    e.preventDefault();

    let x = e.clientX;
    let y = e.clientY;
    if ( (!x || !y) && e.touches) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
        if (!x || !y) return;
    }

    let username = document.getElementById('name').value;
    let messageBody = { x: x, y: y, name: username };
    ws.send(JSON.stringify(messageBody));
}

async function connectToServer() {
    // const ws = new WebSocket('ws://afternoon-plateau-82522.herokuapp.com/:3000', 'cursors');
    const ws = new WebSocket('ws://localhost:5000', 'cursors');
    return new Promise((resolve, reject) => {
        const timer = setInterval(() => {
            if(ws.readyState === 1) {
                clearInterval(timer)
                resolve(ws);
            }
        }, 10);
    });
}

function getOrCreateCursorFor(messageBody) {
    const sender = messageBody.sender;
    const existing = document.querySelector(`[data-sender='${sender}']`);
    if (existing) {
        existing.querySelector('.name').innerHTML = messageBody.name;
        return existing;
    }

    const cursor = document.createElement('div');
    cursor.style.border = `#${messageBody.color} solid 5px`;
    cursor.classList.add('cursor');

    const duck = document.createElement('img');
    duck.src = '../images/duck2.png';
    cursor.appendChild(duck);

    const name_div = document.createElement('div');
    name_div.classList.add('name');
    cursor.appendChild(name_div);
    name_div.innerHTML = messageBody.name;

    cursor.setAttribute("data-sender", sender);
    document.body.appendChild(cursor);

    return cursor;
}