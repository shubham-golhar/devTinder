const express = require("express");

const connectDB = require("./config/database");
const User = require("./models/user");
const app = express();

app.use(express.json());

app.post("/signup", async (req, res) => {
  console.log("Request body:", req.body);
  const { firstName, lastName, emailId, password, age } = req.body;

  const user = new User(req.body);

  try {
    await user.save(); //this save() function return promose
    res.send("User created successfully");
  } catch (error) {
    res.status(400).send("Error creating user: " + error.message);
  }
});

app.get("/user", async (req, res) => {
  const email = req.body.emailId;
  try {
    const users = await User.findOne({ emailId: email });
    // const users = await User.find({ emailId: email });
    // if (users.length === 0) {
    //   res.status(404).send("User not found");
    // } else {
    //   res.send(users);
    // }

    if (!users) {
      res.status(404).send("User not found");
    } else {
      res.send(users);
    }
  } catch (error) {
    res.status(400).send("Error fetching user: " + error.message);
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(400).send("Error fetching user: " + error.message);
  }
});

app.delete("/deleteUser", async (req, res) => {
  const userId = req.body.userId;
  console.log("User ID to delete:", userId);
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send("User deleted successfully");
    }
  } catch (error) {
    res.status(400).send("Error deleting user: " + error.message);
  }
});

app.patch("/user", async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;

  try {
    const allowedUpdates = [
      "userId",
      "photourl",
      "about",
      "gender",
      "age",
      "skills",
    ];
    const isUpdateAllowed = Object.keys(data).every((key) =>
      allowedUpdates.includes(key)
    );
    if (!isUpdateAllowed) {
      throw new Error("Invalid update fields");
    }

    let finduser = await User.findByIdAndUpdate({ _id: userId }, data, {
      runValidators: true,
      new: true,
    });
    if (!finduser) {
      res.status(404).send("Not found");
    } else {
      res.send({
        message: "User updated successfully",
        user: finduser,
      });
    }
  } catch (error) {
    res.status(400).send("Error updating user: " + error.message);
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
