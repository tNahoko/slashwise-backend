const paypal = require('./');
const express = require('express');
const app = express();
const cors = require("cors");

const axios = require('axios');
const uniqid = require('uniqid');
const http = require('https');

const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({ extended:false }));
app.use(express.json());

let amount;

// Payment
app.post('/pay', (req, res) => {

  console.log(req.body);
  amount = req.body.price;

  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "https://slashwise-backend.herokuapp.com/success",
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
        console.log("Create Payment Response");
        console.log(payment);
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
          console.log(JSON.stringify(payment));
      }
  });
});

// Payout

app.listen(PORT, (req, res) => {
  console.log(`server started on port ${PORT}`)
});