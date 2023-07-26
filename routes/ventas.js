const { Router } = require('express');
const { check } = require('express-validator');
const { 
  getNumFactura, 
  addVenta, 
  getVentas, 
  anularVenta, 
  detalleVenta, 
  puntoVentasGet,
  reimprimirFactura} = require('../controllers/ventaController');

const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.get('/getNoFactura/:pv_id', [
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

router.post('/imprimirFactura', [
  validarJWT,
  validarCampos,
], reimprimirFactura); 

module.exports = router;



