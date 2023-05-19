function getLoggedInUserName() {
  return sessionStorage.getItem('userName');
}

function updateLoginButton() {
  const userName = getLoggedInUserName();
  const loginBtn = document.getElementById('loginBtn');

  if (userName) {
    loginBtn.textContent = `Hi ${userName}!`;
  } else {
    loginBtn.textContent = 'LOGIN';
  }
}

updateLoginButton();

//temporary test
document.addEventListener("DOMContentLoaded", function() {
  setupItemButtons();
});

function setupItemButtons() {
  const modal = document.getElementById("ordersModal");
  const itemButtons = document.querySelectorAll(".item-btn");

  itemButtons.forEach((itemBtn) => {
    itemBtn.addEventListener("click", (e) => {
      const itemId = e.currentTarget.getAttribute("data-id"); // Get the data-id attribute value
      const itemDetails = fetchItemDetails(itemId);
      updateModalContent(itemDetails);
      $(modal).modal("show");
    });
  });
}

// To change with actual db fetching, now it's only a mock
function fetchItemDetails(itemId) {
  return {
    id: itemId,
    location: `St ${itemId}`,
    date: "16/05/2023",
    price: `€10.00`,
  };
}

function updateModalContent(itemDetails) {
  document.querySelector(".modal-body div:nth-child(3)").innerHTML = `<strong>ID:</strong> ${itemDetails.id}`;
  document.querySelector(".modal-body div:nth-child(4)").innerHTML = `<strong>Location</strong> ${itemDetails.location}`;
  document.querySelector(".modal-body div:nth-child(5)").innerHTML = `<strong>Date:</strong> ${itemDetails.date}`;
  document.querySelector(".modal-footer div").innerHTML = `<strong>Total cost:</strong> ${itemDetails.price}`;
}

// Closes the modal using close-btn
function setupCloseButton() {
  const closeButton = document.querySelector('.close-btn');
  closeButton.addEventListener('click', () => {
    const modal = document.querySelector('#ordersModal');
    $(modal).modal('hide');
  });
}

setupCloseButton();