const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const {
  validateSignupData,
  validateLoginData,
} = require("../utils/validation");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    //data validation
    validateSignupData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });
    await user.save(); //this save() function return promose
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send("Error creating user: " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    validateLoginData(req);
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    } else {
      // const matchPassword = await bcrypt.compare(password, user.password);
      const matchPassword = await user.validatepassword(password); // using the helper function from user model

      if (matchPassword) {
        // Generate a JWT token
        // const token = await jwt.sign(
        //   {
        //     userId: user._id,
        //     emailId: user.emailId,
        //   },
        //   "shubhamgolhar", //secreate key for jwt,
        //   {
        //     expiresIn: "0d", // Token expiration time
        //   }
        // );

        //get token from the helper function
        const token = await user.getJWT();
        res.cookie("token", token, {
          expires: new Date(Date.now() + 8 * 3600000), // Cookie expiration time
        });
        res.send("login successfully");
      } else {
        throw new Error("Invalid Credentials");
      }
    }
  } catch (error) {
    res.status(400).send("Error logging in: " + error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()), // Cookie expiration time
    });
    res.send("Logout successfully");
  } catch (error) {
    res.status(400).send("Error logging out: " + error.message);
  }
});

module.exports = authRouter;
