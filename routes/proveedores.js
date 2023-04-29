const { Router } = require('express');
const { check } = require('express-validator');
const { proveedoresGet, proveedorPost, proveedorPut, proveedorDelete } = require('../controllers/proveedorController');

const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.get('/', [
  validarJWT,
  validarCampos,
], proveedoresGet); 

router.post('/', [
  validarJWT,
  validarCampos,
], proveedorPost); 

router.put('/', [
  validarJWT,
  validarCampos,
], proveedorPut); 

router.delete('/:id/:estado', [
  validarJWT,  
  validarCampos
], proveedorDelete); 


module.exports = router;



