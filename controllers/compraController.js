const { response } = require('express');

const MySQL = require('../database/config');

const addCompra = async (req, res = response) => {

  const { 
    proveedor_id, 
    numComprobante, 
    descripcion,
    usuario_id, 
    detalle, 
    pv_id,
    valoresFactura 
  } = req.body;

  const mysql = new MySQL();

  //GUARDAR LA COMPRA
  try {
      let compra_id = await mysql.ejecutarQuery( 'SELECT id FROM compras ORDER BY id DESC LIMIT 1' );

      ( compra_id.length === 0 ) ? compra_id = 1 : compra_id = compra_id[0].id + 1 ;

      let queryInsertCompra = `INSERT INTO compras
      VALUES(${ compra_id }, ${ usuario_id }, ${ proveedor_id }, ${ pv_id }, '${ numComprobante }', '${ descripcion }', ${ valoresFactura.subtotal }, ${ valoresFactura.descuento }, ${ valoresFactura.iva }, ${ valoresFactura.total }, DATE_SUB(NOW(), INTERVAL 0 HOUR), DATE_SUB(NOW(), INTERVAL 0 HOUR), 1)`

      await mysql.ejecutarQuery( queryInsertCompra );

      let insertQueryDetalle = `INSERT INTO detalle_compras VALUES`
        
      detalle.forEach((articulo, index) => {
        insertQueryDetalle += ` (
          ${ compra_id }, 
          ${ articulo.id }, 
          ${ articulo.cant_venta }, 
          ${ articulo.f_c },
          ${ articulo.fracciones_total },
          ${ articulo.v_total })
          ${ ((index + 1) != detalle.length ) ? ',' : ';' }`
      });

      await mysql.ejecutarQuery( insertQueryDetalle );

      res.json({ msg: 'Compra Realizado Exitosamente' })

  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const getCompras = async (req, res = response) =>{

  const { desde = '', hasta = '', pv_id = '', filter = '' } = req.body;
  const mysql = new MySQL();

  try{
      let query = `SELECT c.*, p.razon_social AS proveedor, CONCAT(u.nombres, ' ', u.apellidos) AS usuario, 
        pv.nombre AS pv_nombre
        FROM compras c, proveedores p, usuarios u, puntos_ventas pv, detalle_compras dc, articulos a
        WHERE c.proveedor_id = p.id AND
        c.usuario_id = u.id AND
        c.pv_id = pv.id AND
        c.id = dc.compra_id AND
        dc.articulo_id = a.id`

        if (filter != ''){
          query += ` AND dc.compra_id = (SELECT c.id 
            FROM compras c WHERE c.num_comprobante = '${ filter }' LIMIT 1) 
            GROUP BY c.id ORDER BY c.id DESC`
        }else{
          if (pv_id != '' && filter == '') 
            query += ` AND pv.id = ${ pv_id }`
  
          if (desde != '' && hasta != '') 
            query += ` AND c.fecha_compra BETWEEN '${ desde }' AND '${ hasta }' GROUP BY c.id ORDER BY c.id DESC`
          else
            query += ` AND c.fecha_compra = SUBSTRING_INDEX(DATE_SUB(NOW(), INTERVAL 0 HOUR), ' ' ,1) GROUP BY c.id ORDER BY c.id DESC`
        } 

      const compras = await mysql.ejecutarQuery( query );

      res.json({ compras })
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const anularCompra = async (req, res = response) =>{
  const mysql = new MySQL();

  try{
    const querySumarStock = `SELECT a.id, a.fracciones_total, a.fxc, dc.cajas, dc.fracciones FROM detalle_compras dc, articulos a
          WHERE dc.compra_id = ${ req.params.compra_id } AND
          dc.articulo_id = a.id`;
      const listArticulos = await mysql.ejecutarQuery( querySumarStock );

      listArticulos.forEach( async( articulo ) => {
        let fraccionesCompradas = (articulo.fxc * articulo.cajas) + parseInt(articulo.fracciones)

        const querySumarStock = `UPDATE articulos 
                                SET fracciones_total = ${ fraccionesCompradas + articulo.fracciones_total }
                                WHERE id = ${ articulo.id }`;
        await mysql.ejecutarQuery( querySumarStock );
      })
      
      const query = `UPDATE compras SET estado = 0 WHERE id = ${ req.params.compra_id }`;
      await mysql.ejecutarQuery( query );

      res.json({ msg: 'Compra Anulada Exitosamente' })
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const detalleCompra = async (req, res = response) =>{
  const mysql = new MySQL();
  
  try{
      const query = `SELECT a.cod_barra, a.producto, dc.cajas, dc.fracciones, dc.subtotal, c.total, TRUNCATE(a.pvp, 2) AS 'pvp', TRUNCATE(a.p_unit, 2) AS 'p_unit', a.aplicaIva, a.descuento AS 'd_a'
      FROM compras c, detalle_compras dc, articulos a
      WHERE c.id = dc.compra_id AND
      dc.articulo_id = a.id AND
      dc.compra_id = ${ req.params.compra_id }`

      const detalleCompras = await mysql.ejecutarQuery( query );

      res.json({ detalleCompras })
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

module.exports = {
  addCompra,
  anularCompra,
  detalleCompra,
  getCompras,
}