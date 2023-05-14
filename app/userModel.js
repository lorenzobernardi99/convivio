const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const UserSchema = new Schema({
    google: {
        id: {
            type: String,
        },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
  },
});


const User = mongoose.model("User", UserSchema);
module.exports = User;