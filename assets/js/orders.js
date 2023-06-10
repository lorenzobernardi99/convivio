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
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

  const orders = await fetchOrders(userEmail, isAdmin);
  addOrdersToList(orders);
  setupItemButtons(orders);
  isAdminSwitch();
});

async function fetchOrders(email, isAdmin) {
  const idToken = sessionStorage.getItem('idToken');
  
  if (idToken) {
    try {
      const response = await fetch(`/api/orders?email=${email}&isAdmin=${isAdmin}`, {
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
    listItem.setAttribute("data-id", order._id.toString().substring(0, 6));
    listItem.setAttribute("data-bs-toggle", "modal");
    listItem.setAttribute("data-bs-target", "#ordersModal");

    listItem.innerHTML = `
      <li class="list-group-item custom-list-item">
        <div><strong>ID:</strong> ${order._id.toString().substring(0, 6)}</div>
        <div><strong>Location:</strong> ${order.place}</div>
        <div><strong>Date:</strong> ${formatDate(order.date)}</div>
      </li>
    `;

    listGroup.appendChild(listItem);
  });
}

function setupItemButtons(orders) {
  const modal = document.getElementById("ordersModal");
  const itemButtons = document.querySelectorAll(".item-btn");

  itemButtons.forEach((itemBtn) => {
    itemBtn.addEventListener("click", (e) => {
      const itemId = e.currentTarget.getAttribute("data-id");
      const matchingOrder = orders.find(order => order._id.toString().substring(0, 6) === itemId);

      if (matchingOrder) {
        const formatType = matchingOrder.format.buffet ? 'Buffet' : 'A la carte';
        const itemDetails = {
          id: matchingOrder._id.toString().substring(0, 6),
          place: matchingOrder.place,
          date: formatDate(matchingOrder.date),
          time: matchingOrder.time,
          guests: matchingOrder.guests,
          formatType: formatType
        };
        updateModalContent(itemDetails);
        $(modal).modal("show");
      } else {
        console.log("Couldn't find a matching order");
      }
    });
  });
}      

function updateModalContent(itemDetails) {
  document.querySelector(".modal-body div:nth-child(3)").innerHTML = `<strong>ID:</strong> ${itemDetails.id}`;
  document.querySelector(".modal-body div:nth-child(4)").innerHTML = `<strong>Location</strong> ${itemDetails.place}`;
  document.querySelector(".modal-body div:nth-child(5)").innerHTML = `<strong>Date:</strong> ${itemDetails.date} at ${itemDetails.time}`;
  document.querySelector(".modal-body div:nth-child(6)").innerHTML = `<strong>Guests:</strong> ${itemDetails.guests}`;
  document.querySelector(".modal-body div:nth-child(7)").innerHTML = `<strong>Format Type:</strong> ${itemDetails.formatType}`;
}

function isAdminSwitch() {
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
  const modal = document.getElementById('ordersModal');
  const mainContent = modal.querySelector('.main-content');
  const aboutButton = document.querySelector('.navbar-nav .nav-item a');
  const ordersSectionHeader = document.querySelector('.orders-section h2');

  if (isAdmin) {
    // Admin view
    aboutButton.textContent = 'MENU MANAGEMENT';
    ordersSectionHeader.textContent = 'All Orders';
    mainContent.innerHTML = `
      <button type="button" class="close-btn" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="text-center mb-3">
        <h5 class="modal-title" style="margin-top: -1rem">Order Details</h5>
      </div>
      <div><strong>ID:</strong></div>
      <div><strong>Location:</strong></div>
      <div><strong>Date:</strong></div>
      <div><strong>Guests:</strong></div>
      <div><strong>Format Type:</strong></div>
      <div class="mt-3">
        <label for="orderStatus"><strong>Status:</strong></label>
        <select id="orderStatus" class="form-select">
          <option value="placed">Placed</option>
          <option value="paid">Paid</option>
          <option value="preparation">In Preparation</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
      <div class="mt-3">
        <button id="saveOrderStatusBtn" class="btn btn-primary">Save Status</button>
      </div>
    `;
  } else {
    // Client view
    aboutButton.textContent = 'ABOUT';
    ordersSectionHeader.textContent = 'Your Current Orders';
    mainContent.innerHTML = `
      <button type="button" class="close-btn" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="text-center mb-3">
        <h5 class="modal-title" style="margin-top: -1rem">Order Details</h5>
      </div>
      <div><strong>ID:</strong></div>
      <div><strong>Location:</strong></div>
      <div><strong>Date:</strong></div>
      <div><strong>Guests:</strong></div>
      <div><strong>Format Type:</strong></div>
      <div class="text-center mt-3">
        <div><strong>Description:</strong></div>
        <p class="mt-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
    `;
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('ordersModal');
  const saveButton = modal.querySelector('#saveOrderStatusBtn');

  saveButton.addEventListener('click', () => {
    const orderStatus = modal.querySelector('#orderStatus').value;

    fetch('/api/save-order-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: '<replace-with-order-id>',
        orderStatus: orderStatus,
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Order status saved:', data);
    })
    .catch(error => {
      console.error('Error saving order status:', error);
    });
  });
});

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
