const { Router } = require('express');
const { check } = require('express-validator');
const { puntos_ventasGet, pvPost, pvPut, setEstado, borrarPV, imprimirTicket } = require('../controllers/pvController');

const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.get('/:estado', [
  validarJWT,
  validarCampos,
], puntos_ventasGet); 

router.get('/imprimirTicket', [
  // validarJWT,
  validarCampos,
], imprimirTicket); 

router.post('/', [
  validarJWT,
  validarCampos,
], pvPost); 

router.put('/', [
  validarJWT,
  validarCampos,
], pvPut); 

router.delete('/:id/:estado', [
  validarJWT,  
  validarCampos
], setEstado); 

router.delete('/:id', [
  validarJWT,  
  validarCampos
], borrarPV); 

module.exports = router;



