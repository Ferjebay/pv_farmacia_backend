const { Router } = require('express');
const { check } = require('express-validator');

const { rolesGet, rolesPost, rolesPut, getPermisosByRol, rolDelete } = require('../controllers/rolController');

const { validarCampos, validarJWT } = require('../middlewares');

const router = Router();

router.get('/', [
  validarJWT,
  validarCampos,
], rolesGet); 

router.get('/getPermisos/:rol_id', [
  validarCampos,
], getPermisosByRol); 

router.post('/', [
  validarJWT,
  check('rol', 'Ingresa el nombre del rol').not().isEmpty(),
  validarCampos,
], rolesPost); 

router.put('/:rol_id', [
  validarJWT,
  check('rol', 'Ingresa el nombre del rol').not().isEmpty(),
  validarCampos,
], rolesPut); 

router.delete('/:rol_id', [
  validarJWT,
  validarCampos,
], rolDelete); 

module.exports = router;



