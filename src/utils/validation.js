const validator = require("validator");
const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName || !lastName || !emailId || !password) {
    throw new Error("All fields are required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

const validateLoginData = (req) => {
  const { emailId, password } = req.body;

  if (!emailId || !password) {
    throw new Error("All fields are required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

const validateEditProfiledata = (req) => {
  const allowedFiledsToUpdate = [
    "firstName",
    "lastName",
    "emailId",
    "age",
    "skills",
    "about",
    "gender",
  ];

  const isdatatoupdate = Object.keys(req.body).every((key) =>
    allowedFiledsToUpdate.includes(key)
  );
  if (!isdatatoupdate) {
    throw new Error("Invalid fields to update");
  } else {
    return isdatatoupdate;
  }
};

const validateEditPassword = (req) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new Error("All fields are required");
  } else if (!validator.isStrongPassword(newPassword)) {
    throw new Error("Password is not strong enough");
  }
};
module.exports = {
  validateSignupData,
  validateLoginData,
  validateEditProfiledata,
  validateEditPassword,
};
