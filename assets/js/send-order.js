// Import the required modules
const express = require('express');
const mongoose = require('mongoose');

// Create an instance of Express
const app = express();

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb+srv://Lorenzo:Lorber031502@cluster0.vmlxnd9.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define the schema for your form data
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
});

// Create a model based on the schema
const Order = mongoose.model('Order', orderSchema);

// Configure Express to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the route to handle form submission
app.post('/api/orders', async (req, res) => {
  try {
    // Create a new order instance with the form data
    const newOrder = new Order({
      type: req.body.type,
      date: req.body.date,
      time: req.body.time,
      place: req.body.place,
      guests: req.body.guests,
      format: {
        buffet: req.body.buffet === 'on',
        alacarte: req.body.alacarte === 'on',
      },
      apetizers: req.body.apetizer || [],
      mainCourses: req.body.maincourse || [],
    });

    // Save the order to the database
    await newOrder.save();

    // Send a JSON response indicating success
    res.json({ message: 'Order submitted successfully' });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error(error);
    res.status(500).json({ error: 'An error occurred while submitting the form' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
