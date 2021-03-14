const fs = require('fs');
const path = require('path');

exports.generarTokenPaypal = async (req, res) => {
  return res.status(200).send({
    status : 'success',
    message: 'Generando Token'
  })
}