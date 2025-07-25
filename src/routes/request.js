const express = require("express");
const mongoose = require("mongoose");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_DATA = ["firstName", "lastName","gender","about","skills","age"];
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

    const findAllPendingrequest = await connectionRequest
      .find({
        toUserId: loggedinUser._id,
        status: "intrested",
      })
      .populate("fromUserId", USER_DATA);

    res.json({
      message: "Data fetched successfully",
      data: findAllPendingrequest,
    });
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

requestRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connections = await connectionRequest
      .find({
        $or: [
          { toUserId: loggedInUser._id, status: "accepted" },
          { fromUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", USER_DATA)
      .populate("toUserId", USER_DATA);

    const loggedInUserId = loggedInUser._id.toString();

    const data = connections.map(({ fromUserId, toUserId }) => {
      const fromId = fromUserId?._id?.toString();
      const toId = toUserId?._id?.toString();

      return fromId === loggedInUserId ? toUserId : fromUserId;
    });

    res.json({
      message: "Data fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).send("Something went wrong");
  }
});

requestRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedinUser = req.user;
    const page=parseInt(req.query.page) || 1 //convertig string to integer
    let limit=parseInt(req.query.limit) || 10

    limit = limit > 50 ? 50 :limit

    const skip=(page-1)*limit

    const connectionRequestSendedOrReceived = await connectionRequest
      .find({
        $or: [{ fromUserId: loggedinUser._id }, { toUserId: loggedinUser._id }],
      })
      .select("fromUserId toUserId")

    const hideFromFeed = new Set();

    connectionRequestSendedOrReceived.forEach((req) => {
      hideFromFeed.add(req.fromUserId.toString());
      hideFromFeed.add(req.toUserId.toString());
    });


   

    const remaningUsers = await User.find({

      $and:[
        {
          _id: { $nin: Array.from(hideFromFeed) } //function to convert the set into an array
        },
        {
          _id:{$ne:loggedinUser._id}
        }
      ]
     , //selecting the users only those are in feed showing expect from hideFromFeed array and loggedin user itself should not see himself in feed
    }).select(USER_DATA).skip(skip).limit(limit);;
    res.json({
      message: "data fetched successfully",
      data: remaningUsers,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).send("Something went wrong");
  }
});
module.exports = requestRouter;
