const fs = require('fs');
const path = require('path');

const axios = require('axios');
const uniqid = require('uniqid');
const http = require('https');

const controller = {

  generarTokenPaypal: async function(req, res){

    console.log('Ruta activada');

    let username = 'AYlmUFKawzpk_ud8eL_Fly4_UxgQF8E1JIgShw3EjD0gzK5l0MSyuO-GNgfw6fDQhAbOe6MSIfnmZdxs';
    let password = 'EK8VQRKHFrPxRjf8Xd5F7IObwZhQnG9pueQ47kJphfTsTYymLaMUZ7VoxJNQHPcas6JwHEfSoDirtcaL';

    (async () => {

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

        return res.status(200).send({
          status : 'success',
          message: 'Su token es:',
          access_token : access_token,
          token_type: token_type
        });

      } catch (error) {

        console.log('error: ', error);

        return res.status(400).send({
          status : 'error',
          message : 'Error de paypal revisar logs'
        });
      }
    })();

  }

}

module.exports = controller;
