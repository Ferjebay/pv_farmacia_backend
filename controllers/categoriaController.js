const { response } = require('express');
const MySQL = require('../database/config');

const categoriaGet = async (req, res = response) => {
    const estado = req.params.estado;
    const mysql = new MySQL();

    try{
        let query = `SELECT * FROM categorias`;

        if ( estado === 'true' ) query += ` WHERE estado = 1` ;

        query += ` ORDER BY id DESC`;

        const categorias = await mysql.ejecutarQuery( query );
                
        res.json({ categorias })        
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const presentacionPost = async (req, res = response) =>{
    const { nombre, descripcion } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        const query = `INSERT INTO categorias(nombre, descripcion) 
                    VALUES( '${ nombre }', '${ descripcion }' )`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Categoria Agregada exitosamente" })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Error, no se logro guardar al proveedor'
        })
    }
}

const categoriaPut = async (req, res = response) =>{
    const { id, nombre, descripcion } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        let query = `UPDATE categorias 
                    SET nombre = '${ nombre }', descripcion = '${ descripcion }' WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Categoria editada exitosamente" })        
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
        const query = `UPDATE categorias SET estado = ${ estado } WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Categoria eliminado exitosamente" })        
    } catch (error) {
        return res.json({ msg: 'Error al eliminar al proveedor' })
    }
}

const borrarPresentacion = async (req, res = response) =>{
    const { id } = req.params;
    const mysql = new MySQL();

    try {
        const query = `DELETE FROM categorias WHERE id = ${ id };`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Categoria Eliminado Exitosamente" })        
    } catch (error) {
        res.status(500).json({ message: 'Error, este usuario no se puede eliminar' })
    }
}

module.exports = {
    borrarPresentacion,
    setEstado,
    categoriaGet,
    presentacionPost,
    categoriaPut
}