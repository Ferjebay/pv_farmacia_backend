const { Router } = require('express');
const { check } = require('express-validator');
const { 
  proveedorPut,  
  presentacionPost, 
  presentacionGet,
  presentacionDelete,
  borrarPresentacion } = require('../controllers/presentacionController');

const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.get('/:estado', [
  validarJWT,
  validarCampos,
], presentacionGet); 

router.post('/', [
  validarJWT,
  validarCampos,
], presentacionPost); 

router.put('/', [
  validarJWT,
  validarCampos,
], proveedorPut); 

router.delete('/:id/:estado', [
  validarJWT,  
  validarCampos
], presentacionDelete); 

router.delete('/:id', [
  validarJWT,  
  validarCampos
], borrarPresentacion); 

module.exports = router;



