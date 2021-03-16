const paypal = require('paypal-rest-sdk');
const express = require('express');
const routes = require('./routes');
const path = require('path');
const payoutController = require("./controllers/paypal.controller");


const app = express();

const cors = require("cors");
const axios = require('axios');
const uniqid = require('uniqid');
const http = require('https');

const admin = require('firebase-admin');

const serviceAccount = require('./slashwise-firebase-adminsdk-zp5of-5e9e667355.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({ extended:false }));
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type'); //something's missing...
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
})

app.use('/api/paypal', routes());

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AYlmUFKawzpk_ud8eL_Fly4_UxgQF8E1JIgShw3EjD0gzK5l0MSyuO-GNgfw6fDQhAbOe6MSIfnmZdxs',
  'client_secret': 'EK8VQRKHFrPxRjf8Xd5F7IObwZhQnG9pueQ47kJphfTsTYymLaMUZ7VoxJNQHPcas6JwHEfSoDirtcaL'
});

app.post('/pay', (req, res) => {

  const amount = req.query.price;
  const payerEmail = req.query.email;
  const payeeEmail = req.query.targetEmail;
  const payerID = req.query.currUserID;
  const payeeID = req.query.targetID;
  const groupID = req.query.groupID;

  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": `https://slashwise-backend-live.herokuapp.com/success?price=${amount}&payerEmail=${payerEmail}&payeeEmail=${payeeEmail}&payerID=${payerID}&payeeID=${payeeID}&groupID=${groupID}`,
        "cancel_url": "http://cancel.url"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "item",
                "sku": "item",
                "price": amount,
                "currency": "JPY",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "JPY",
            "total": amount
        },
        "description": "This is the payment description."
    }]
  };
  
  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
        throw error;
    } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
})

app.get('/success', (req, res) => {
  const amount = req.query.price;
  const payerEmail = req.query.payerEmail;
  const payeeEmail = req.query.payeeEmail;
  const payerID = req.query.payerID;
  const payeeID = req.query.payeeID;
  const groupID = req.query.groupID;

  const execute_payment_json = {
    "payer_id": req.query.PayerID,
    "transactions": [{
        "amount": {
            "currency": "JPY",
            "total": amount
        }
    }]
  };

  const paymentId = req.query.paymentId;

  paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
    
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          const tokenDetails = await payoutController.generarTokenPaypal();
          const payoutDetails = await payoutController.generarPayoutPaypal(tokenDetails.access_token, payeeEmail, amount);

          if (payoutDetails.status === "success") {
            const collectionRef = db.collection("expenses");
            collectionRef.doc().set({
              "date": admin.firestore.Timestamp.fromDate(new Date()),
              "groupID": groupID,
              "name": "Paid through PayPal",
              "payees": [payeeID],
              "payer": payerID,
              "price": parseInt(amount)
            });
            res.sendStatus(200);``
          } else {
            res.sendStatus(400);
          }
      }
  });
});

app.listen(PORT, (req, res) => {
  console.log(`server started on port ${PORT}`)
});
