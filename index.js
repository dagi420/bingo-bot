const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const sequelize = require("./config/db"); // Ensure this points to the correct file
const routes = require("./routes");
const bot = require("./telegram/bot");
const { initializeSocket } = require("./socket");
require("dotenv").config();

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

const server = http.createServer(app);
const port = process.env.PORT || 3001;
sequelize.sync().then(
  () => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}}`);
    });
  },
  (err) => {
    console.log({ err });
  }
);
app.use("/", routes);

initializeSocket(server);

app.get("/", (req, res) => {
  res.send("Server is running");
});
