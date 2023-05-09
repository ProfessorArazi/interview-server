const express = require("express");
const cors = require("cors");
require("./src/db/mongoose");
require("dotenv").config({ path: __dirname + "/.env" });
const userRouter = require("./src/routers/user");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(userRouter);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  res.send({ message: "working" });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started on port ${PORT}`));

module.exports = app;
