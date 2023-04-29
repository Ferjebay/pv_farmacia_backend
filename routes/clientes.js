const { Router } = require('express');
const { check } = require('express-validator');
const { getClientes, clientePost, clientePut, setEstado, borrarCliente } = require('../controllers/clienteController');

const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.get('/', [
  validarJWT,
  validarCampos,
], getClientes); 

router.post('/', [
  validarJWT,
  validarCampos,
], clientePost); 

router.put('/', [
  validarJWT,
  validarCampos,
], clientePut); 

router.delete('/:id/:estado', [
  validarJWT,  
  validarCampos
], setEstado); 

router.delete('/:id', [
  validarJWT,  
  validarCampos
], borrarCliente); 

module.exports = router;



