var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Order', new Schema({
    typeA: String,
    typeB: String,
    time: String,
    place: String

}));