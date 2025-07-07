const mongoose = require("mongoose");

const uri =
  "mongodb+srv://shubhamgolhar:RrTRn1yZ5nADuoq3@namastenodejs.aqfvvcq.mongodb.net/devTinder";

const connectDB = async () => {
  await mongoose.connect(uri);
};

module.exports = connectDB;
