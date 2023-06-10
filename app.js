const express = require('express');
const path = require('path')
const db = require("./assets/js/db");
const User = require('./assets/js/userModel');
const Order = require('./assets/js/orderModel');
const validateToken = require('./assets/js/tokenChecker');
const port = 63342;
const { OAuth2Client } = require('google-auth-library');
const googleClientId = '12439243694-e7sdb14hefrbgge7vc74g6cv4r59a3hd.apps.googleusercontent.com';
const client = new OAuth2Client(googleClientId);
const sendOrder = require('./send-order');
const orderRouter = require('./routes/orderRouter');


db.connect();

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().lean();
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).send('Error fetching orders');
  }
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './index.html'));
});

app.get('/orders', validateToken, (req, res) => {
  res.sendFile(path.resolve(__dirname, 'orders/orders.html'));
});

app.get('/orderform', validateToken, (req, res) => {
  res.sendFile(path.resolve(__dirname, './orderform.html'));
});

app.get('/confirmform', validateToken, (req, res) => {
  res.sendFile(path.resolve(__dirname, './order_success.html'));
});

app.post('/auth/google', async (req, res) => {
  const { id_token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email }).exec();
    if (!user) {
      user = new User({ email: payload.email, name: payload.given_name });
      await user.save().catch((err)=>{
        console.log("Error user: " + err);
      });
    }

    res.status(200).send('User authenticated');
  } catch (error) {
    console.error('Error verifying ID token:', error.message);
    res.status(401).send('Invalid ID token');
  }
});

app.post('/submitorder', async (req, res) => {
  try {
    const newOrder = new Order({
      type: req.body.type,
      date: req.body.date,
      time: req.body.time,
      place: req.body.place,
      guests: req.body.guests,
      format: {
        buffet: req.body.buffet,
        alacarte: req.body.alacarte,
      },
      apetizers: req.body.apetizer || [],
      mainCourses: req.body.maincourse || [],
      email: req.body.email,
    });

    await newOrder.save();
    res.json({ message: 'Order submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while submitting the form' });
  }
});
const sendOrder = require('./send-order');


app.use('/api/send-order', sendOrder);

app.get('/api/orders', validateToken, async (req, res) => {
  const email = req.query.email;
  if (email) {
    try {
      const orders = await Order.find({ email: email }).exec();
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      res.status(500).send('Error fetching orders');
    }
  } else {
    res.status(400).send('Email query parameter is missing');
  }
});
app.use('/api/dishes', async (req, res));


app.listen(port, () => {
  console.log('Server running on http://localhost:' + port);
});

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
  setupItemButtons(orders);
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

// app.js

app.post('/api/save-order-status', async (req, res) => {
  const { orderId, orderStatus } = req.body;

  try {
    const order = await Order.findOneAndUpdate({ _id: orderId }, { status: orderStatus }, { new: true });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'An error occurred while updating the order status' });
  }
});

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

function setupItemButtons(orders) {
  const modal = document.getElementById("ordersModal");
  const itemButtons = document.querySelectorAll(".item-btn");

  itemButtons.forEach((itemBtn) => {
    itemBtn.addEventListener("click", (e) => {
      const itemId = e.currentTarget.getAttribute("data-id");
      const matchingOrder = orders.find(order => order._id.toString().substring(0, 3) === itemId);

      if (matchingOrder) {
        const formatType = matchingOrder.format.buffet ? 'Buffet' : 'A la carte';
        const itemDetails = {
          id: matchingOrder._id.toString().substring(0, 3),
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