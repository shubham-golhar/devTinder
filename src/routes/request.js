const express = require("express");
const mongoose = require("mongoose");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
//send request and intrested or ignored (sendind intrest)
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const FromidString = fromUserId.toString();

      const allowedStatus = ["ignored", "intrested"];
      //status lebel validation
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Status type is invalid",
          status: status,
        });
      }

      // Properly compare ObjectIds
      if (FromidString === toUserId) {
        return res
          .status(400)
          .json({ message: "Cannot send request to yourself" });
      }

      const checkToUserId = await User.findById(toUserId);
      if (!checkToUserId) {
        throw new Error("This user does not exist");
      }
      const checkExistingConnection = await connectionRequest.findOne({
        $or: [
          {
            fromUserId: fromUserId,
            toUserId: toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      if (checkExistingConnection) {
        return res.status(400).send({
          message: "Request already exist",
        });
      }

      const connectionRequests = new connectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequests.save();

      res.json({
        message: "Connection request send successfully",
        data,
      });
    } catch (error) {
      res.status(400).send("Something went wrong");
    }
  }
);

// accept or reject the request
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const status = req.params.status;
      const requestId = req.params.requestId;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "this status is not allowed" });
      }

      const checkRequestIdExist = await connectionRequest
        .findOne({
          _id: requestId,
          toUserId: loggedInUser._id,
          status: "intrested",
        })
        .populate("fromUserId", [
          "firstName",
          "lastName",
          "age",
          "gender",
          "skills",
        ]);

      if (!checkRequestIdExist) {
        res.status(400).json({ message: "Request not found" });
      }

      checkRequestIdExist.status = status;

      const data = await checkRequestIdExist.save();

      res.json({ message: "connection request " + status, data });
    } catch (error) {
      res.status(400).send("Something went wrong");
    }
  }
);

// get all the pending request for the loggedin user

requestRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedinUser = req.user;

    const findAllPendingrequest = await connectionRequest.find({
      toUserId: loggedinUser._id,
      status: "intrested",
    });
  } catch (error) {}
});

module.exports = requestRouter;
