const express = require('express');
const router = express.Router();

const paypal_controller = require('../controllers/paypal.controller');

module.exports = function(){

  router.get('/token', paypal_controller.generarTokenPaypal);
  router.post('/payout', paypal_controller.generarPayoutPaypal);

  return router;
}