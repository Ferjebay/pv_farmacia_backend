const { Router } = require('express');
const { check } = require('express-validator');
const { 
  presentacionPost, 
  borrarPresentacion, 
  categoriaGet, 
  categoriaPut,
  setEstado} = require('../controllers/categoriaController');

const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.get('/:estado', [
  validarJWT,
  validarCampos,
], categoriaGet); 

router.post('/', [
  validarJWT,
  validarCampos,
], presentacionPost); 

router.put('/', [
  validarJWT,
  validarCampos,
], categoriaPut); 

router.delete('/:id/:estado', [
  validarJWT,  
  validarCampos
], setEstado); 

router.delete('/:id', [
  validarJWT,  
  validarCampos
], borrarPresentacion); 

module.exports = router;



