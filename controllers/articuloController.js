const { response } = require('express');
const MySQL = require('../database/config');


const contarArticulos = async (req, res = response) =>{
  const { desde, hasta, proveedor_id, page, rowsPerPage, busqueda, pv_id, tipoBusqueda, tipoEstado } = req.body;
  const mysql = new MySQL();
  try{
    let articulosContados = null;
    if (proveedor_id != '') {
      let query = `SELECT COUNT(a1.id) AS total, 
      (SELECT COUNT(a2.id) FROM articulos a2 WHERE a2.estado = 0`

        if (pv_id != '')
          query += ` AND a2.pv_id = ${ pv_id }`  

        if (desde != '' && hasta != '') 
          query += ` AND a2.fecha_creacion BETWEEN '${ desde }' AND '${ hasta }'`
      
        query += ` AND a2.proveedor_id = ${ proveedor_id }) AS vendidos,
      (SELECT COUNT(a3.id) FROM articulos a3 WHERE a3.estado = 1` 

        if (pv_id != '')
        query += ` AND a3.pv_id = ${ pv_id }`  
      
        if (desde != '' && hasta != '') 
          query += ` AND a3.fecha_creacion BETWEEN '${ desde }' AND '${ hasta }'`

        query += ` AND a3.proveedor_id = ${ proveedor_id }) AS en_stock
        FROM articulos a1 WHERE`  
      
      if (desde != '' && hasta != '') 
        query += ` a1.fecha_creacion  BETWEEN '${ desde }' AND '${ hasta }' AND`  

        query += ` a1.proveedor_id = ${ proveedor_id }`;   
      
        if (pv_id != '')
          query += ` AND a1.pv_id = ${ pv_id } `
      
        articulosContados = await mysql.ejecutarQuery( query );
    }
      
      const articulos = await getListArticulos( desde, hasta, proveedor_id, pv_id, page, rowsPerPage, busqueda, tipoBusqueda, tipoEstado );
      res.json({ articulosContados, articulos });        
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const getListArticulos = async(desde = '', hasta = '', proveedor_id = '', pv_id = '', page = 0, rowsPerPage, busqueda = '', tipoBusqueda, tipoEstado) => {
  const mysql = new MySQL();
  try{
      if (busqueda == 'sin-busqueda') busqueda = ''

      let query = `SELECT a.*, p.razon_social, pv.nombre AS pv_nombre,
        (SELECT COUNT(*) FROM articulos a, proveedores p, puntos_ventas pv 	
          WHERE a.proveedor_id = p.id AND a.pv_id = pv.id`

        if (proveedor_id != '')
          query += ` AND p.id = ${ proveedor_id } `

        if (pv_id != '')
          query += ` AND pv.id = ${ pv_id }`

        if (desde != '' && hasta != '')
          query += ` AND a.fecha_creacion BETWEEN '${desde}' AND '${hasta}'`
        
        if (tipoBusqueda == 'imei') 
          query += ` AND a.imei LIKE '%${busqueda}%'`
        if (tipoBusqueda == 'marca') 
          query += ` AND a.marca LIKE '%${busqueda}%'`
        if (tipoBusqueda == 'modelo') 
          query += ` AND a.modelo LIKE '%${busqueda}%'`

        if (tipoEstado == 'stock') 
          query += ` AND a.estado = 1`
        if (tipoEstado == 'vendidos') 
          query += ` AND a.estado = 0`
        
        query += `) AS totalArticulos`

      query += ` FROM articulos a, proveedores p, puntos_ventas pv 	
        WHERE a.proveedor_id = p.id AND a.pv_id = pv.id`;

      if (proveedor_id != '')
        query += ` AND p.id = ${ proveedor_id } `

      if (pv_id != '')
        query += ` AND pv.id = ${ pv_id } `
        
      if (desde != '' && hasta != '')
        query += ` AND a.fecha_creacion BETWEEN '${ desde }' AND '${ hasta }'`
      
      if (tipoBusqueda == 'imei') 
        query += ` AND a.imei LIKE '%${busqueda}%' `
      if (tipoBusqueda == 'marca') 
        query += ` AND a.marca LIKE '%${busqueda}%' `
      if (tipoBusqueda == 'modelo') 
        query += ` AND a.modelo LIKE '%${busqueda}%' `
      
      if (tipoEstado == 'stock') 
        query += `AND a.estado = 1 `
      if (tipoEstado == 'vendidos') 
        query += `AND a.estado = 0 `
      
      query +=` ORDER BY a.id DESC`
      
      if ( rowsPerPage != 0 ) 
        query += ` LIMIT ${ page }, ${ rowsPerPage }`;
      const articulos = await mysql.ejecutarQuery( query );
      return articulos;
  }catch (error) {
      console.log(error);
  }
}

const articuloPost = async (req, res = response) =>{
  const { marca, modelo, pv_id, proveedor_id, precio_base, detalle: detalleMovil , detalles } = req.body;
  const mysql = new MySQL();

  try {
      let query = 'INSERT INTO articulos(pv_id, proveedor_id, detalle, marca, modelo, precio_base, imei, color, fecha_creacion) VALUES'
      detalles.forEach((detalle, index) => {
        //Verificar si el correo existe
        query += ` ( 
            ${ pv_id }, 
            ${ proveedor_id }, 
            '${ detalleMovil }', 
            '${ marca }', 
            '${ modelo }', 
            ${ precio_base }, 
            '${ detalle.imei }', 
            '${ detalle.color }', 
            DATE_SUB(NOW(), INTERVAL 5 HOUR))
            ${ ((index + 1) != detalles.length ) ? ',' : ';' }`;
      });

      await mysql.ejecutarQuery( query );
              
      res.json({ msg: "articulos agregado exitosamente" })        
  } catch (error) {
      console.log(error);
      return res.json({
          msg: 'Error, no se logro guardar al usuario'
      })
  }
}

const articulosDelete = async (req, res = response) =>{
  const mysql = new MySQL();
  const { articulo_id } = req.params;

  try{
      const query = `DELETE FROM articulos WHERE id = ${ articulo_id }`;
      await mysql.ejecutarQuery( query );
      res.json({ msg: 'Articulo eliminado exitosamente' })        
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const articuloPut = async (req, res = response) => {
  let { proveedor_id, detalle, marca, modelo, precio_base, imei, color, pv_id } = req.body;
  const mysql = new MySQL();
  
  if ( proveedor_id != 6 ) detalle = '';

  try {
      let query = `UPDATE articulos SET 
          pv_id         = ${ pv_id },
          proveedor_id  = ${ proveedor_id },
          detalle       = '${ detalle }',
          marca         = '${ marca.toUpperCase() }',
          modelo        = '${ modelo.toUpperCase() }',
          precio_base   = ${ precio_base },
          imei          = '${ imei }',
          color         = '${ color }' 
          WHERE id = ${ req.params.articulo_id }`;

      await mysql.ejecutarQuery( query );
              
      res.json({ msg: "Articulo actualizado exitosamente" })        
  }catch (error){
      return res.json({ msg: error.sqlMessage })
  }
}

const getArticuloByIMEI = async (req, res = response) =>{
  const mysql = new MySQL();
  const articulo_imei = req.params.articulo_imei;
  try{
      const query = `SELECT * FROM articulos a 
                    WHERE imei = '${ articulo_imei }'`;

      const articulo = await mysql.ejecutarQuery( query );
      res.json({ articulo })        
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

module.exports = {
  articuloPut,
  articuloPost,
  articulosDelete,
  contarArticulos,
  getArticuloByIMEI
}