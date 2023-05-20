const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://Jacopo:Mongoloide@atlascluster.ulvx08n.mongodb.net/mydatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(error => {
  console.error('Error connecting to MongoDB:', error);
});

// Define the schema for the Order model
const orderSchema = new mongoose.Schema({
  type: [String],
  date: String,
  time: String,
  place: String,
  guests: String,
  format: [String],
  apetizers: [String],
  mainCourses: [String]
});

// Create the Order model
const Order = mongoose.model('Order', orderSchema);

// Assuming you have the HTML form code in your question

// Get a reference to the orderForm and add a submit event listener
const orderForm = document.getElementById('orderForm');
orderForm.addEventListener('submit', handleFormSubmit);

// Function to handle the form submission
function handleFormSubmit(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // Get the selected checkboxes for each step
  const step1Inputs = document.querySelectorAll('#step-1 input[type="checkbox"]:checked');
  const step2DateInput = document.querySelector('#step-2 input[type="date"]');
  const step2TimeInput = document.querySelector('#step-2 input[type="time"]');
  const step3PlaceInput = document.querySelector('#step-3 input[type="text"]');
  const step4GuestsInput = document.querySelector('#step-4 input[type="text"]');
  const step5Inputs = document.querySelectorAll('#step-5 input[type="checkbox"]:checked');
  const formatOptions = document.querySelectorAll('#step-6 button');

  // Create an object to store the order data
  const order = {
    type: [],
    date: step2DateInput.value,
    time: step2TimeInput.value,
    place: step3PlaceInput.value,
    guests: step4GuestsInput.value,
    format: [],
    apetizers: [],
    mainCourses: [],
  };

  // Extract the selected checkboxes for step 1 (event type)
  step1Inputs.forEach(input => {
    order.type.push(input.name);
  });

  // Extract the selected checkboxes for step 5 (format options)
  step5Inputs.forEach(input => {
    order.format.push(input.name);
  });

  // Extract the selected format option for step 6 (apetizers or main courses)
  formatOptions.forEach(option => {
    option.addEventListener('click', function() {
      if (option.getAttribute('step_number') === '10') {
        // Go to apetizers step
        order.format.push('apetizers');
      } else if (option.getAttribute('step_number') === '20') {
        // Go to main courses step
        order.format.push('main courses');
      }

      // Send the order to the MongoDB database using Mongoose
      sendOrderToDatabase(order);
    });
  });
}

// Function to send the order to the MongoDB database
function sendOrderToDatabase(order) {
  // Assuming you have a Mongoose model for the orders collection called 'Order'

  // Create a new instance of the Order model with the order data
  const newOrder = new Order(order);

  // Save the order to the database
  newOrder.save(function(err) {
    if (err) {
      console.error('Error saving order:', err);
      return;
    }

    // Order saved successfully
    console.log('Order saved to the database:', newOrder);

    // Redirect to the success page
    window.location.href = 'order_success.html';
  });
}
}
