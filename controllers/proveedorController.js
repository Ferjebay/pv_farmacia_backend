const { response } = require('express');
const MySQL = require('../database/config');

const proveedoresGet = async (req, res = response) =>{
    const estado = req.params.estado;
    const mysql = new MySQL();

    try{
        let query = `SELECT * FROM proveedores`;

        if ( estado === 'true' ) query += ` WHERE estado = 1` ;

        query += ` ORDER BY id DESC`;

        const proveedores = await mysql.ejecutarQuery( query );
                
        res.json({ proveedores })        
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const proveedorPost = async (req, res = response) =>{
    const { razon_social, tipo_documento, num_documento, email, celular, direccion } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        const query = `INSERT INTO proveedores(razon_social, direccion, tipo_documento, numero_documento, celular, email) 
                VALUES( '${ razon_social }', '${ direccion }', '${ tipo_documento }', '${ num_documento }', '${ celular }', '${ email }' )`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "proveedor creado" })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Error, no se logro guardar al proveedor'
        })
    }
}

const proveedorPut = async (req, res = response) =>{
    const { id, razon_social, tipo_documento, numero_documento, email, celular, direccion } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        let query = `UPDATE proveedores SET 
            razon_social       = '${ razon_social }',
            direccion          = '${ direccion }',
            tipo_documento     = '${ tipo_documento }',
            numero_documento   = '${ numero_documento }',
            celular            = '${ celular }',
            email              = '${ email }' WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "proveedor editado" })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Error, no se logro guardar al proveedor'
        })
    }
}

const proveedorDelete = async (req, res = response) =>{
    const { id, estado } = req.params;
    const mysql = new MySQL();

    try {
        const query = `UPDATE proveedores SET estado = ${ estado } WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "proveedor eliminado exitosamente" })        
    } catch (error) {
        return res.json({ msg: 'Error al eliminar al proveedor' })
    }
}

module.exports = {
  proveedorDelete,
  proveedoresGet,
  proveedorPost,
  proveedorPut
}