const { Router } = require('express');
const { check } = require('express-validator');

const { usuarioGet, usuarioPost, usuarioDelete, usuarioPut, borrarUsuario } = require('../controllers/usuarioController');
const { existeUsuarioPorId } = require('../helpers/db-validators');

const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.get('/', [
  validarJWT,
  validarCampos,
], usuarioGet); 

router.post('/', [
  validarJWT,
  check('rol_id', 'Ingresa un rol valido').isNumeric(),
  check('nombres', 'El nombre es obligatorio').not().isEmpty(),
  check('apellidos', 'El apellidos es obligatorio').not().isEmpty(),
  check('cedula', 'Ingresa un numero de cedula valido').isLength({ min: 10, max: 10 }),
  check('celular', 'Ingresa un numero de celular valido').isLength({ min: 10, max: 10 }),
  check('email', 'Ingresa un email valido').isEmail(),
  validarCampos,
], usuarioPost); 

router.put('/:id', [
  validarJWT,
  check('id').custom(existeUsuarioPorId),
  validarCampos,
], usuarioPut); 

router.delete('/:id/:estado', [
  validarJWT,  
  check('id').custom(existeUsuarioPorId),
  validarCampos
], usuarioDelete); 

router.delete('/:id', [
  validarJWT,  
  check('id').custom(existeUsuarioPorId),
  validarCampos
], borrarUsuario); 

module.exports = router;



