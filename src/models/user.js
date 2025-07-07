const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
    },
    lastName: {
      type: String,
      minlength: 3,
      maxlength: 20,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not strong enough");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Gender data is not correct");
        }
      },
    },
    photoUrl: {
      type: String,
      trim: true,
      default:
        "	https://www.shutterstock.com/image-photo/crash-man-dummy-salute-260nw-2586666027.jpg",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Photo Url is not valid");
        }
      },
    },
    about: {
      type: [String],
      default: "It is the default about",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

// writing the helper function  for creating the token
userSchema.methods.getJWT = async function () {
  const token = await jwt.sign(
    {
      userId: this._id,
      emailId: this.emailId,
    },
    "shubhamgolhar",
    {
      expiresIn: "0d", // Token expiration time
    }
  );
  return token;
};

userSchema.methods.validatepassword = async function (passwordInputByUser) {
  const user = this;

  const passwordHash = user.password;

  const matchPassword = await bcrypt.compare(passwordInputByUser, passwordHash);

  return matchPassword;
};

module.exports = mongoose.model("User", userSchema);
