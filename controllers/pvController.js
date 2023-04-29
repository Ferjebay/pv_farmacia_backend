const { response } = require('express');
const MySQL = require('../database/config');

const puntos_ventasGet = async (req, res = response) =>{
    const mysql = new MySQL();

    try{
        const query = `SELECT * FROM puntos_ventas`;

        const puntos_ventas = await mysql.ejecutarQuery( query );
                
        res.json({ puntos_ventas })        
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const pvPost = async (req, res = response) =>{
    const { punto_emision, nombre, direccion } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        const query = `INSERT INTO puntos_ventas(nombre, punto_emision, direccion) 
                VALUES( '${ nombre }', '${ punto_emision }', '${ direccion }' )`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "punto de venta creado" })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Error, no se logro guardar al proveedor'
        })
    }
}

const pvPut = async (req, res = response) =>{
    const { id, nombre, punto_emision, direccion } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        let query = `UPDATE puntos_ventas SET 
            nombre        = '${ nombre }',
            punto_emision = '${ punto_emision }',
            direccion     = '${ direccion }' WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "punto de venta editado" })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Error, no se logro guardar al proveedor'
        })
    }
}

const setEstado = async (req, res = response) =>{
    const { id, estado } = req.params;
    const mysql = new MySQL();

    try {
        const query = `UPDATE puntos_ventas SET estado = ${ estado } WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Punto de Venta Actualizado" })        
    } catch (error) {
        return res.json({ msg: 'Error al eliminar al proveedor' })
    }
}

const borrarPV = async (req, res = response) =>{
    const { id } = req.params;
    const mysql = new MySQL();

    try {
        const query = `DELETE FROM puntos_ventas WHERE id = ${ id };`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Punto de Venta Eliminado Exitosamente" })        
    } catch (error) {
        res.status(500).json({ message: 'Error, este punto de venta no se puede eliminar' })
    }
}

module.exports = {
  borrarPV,
  puntos_ventasGet,
  pvPost,
  pvPut,
  setEstado
}