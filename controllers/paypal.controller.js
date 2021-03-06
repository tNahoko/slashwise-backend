const fs = require('fs');
const path = require('path');

const axios = require('axios');
const uniqid = require('uniqid');
const http = require('https');

const controller = {

  generarTokenPaypal: async function(){

    console.log('Ruta activada');

    let username = 'AYlmUFKawzpk_ud8eL_Fly4_UxgQF8E1JIgShw3EjD0gzK5l0MSyuO-GNgfw6fDQhAbOe6MSIfnmZdxs';
    let password = 'EK8VQRKHFrPxRjf8Xd5F7IObwZhQnG9pueQ47kJphfTsTYymLaMUZ7VoxJNQHPcas6JwHEfSoDirtcaL';

    try {
      const { data: { access_token, token_type } } = await axios({
        url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'en-US',
          'content-type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: username,
          password: password,
        },
        params: {
          grant_type: 'client_credentials',
        },

      });

      return {
        status: "success",
        access_token: access_token,
        token_type: token_type
      };

      // return res.status(200).send({
      //   status : 'success',
      //   message: 'Su token es:',
      //   access_token : access_token,
      //   token_type: token_type
      // });

    } catch (error) {

      console.log('error: ', error);

      // return res.status(400).send({
      //   status : 'error',
      //   message : 'Error de paypal revisar logs'
      // });

      return {
        status: "error"
      };
    }
  },

  generarPayoutPaypal: async function (token, email, amount) {

    let modo = 'EMAIL';
    let batch_code = uniqid();

    const options = {
      "method" : "POST",
      "hostname" : "api.sandbox.paypal.com",
      "port": null,
      "path": "/v1/payments/payouts",
      "headers": {
        "accept": "application/json",
        "authorization": "Bearer " + token,
        "content-type": "application/json"
      }
    };

    const data = await http.request(options, function (res) {
      let chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function(){
        let body = Buffer.concat(chunks);
      })
    });

    if (modo == 'EMAIL') {
      let monto_a_cobrar = amount;

      data.write(JSON.stringify({ 
        sender_batch_header:
        { 
          sender_batch_id : batch_code,
          recipient_type: 'EMAIL',
          email_subject : 'Pago realizado',
        },
        items: [{
          amount: { 
            value: monto_a_cobrar, 
            currency: "JPY" 
          },
          receiver: email,
          note: 'Pago desde el backend con node, token working'
        }]
      }));
      
      data.end();

      // return res.status(200).send({
      //   status : 'success',
      //   message: 'Pago realizado a : ' + email
      // });

      return {
        status: "success",
        message: email,
      };
    }

  }

}

module.exports = controller;
