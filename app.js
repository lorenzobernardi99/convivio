const express = require('express');
const path = require('path')
const db = require("./assets/js/db");
const User = require('./assets/js/userModel');
const Order = require('./assets/js/orderModel');
const validateToken = require('./assets/js/tokenChecker');
const port = 5500;
const { OAuth2Client } = require('google-auth-library');
const googleClientId = '12439243694-e7sdb14hefrbgge7vc74g6cv4r59a3hd.apps.googleusercontent.com';
const client = new OAuth2Client(googleClientId);

db.connect();

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

app.post('/api/orders', async (req, res) => {
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

app.listen(port, () => {
  console.log('Server running on http://localhost:' + port);
});
