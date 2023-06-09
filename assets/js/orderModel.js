const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  type: String,
  date: Date,
  time: String,
  place: String,
  guests: Number,
  format: {
    buffet: Boolean,
    alacarte: Boolean,
  },
  apetizers: [String],
  mainCourses: [String],
  email: String,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;