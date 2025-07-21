const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignore", "intrested", "accepted", "rejected"],
        message: `{VALUE} is not the valid type.`,
      },
    },
  },
  {
    timestamps: true,
  }
);

//this compound index
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// connectionRequestSchema.pre("save", function (next) {
//   const connectionRequest = this;

//   if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
//     console.log("122");
//     const error = new Error("Cannot send request to yourself.");
//     return next(error); // Passes error to Mongoose, stops the save
//   }

//   next(); // Continue if no issue
// });
//how to user pre middleware or we can co validation
module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
