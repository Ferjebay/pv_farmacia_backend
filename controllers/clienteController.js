const { response } = require('express');
const MySQL = require('../database/config');

const getClientes = async (req, res = response) =>{
    const mysql = new MySQL();
    try{
        const query = `SELECT * FROM clientes ORDER BY id DESC`;

        const clientes = await mysql.ejecutarQuery( query );

        res.json({ clientes })        
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const clientePost = async (req, res = response) =>{
    const { nombres, tipo_documento, num_documento, email, celular, direccion } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        const query = `INSERT INTO clientes(nombres, tipo_documento, num_documento, direccion, celular, email) 
                VALUES( '${ nombres }', '${ tipo_documento }', '${ num_documento }', '${ direccion }', '${ celular }', '${ email }' )`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "cliente creado" })        
    } catch (error) {
        console.log(error);
        return res.json({
            msg: 'Error, no se logro guardar al proveedor'
        })
    }
}

const clientePut = async (req, res = response) =>{
    const { id, nombres, tipo_documento, num_documento, email, celular, direccion } = req.body;
    const mysql = new MySQL();

    try {
        //Verificar si el correo existe
        let query = `UPDATE clientes SET 
            nombres            = '${ nombres }',
            tipo_documento     = '${ tipo_documento }',
            num_documento   = '${ num_documento }',
            direccion          = '${ direccion }',
            celular            = '${ celular }',
            email              = '${ email }' WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "cliente editado" })        
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
        const query = `UPDATE clientes SET estado = ${ estado } WHERE id = ${ id }`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Cliente Actualizado exitosamente" })        
    } catch (error) {
        return res.json({ msg: 'Error al eliminar al proveedor' })
    }
}

const borrarCliente = async (req, res = response) =>{
    const { id } = req.params;
    const mysql = new MySQL();

    try {
        const query = `DELETE FROM clientes WHERE id = ${ id };`;
        await mysql.ejecutarQuery( query );
                
        res.json({ msg: "Cliente Eliminado Exitosamente" })        
    } catch (error) {
        res.status(500).json({ message: 'Error, este usuario no se puede eliminar' })
    }
}

module.exports = {
  borrarCliente,
  getClientes,
  clientePost,
  clientePut,
  setEstado
}