const { Router } = require('express');
const { check } = require('express-validator');
const { 
  addCompra, 
  getCompras, 
  detalleCompra, 
  anularCompra
  } = require('../controllers/compraController');

const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.post('/consulta', [
  validarJWT,
  validarCampos,
], getCompras); 

router.post('/add', [
  validarJWT,
  validarCampos,
], addCompra); 

router.get('/:compra_id', [
  validarJWT,
  validarCampos,
], detalleCompra); 

router.put('/:compra_id', [
  validarJWT,
  validarCampos,
], anularCompra);

module.exports = router;



