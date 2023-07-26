const { response } = require('express');
const MySQL = require('../database/config');

const laboratorioGet = async (req, res = response) =>{
    const estado = req.params.estado;
    const mysql = new MySQL();

    try{
        let query = `SELECT * FROM laboratorios` 
        
        if ( estado === 'true' ) query += ` WHERE estado = 1` ;

        query += ` ORDER BY id DESC`;

        const laboratorios = await mysql.ejecutarQuery( query );
                
        res.json({ laboratorios })        
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const laboratorioPost = async (req, res = response) =>{
    const { nombre, abreviatura } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        const query = `INSERT INTO laboratorios(nombre, abreviatura) 
                    VALUES( '${ nombre }', '${ abreviatura }' )`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Laboratorio Agregado exitosamente" })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Error, no se logro guardar al proveedor'
        })
    }
}

const laboratorioPut = async (req, res = response) =>{
    const { id, nombre, abreviatura } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        let query = `UPDATE laboratorios 
                    SET nombre = '${ nombre }', abreviatura = '${ abreviatura }' 
                    WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Laboratorio editado exitosamente" })        
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
        const query = `UPDATE laboratorios SET estado = ${ estado } WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "ok" })        
    } catch (error) {
        return res.json({ msg: 'Error al actualizar el estado' })
    }
}

const borrarLaboratorio = async (req, res = response) =>{
    const { id } = req.params;
    const mysql = new MySQL();

    try {
        const query = `DELETE FROM laboratorios WHERE id = ${ id };`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Laboratorio eliminado" })        
    } catch (error) {
        res.status(500).json({ message: 'Error, Este laboratorio no se puede eliminar' })
    }
}

module.exports = {
    borrarLaboratorio,
    setEstado,
    laboratorioGet,
    laboratorioPost,
    laboratorioPut
}