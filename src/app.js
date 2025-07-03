const express = require("express");

const app = express();

const { adminAuth } = require("./middlewares/auth");

app.use("/testAdmin", adminAuth);

app.get("/testAdmin", (req, res) => {
  console.log("Admin route accessed");
  res.send("Admin route is working");
});

app.post("/testAdmin", (req, res) => {
  console.log("Admin POST route accessed");
  res.send("Admin POST route is working");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
