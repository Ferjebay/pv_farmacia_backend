const { Router } = require('express');
const { check } = require('express-validator');
const { 
  laboratorioGet, 
  laboratorioPost, 
  laboratorioPut,
  setEstado,
  borrarLaboratorio } = require('../controllers/laboratorioController');

const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.get('/:estado', [
  validarJWT,
  validarCampos,
], laboratorioGet); 

router.post('/', [
  validarJWT,
  validarCampos,
], laboratorioPost ); 

router.put('/', [
  validarJWT,
  validarCampos,
], laboratorioPut); 

router.delete('/:id/:estado', [
  validarJWT,  
  validarCampos
], setEstado); 

router.delete('/:id', [
  validarJWT,  
  validarCampos
], borrarLaboratorio); 

module.exports = router;



