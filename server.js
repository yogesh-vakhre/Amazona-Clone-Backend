require("dotenv").config();
require("./config/database").connect();
const { PORT } = require("./config/app");
const http = require("http");
const app = require("./app");
const server = http.createServer(app);

const port = PORT || 8081;

// server listening
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
