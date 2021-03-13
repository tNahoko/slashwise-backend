const paypal = require('./');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AYlmUFKawzpk_ud8eL_Fly4_UxgQF8E1JIgShw3EjD0gzK5l0MSyuO-GNgfw6fDQhAbOe6MSIfnmZdxs',
  'client_secret': 'EK8VQRKHFrPxRjf8Xd5F7IObwZhQnG9pueQ47kJphfTsTYymLaMUZ7VoxJNQHPcas6JwHEfSoDirtcaL',
  'headers' : {
    'custom': 'header'
  }
});