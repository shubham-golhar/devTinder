const express = require("express");

const app = express();

app.use("/testAdmin", (req, res, next) => {
  console.log("checking admin");

  const token = "xyz";
  const isAdminAuthorized = token === "xyzxxx"; // Simulating admin check
  if (!isAdminAuthorized) {
    res.send("Unauthorized access to admin route");
  } else {
    next();
  }
}); /////this is the middleware which  will work before each routes

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
