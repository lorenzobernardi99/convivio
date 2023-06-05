const express = require('express');
const path = require('path');
const port = 5500;


const app = express();
const getAccessToken = async () => {
  const clientId ="AReTncnN3aPDxsTEaxDl-NDTVAH8-2jbmx5ohXHBY61S25skKGHwOptQAvOlgnQo7dmULtgRmT8sN84o";
  const appSecret =
    "EPccNOqICauWqlXv5iszOG92L8NbpJ_VE7RNnFqsH4GTb0WABDokCxy-cxnoUAU9WOk5z5ILRYKtKAsD";
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

app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../paypal.html'));
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
  console.log("listening on http://localhost:" + port);
});
