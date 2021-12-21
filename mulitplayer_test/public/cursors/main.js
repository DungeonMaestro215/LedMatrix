window.onload = async function() {
    const ws = await connectToServer();

    document.body.addEventListener('mousemove', (e) => {
        let username = document.getElementById('name').value;
        const messageBody = { x: e.clientX, y: e.clientY, name: username };
        ws.send(JSON.stringify(messageBody));
    });

    ws.onmessage = (webSocketMessage) => {
        const messageBody = JSON.parse(webSocketMessage.data);
        const cursor = getOrCreateCursorFor(messageBody);
        cursor.style.transform = `translate(${messageBody.x}px, ${messageBody.y}px)`;
    };
}

async function connectToServer() {
    const ws = new WebSocket('ws://localhost:3001');
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