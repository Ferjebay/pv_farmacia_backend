const { Router } = require('express');
const { check } = require('express-validator');
const { 
  getNumFactura, 
  addVenta, 
  getVentas, 
  anularVenta, 
  detalleVenta, 
  puntoVentasGet} = require('../controllers/ventaController');

const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.get('/getNoFactura', [
  validarJWT,
  validarCampos,
], getNumFactura); 

router.get('/getPV', [
  validarJWT,
  validarCampos,
], puntoVentasGet); 

router.post('/consulta', [
  validarJWT,
  validarCampos,
], getVentas); 

router.put('/:factura_id', [
  validarJWT,
  validarCampos,
], anularVenta); 

router.get('/:factura_id', [
  validarJWT,
  validarCampos,
], detalleVenta); 

router.post('/add', [
  validarJWT,
  validarCampos,
], addVenta); 

module.exports = router;



