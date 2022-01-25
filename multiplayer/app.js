// Import the things
const http = require('http');
const express = require('express');         // express web framework
const cors = require('cors');               // CORS
const path = require('path');               // Simplifies file paths
const favicon = require('serve-favicon');   // Serves the favicon
const cool = require('cool-ascii-faces');   // Fun addition ಠﭛಠ
const WebSocket = require('ws');

// Path names
const html_path = path.join(__dirname, "public");
const fav_path = path.join(__dirname, "public", "images", "favicon.ico");

// Initialize the app
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.static(html_path));
app.use(favicon(fav_path));
const port = process.env.PORT || 3000;

// Initialize WebSockets
// const wsport = 3000;
const ws = new WebSocket.Server({ server });
const clients = new Map();
// const ws2port = 3000;
// const ws2 = new WebSocket.Server({ port: ws2port });
// const clients2 = new Map();

// Send the page
app.get('/', (req, res) => { });

app.get('/ascii', (req, res) => {
  res.send(cool())
});

// Start serving
server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Start WebSocket for cursors
// https://ably.com/blog/web-app-websockets-nodejs
ws.on('connection', (socket) => {
  console.log('user connected');
  // console.log(socket.protocol);

  // Generate user data
  let protocol = socket.protocol;
  let id = getNewID(clients);
  let color = Math.floor(Math.random()*16777215).toString(16);

  let connectionMessage = { type: "id", id: id, color: color };
  socket.send(JSON.stringify(connectionMessage));
  color = '0'.repeat(6 - color.length) + color;

  let metadata = { protocol, id, color };

  clients.set(socket, metadata);

  // Upon receiving a message, send it to all clients within the same protocol
  socket.on('message', (messageAsString) => {
    const message = JSON.parse(messageAsString);
    const metadata = clients.get(socket);

    // Add identifying info
    message.sender = metadata.id;
    message.color = metadata.color;
    const outbound = JSON.stringify(message);
    
    [...clients.entries()].forEach((client_data) => {
      if (client_data[1].protocol == metadata.protocol) {
        client_data[0].send(outbound);
      }
    });
  });

  socket.on("close", () => {
    const metadata = clients.get(socket);

    let message = { type: 'delete' };
    // Add identifying info
    message.sender = metadata.id;
    message.color = metadata.color;
    const outbound = JSON.stringify(message);

    [...clients.entries()].forEach((client_data) => {
      if (client_data[1].protocol == metadata.protocol) {
        client_data[0].send(outbound);
      }
    });

    console.log('user disconnected');
    clients.delete(socket);
  });
});

// https://ably.com/blog/web-app-websockets-nodejs
// function uuidv4() {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//     var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
//     return v.toString(16);
//   });
// }
function getNewID(clients) {
  let max_id = [...clients.values()].reduce((acc, curr) => {
    return curr.id > acc ? curr.id : acc;
  }, 0);
  return max_id + 1;
}
console.log("wss up");


// Start WebSocket for MultiPaint
// ws2.on('connection', (socket) => {
//   console.log('user connected');
//   // console.log(socket);

//   // Generate user data
//   let id = uuidv4();
//   const color = Math.floor(Math.random() * 360);
//   const metadata = { id, color };

//   clients2.set(socket, metadata);

//   // Upon receiving a message, send it to all clients within the same protocol
//   socket.on('message', (messageAsString) => {
//     const message = JSON.parse(messageAsString);
//     const metadata = clients2.get(socket);

//     // Add identifying info
//     message.sender = metadata.id;
//     message.color = metadata.color;
//     const outbound = JSON.stringify(message);

//     [...clients2.keys()].forEach((client) => {
//       client.send(outbound);
//     });
//   });

//   socket.on("close", () => {
//     console.log('user disconnected');
//     clients2.delete(socket);
//   });
// });