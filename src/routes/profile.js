const express = require("express");
const {
  validateEditProfiledata,
  validateEditPassword,
} = require("../utils/validation");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user; // user is attached to request object by userAuth middleware

    res.send({ user });
  } catch (error) {
    res.status(400).send("Error fetching profile: " + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  console.log("req body", req.body);
  try {
    if (!validateEditProfiledata(req)) {
      throw new Error("Invalid fields to update");
    } else {
      const loggedinuser = req.user;
      console.log("login usre", loggedinuser);
      Object.keys(req.body).forEach(
        (key) => (loggedinuser[key] = req.body[key])
      );

      await loggedinuser.save(); // Save the updated user document
      res.send({
        message: "Profile updated successfully",
        user: loggedinuser,
      });
    }
  } catch (error) {
    res.status(400).send("Error updating profile: " + error.message);
  }
});

profileRouter.patch("/profile/edit/password", userAuth, async (req, res) => {
  try {
    validateEditPassword(req);
    const loggedinusre = req.user;
    const { currentPassword, newPassword } = req.body;

    const matchCurrentPassword = await loggedinusre.validatepassword(
      currentPassword
    );

    if (!matchCurrentPassword) {
      throw new Error("Current password is incorrect");
    } else {
      const updatedPassword = await bcrypt.hash(newPassword, 10);
      loggedinusre.password = updatedPassword;
      await loggedinusre.save(); // Save the updated user document
      res.send({
        message: "Password updated successfully",
        user: loggedinusre.firstName,
      });
    }
  } catch (error) {
    res.status(400).send("Error updating password: " + error.message);
  }
});
module.exports = profileRouter;
