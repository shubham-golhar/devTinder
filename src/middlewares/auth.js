// export const adminAuth = (req, res, next) => {
//   console.log("checking admin");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

//   const token = "xyz";
//   const isAdminAuthorized = token === "xyz"; // Simulating admin check
//   if (!isAdminAuthorized) {
//     res.send("Unauthorized access to admin route");
//   } else {
//     next();
//   }
// };

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).send("Please login to continue");
    } else {
      const decodeData = await jwt.verify(token, "shubhamgolhar");

      const { userId, emailId } = decodeData;

      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      } else {
        req.user = user; // Attaching user to request object
        next();
      }
    }
  } catch (error) {
    res.status(400).send("Error in user authentication: " + error.message);
  }
};

module.exports = {
  userAuth,
};
