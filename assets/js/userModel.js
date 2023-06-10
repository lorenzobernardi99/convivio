const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const UserSchema = new Schema({
  id: {
      type: String,
  },
  name: {
      type: String,
      required: true
  },
  email: {
      type: String,
      required: true,
      unique: true
  },
  role: {
      type: Boolean,
      default: false
  }
});

const User = mongoose.model("User", UserSchema);
module.exports = User;