const express = require("express");
const bcrypt = require("bcrypt");
const connectDB = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { validateSignupData, validateLoginData } = require("./utils/validation");
const { userAuth } = require("./middlewares/auth");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
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
        res.cookie("token", token);
        res.send("login successfully");
      } else {
        throw new Error("Invalid Credentials");
      }
    }
  } catch (error) {
    res.status(400).send("Error logging in: " + error.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user; // user is attached to request object by userAuth middleware

    res.send({ user });
  } catch (error) {
    res.status(400).send("Error fetching profile: " + error.message);
  }
});

connectDB()
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });
