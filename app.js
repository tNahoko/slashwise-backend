const paypal = require('paypal-rest-sdk');
const express = require('express');
const routes = require('./routes');
const path = require('path');

const app = express();

const cors = require("cors");
const axios = require('axios');
const uniqid = require('uniqid');
const http = require('https');

let amount;

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

  amount = req.body.price;

  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://10.0.2.2:8000/success",
        "cancel_url": "http://cancel.url"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "item",
                "sku": "item",
                "price": amount,
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
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
  const execute_payment_json = {
    "payer_id": req.query.PayerID,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": amount
        }
    }]
  };

  const paymentId = req.query.paymentId;

  paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
    
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log("Get Payment Response");
          const response = JSON.stringify(payment);
          const email_receiver = response.payer_info.email;

          // token
          // payout
      }
  });
});

app.listen(PORT, (req, res) => {
  console.log(`server started on port ${PORT}`)
});
