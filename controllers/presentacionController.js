const { response } = require('express');
const MySQL = require('../database/config');

const presentacionGet = async (req, res = response) => {
    const estado = req.params.estado;
    const mysql = new MySQL();

    try{
        let query = `SELECT * FROM presentaciones`;

        if ( estado === 'true' ) query += ` WHERE estado = 1` ;

        query += ` ORDER BY id DESC`;

        const presentaciones = await mysql.ejecutarQuery( query );
                
        res.json({ presentaciones })        
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const presentacionPost = async (req, res = response) =>{
    const { nombre } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        const query = `INSERT INTO presentaciones(nombre) VALUES( '${ nombre }' )`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Presentacion Agregado exitosamente" })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Error, no se logro guardar al proveedor'
        })
    }
}

const proveedorPut = async (req, res = response) =>{
    const { id, nombre } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        let query = `UPDATE presentaciones SET nombre = '${ nombre }' WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Presentación editado exitosamente" })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Error, no se logro guardar al proveedor'
        })
    }
}

const presentacionDelete = async (req, res = response) =>{
    const { id, estado } = req.params;
    const mysql = new MySQL();

    try {
        const query = `UPDATE presentaciones SET estado = ${ estado } WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Presentacion eliminado exitosamente" })        
    } catch (error) {
        return res.json({ msg: 'Error al eliminar al proveedor' })
    }
}

const borrarPresentacion = async (req, res = response) =>{
    const { id } = req.params;
    const mysql = new MySQL();

    try {
        const query = `DELETE FROM presentaciones WHERE id = ${ id };`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Presentación Eliminado Exitosamente" })        
    } catch (error) {
        res.status(500).json({ message: 'Error, Esta presentación no se puede eliminar' })
    }
}

module.exports = {
    borrarPresentacion,
    presentacionDelete,
    presentacionGet,
    presentacionPost,
    proveedorPut
}