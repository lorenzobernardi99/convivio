const express = require('express');
const path = require('path')
const db = require("./assets/js/db");
const User = require('./assets/js/userModel');
const Order = require('./assets/js/orderModel');
const Dish = require('./assets/js/dishModel');
const validateToken = require('./assets/js/tokenChecker');
const port = 5500;
const { OAuth2Client } = require('google-auth-library');
const googleClientId = '12439243694-e7sdb14hefrbgge7vc74g6cv4r59a3hd.apps.googleusercontent.com';
const client = new OAuth2Client(googleClientId);
require('dotenv').config();

db.connect();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'about/about.html'));
});

app.get('/orders', validateToken, (req, res) => {
  res.sendFile(path.resolve(__dirname, 'orders/orders.html'));
});

app.get('/management', (req, res) => {
  res.sendFile(path.resolve(__dirname, './menu_admin.html'));
});

app.get('/orderform', validateToken, (req, res) => {
  res.sendFile(path.resolve(__dirname, './orderform.html'));
});

app.get('/confirmform', (req, res) => {
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

    res.status(200).json({ message: 'User authenticated', isAdmin: user.role });
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

app.get('/api/dishes', async (req, res) => {
try {
  // Fetch the appetizers and main dishes from the database
  const appetizers = await Dish.find({ type: 'appetizer' }).lean().exec();
  const mainDishes = await Dish.find({ type: 'mainCourse' }).lean().exec();

  res.json({ appetizers, mainDishes });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'An error occurred while fetching dishes' });
}
});

app.get('/api/orders', validateToken, async (req, res) => {
  const email = req.query.email;
  const isAdmin = req.query.isAdmin === 'true';
  
  try {
    let orders;
    if (isAdmin) {
      orders = await Order.find().exec();
    } else if (email) {
      orders = await Order.find({ email: email }).exec();
    } else {
      res.status(400).send('Email query parameter is missing');
      return;
    }
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).send('Error fetching orders');
  }
});

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

const getAccessToken = async () => {
  const clientId ="AReTncnN3aPDxsTEaxDl-NDTVAH8-2jbmx5ohXHBY61S25skKGHwOptQAvOlgnQo7dmULtgRmT8sN84o";
  const appSecret = process.env.PP_SECRET;
  const url = "https://api-m.sandbox.paypal.com/v1/oauth2/token";
  
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(url, {
      body: "grant_type=client_credentials",
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(clientId + ":" + appSecret).toString("base64"),
      },
    });
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createOrder = async () => {
  const url = "https://api-m.sandbox.paypal.com/v2/checkout/orders";
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "EUR",
          value: "40",
        },
      },
    ],
  };
  const headers = {
    Authorization: `Bearer ${await getAccessToken()}`,
    "Content-Type": "application/json",
  };
  
  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(url, {
      headers,
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(error);
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const capturePayment = async (orderID) => {
  const url = `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`;
  const headers = {
    Authorization: `Bearer ${await getAccessToken()}`,
    "Content-Type": "application/json",
  };

  try {
    const { default: fetch } = await import('node-fetch');
    const response = await fetch(url, {
      headers,
      method: "POST",
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(error);
    }
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

app.get("/paypal", (req, res) => {
  res.sendFile(path.resolve(__dirname, './paypal.html'));
});

app.post("/orders", async (req, res) => {
  const response = await createOrder();
  res.json(response);
});

app.post("/orders/:orderID/capture", async (req, res) => {
  const response = await capturePayment(req.params.orderID);
  res.json(response);
});

app.listen(port, () => {
  console.log('Server running on http://localhost:' + port);
});
