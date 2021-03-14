const express = require('express');
const router = express.Router();

const paypal_controller = require('../controllers/paypal.controller');

module.exports = function(){

  router.get('/paypal-token', paypal_controller.generarTokenPaypal);

  return router;
}