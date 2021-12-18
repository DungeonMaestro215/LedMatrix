// Import the things
const express = require('express');         // express web framework
const cors = require('cors');               // CORS
const path = require('path');               // Simplifies file paths
const favicon = require('serve-favicon');   // Serves the favicon
const cool = require('cool-ascii-faces');   // Fun addition ಠﭛಠ

// Path names
const html_path = path.join(__dirname, "public");
const fav_path = path.join(__dirname, "public", "images", "favicon.ico");

// Initialize the app
const app = express();
app.use(cors());
app.use(express.static(html_path));
app.use(favicon(fav_path));
const port = 3000;

// Send the page
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/ascii', (req, res) => {
    res.send(cool())
});

// Start serving
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});