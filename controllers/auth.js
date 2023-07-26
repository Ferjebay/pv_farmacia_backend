const { response } = require('express');
const bcryptjs = require('bcryptjs');
const { generarJWT } = require('../helpers/generar-jwt');
const MySQL = require('../database/config');

const login = async (req, res = response) =>{
    try {
        var { email, password: userPassword } = req.body;
        const mysql = new MySQL();
        //Verificar si el correo existe
        const query = `SELECT u.*, r.nombre AS 'rol_name', pv.punto_emision, e.id AS empresa_id
                    FROM usuarios u, roles r, puntos_ventas pv, empresas e   
                    WHERE r.id = u.rol_id AND
                    u.pv_id = pv.id AND
                    pv.empresa_id = e.id AND
                    u.email = '${ email }' `;
        const usuario = await mysql.ejecutarQuery( query );

        if (!usuario || usuario.length === 0) {
            return res.status(400).json({
                msg: "ERROR - El correo esta incorrecto"
            })
        }
        // //Si el usuario esta activo
        if(!usuario[0].estado) {
            return res.status(400).json({
                msg: "ERROR - Este usuario se encuentra inactivo"
            })
        }
        // //Verificar contraseña
        const validPassword = bcryptjs.compareSync(userPassword, usuario[0].password);
        if(!validPassword){
            return res.status(400).json({
                msg: "ERROR - La contraseña es incorrecta"
            })
        }
        // //Generar JWT
        const { estado, password, cedula, celular, ...rest } = usuario[0];
        const token = await generarJWT( rest );

        res.json({
            msg: 'Login ok',
            token        
        })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Hable con el administrador'
        })
    }
}

module.exports = {
    login
}