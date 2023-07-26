const { Router } = require('express');
const { check } = require('express-validator');

const { 
  articuloPost, 
  articulosDelete, 
  articuloPut, 
  contarArticulos, 
  getArticuloByCodBarra,
  productByExpirar,
  updateDate} = require('../controllers/articuloController');
const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.post('/', [
  validarJWT,
  validarCampos,
], articuloPost); 

router.get('/productosByExpirar', [
  validarJWT,
  validarCampos,
], productByExpirar); 

router.post('/contarArticulos', [
  validarJWT,
  validarCampos,
], contarArticulos); 

router.put('/:articulo_id', [
  validarJWT,
  validarCampos,
], articuloPut); 

router.put('/updateDate/:articulo_id', [
  validarJWT,
  validarCampos,
], updateDate); 

router.delete('/:articulo_id', [
  validarJWT,  
  validarCampos
], articulosDelete); 

router.get('/:codBarra/:pv_id', [
  validarJWT,  
  validarCampos
], getArticuloByCodBarra); 

module.exports = router;



