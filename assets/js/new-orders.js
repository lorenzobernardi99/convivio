// Function to handle form submission
function submitOrderForm() {
  // Get form data
  var formData = {
    type: $("input[name='type']:checked").val(),
    date: $("input[name='date']").val(),
    time: $("input[name='time']").val(),
    place: $("input[name='place']").val(),
    guests: $("input[name='guests']").val(),
    buffet: $("input[name='buffet']").is(":checked"),
    alacarte: $("input[name='alacarte']").is(":checked"),
    apetizer: $("input[name='apetizer']:checked").map(function () {
      return $(this).val();
    }).get(),
    maincourse: $("input[name='maincourse']:checked").map(function () {
      return $(this).val();
    }).get(),
    email: getCurrentUserEmail() // Include the logged-in user's email
  };


  // Send AJAX POST request
  $.ajax({
    url: "send-order.js",
    type: "POST",
    dataType: "json",
    data: formData,
    success: function (response) {
      // Handle success response
      console.log("Order submitted successfully");
      window.location.href = "order_success.html";
    },
    error: function (xhr, status, error) {
      // Handle error response
      console.log("An error occurred while submitting the form");
      window.location.href = "index.html";
    }
  });
}

// Function to get the email of the currently logged-in user
function getCurrentUserEmail() {
  // Retrieve the email from session storage
  return sessionStorage.getItem('Email') || '';
}


// Add event listener to form submit button
$("#orderForm").on("submit", function (event) {
  event.preventDefault(); // Prevent default form submission
  submitOrderForm(); // Call the function to submit the form
});
