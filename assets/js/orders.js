function updateLoginButton() {
  const userName = sessionStorage.getItem('userName');
  const loginBtn = document.getElementById('loginBtn');

  if (userName) {
    loginBtn.textContent = `Hi ${userName}!`;
  } else {
    loginBtn.textContent = 'LOGIN';
  }
}
updateLoginButton();

document.addEventListener("DOMContentLoaded", async function () {
  const userEmail = sessionStorage.getItem('email');

  const orders = await fetchOrders(userEmail);
  addOrdersToList(orders);
  setupItemButtons();
});

async function fetchOrders(email) {
  const idToken = sessionStorage.getItem('idToken');
  
  if (idToken) {
    try {
      const response = await fetch(`/api/orders?email=${email}`, {
        headers: {
          'Authorization': `${idToken}`,
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  } else {
    console.error('idToken not found in sessionStorage');
    return [];
  }
}

function addOrdersToList(orders) {
  const listGroup = document.querySelector(".list-group");
  orders.forEach((order) => {
    const listItem = document.createElement("a");
    listItem.href = "#";
    listItem.className = "custom-link item-btn";
    listItem.setAttribute("data-id", order._id.toString().substring(0,3));
    listItem.setAttribute("data-bs-toggle", "modal");
    listItem.setAttribute("data-bs-target", "#ordersModal");

    listItem.innerHTML = `
      <li class="list-group-item custom-list-item">
        <div><strong>ID:</strong> ${order._id.toString().substring(0,3)}</div>
        <div><strong>Location:</strong> ${order.place}</div>
        <div><strong>Date:</strong> ${formatDate(order.date)}</div>
      </li>
    `;

    listGroup.appendChild(listItem);
  });
}

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

function updateModalContent(itemDetails) {
  document.querySelector(".modal-body div:nth-child(3)").innerHTML = `<strong>ID:</strong> ${itemDetails.id}`;
  document.querySelector(".modal-body div:nth-child(4)").innerHTML = `<strong>Location</strong> ${itemDetails.place}`;
  document.querySelector(".modal-body div:nth-child(5)").innerHTML = `<strong>Date:</strong> ${itemDetails.date}`;
}

function formatDate(isoDateString) {
  const date = new Date(isoDateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${day}/${month}/${year}`;
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
