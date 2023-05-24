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
document.addEventListener("DOMContentLoaded", function() {
  setupItemButtons();
});

function setupItemButtons() {
  const modal = document.getElementById("ordersModal");
  const itemButtons = document.querySelectorAll(".item-btn");

  itemButtons.forEach((itemBtn) => {
    itemBtn.addEventListener("click", async (e) => {
      const itemId = e.currentTarget.getAttribute("data-id"); // Get the data-id attribute value
      const itemDetails = await fetchItemDetails(itemId);
      updateModalContent(itemDetails);
      $(modal).modal("show");
    });
  });
}

async function fetchItemDetails(itemId) {
  try {
    const response = await fetch(`db/${Id}`); 
    if (!response.ok) {
      throw new Error("Failed to fetch item details");
    }
    const itemDetails = await response.json();
    return itemDetails;
  } catch (error) {
    console.error(error);
    // Handle the error accordingly (e.g., show an error message to the user)
  }
}

function updateModalContent(itemDetails) {
  document.querySelector(".modal-body div:nth-child(3)").innerHTML = `<strong>ID:</strong> ${itemDetails.id}`;
  document.querySelector(".modal-body div:nth-child(4)").innerHTML = `<strong>Location</strong> ${itemDetails.place}`;
  document.querySelector(".modal-body div:nth-child(5)").innerHTML = `<strong>Date:</strong> ${itemDetails.date}`;
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
