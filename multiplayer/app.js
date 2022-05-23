// Import the things
const http = require('http');
const express = require('express');         // express web framework
// const bodyParser = require("body-parser");  // Request body parser
const { check } = require('express-validator');  // Sanitizer
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
// const jsonParser = bodyParser.json();
// app.use(jsonParser);
app.use(express.json());
app.use(cors());
app.use(express.static(html_path));
app.use(favicon(fav_path));
const port = process.env.PORT || 3000;

// Initialize WebSockets
const ws = new WebSocket.Server({ server });
const clients = new Map();

// Send the page
app.get('/ascii', (req, res) => {
  res.send(cool())
});

// Simple message thing
let message = {
  message: "DEFAULT",
  color: "#ffffff"
}
app.get('/message/messageget', (req, res) => {
  res.send(message);
});
app.post('/message/messagepost', 
    [check("message").isLength({ max: 80 }).trim(),
     check("color").trim()], (req, res) => {
  message.color = req.body.color;
  message.message = req.body.message.substring(0, 512);
  console.log(message);
  res.send("recieved");
});

// Start serving
server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Start WebSocket for cursors
// https://ably.com/blog/web-app-websockets-nodejs
ws.on('connection', (socket) => {
  // Generate user data
  let protocol = socket.protocol;
  let id = getNewID(clients);
  // let color = Math.floor(Math.random()*16777215).toString(16);  // Random number 0-16^6 (0-ffffff)
  let hue_rotate = Math.floor(Math.random()*360);
  // color = '0'.repeat(6 - color.length) + color;   // Pad with 0's

  // let connectionMessage = { type: "id", id: id, color: color };
  // socket.send(JSON.stringify(connectionMessage));
  // console.log("connection info sent!");
  // console.log(JSON.stringify(connectionMessage));

  let userdata = { protocol, id, hue_rotate };

  clients.set(socket, userdata);
  console.log(`user ${id} connected`);

  // Upon receiving a message, send it to all clients within the same protocol
  socket.on('message', (messageAsString) => {
    const message = JSON.parse(messageAsString);
    const userdata = clients.get(socket);

    // Add identifying info
    message.sender = userdata.id;
    message.hue_rotate = userdata.hue_rotate;
    const outbound = JSON.stringify(message);

    // Client will send an initial message to recieve their id
    if (message.type === "initial") {
      console.log("initial");
      socket.send(outbound);
      return;
    }
    
    [...clients.entries()].forEach((client_data) => {
      if (client_data[1].protocol == userdata.protocol) {
        // console.log(client_data[1]);
        client_data[0].send(outbound);
      }
    });
  });

  socket.on("close", () => {
    const userdata = clients.get(socket);

    let message = { type: 'delete' };
    // Add identifying info
    message.sender = userdata.id;
    message.hue_rotate = userdata.hue_rotate;
    const outbound = JSON.stringify(message);

    [...clients.entries()].forEach((client_data) => {
      if (client_data[1].protocol == userdata.protocol) {
        client_data[0].send(outbound);
      }
    });

    console.log(`user ${message.sender} disconnected`);
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
  // let max_id = [...clients.values()].reduce((acc, curr) => {
  //   return curr.id > acc ? curr.id : acc;
  // }, 0);
  let max_id = Math.max(...[...clients.values()].map(client => client.id));
  if (!max_id || Math.abs(max_id) === Infinity) max_id = 0;
  return max_id + 1;
}

// https://www.educative.io/edpresso/how-to-escape-unescape-html-characters-in-string-in-javascript
function escape(htmlStr) {
   return htmlStr.replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#39;");        
}