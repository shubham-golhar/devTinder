const express = require("express");
const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../models/connectionRequest");

const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedinuser = req.user;

    const receivedConnections = await connectionRequest
      .find({
        toUserId: loggedinuser._id,
        status: "intrested",
      })
      .populate("fromUserId");
    res.json({
      message: "Data fetch successfully",
      data: receivedConnections,
    });
  } catch (error) {
    res.status(400).send("ERROR", error.message);
  }
});

module.exports = userRouter;
