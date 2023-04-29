const { response } = require('express');
const MySQL = require('../database/config');

const generarSecuencialNumerico = ( valor ) => {
  let secuencialActual = 9 - valor.toString().length;
  let resultado = '';

  for (let index = 0; index < secuencialActual; index++) resultado += '0'
  
  return `${resultado}${ valor }`
}

const puntoVentasGet = async (req, res = response) =>{
  const mysql = new MySQL();

  try{
      const query = `SELECT id, nombre FROM puntos_ventas`;

      const pv = await mysql.ejecutarQuery( query );
              
      res.json({ pv })        
  }catch (error){
      console.log(error);
      return res.json({ msg: 'Error al consultar los puntos de ventas en la DB' })
  }
}

const generarSecuencial = async (req, res = response) => {
  const mysql = new MySQL();
  try{
      const query = `SELECT COUNT(*) + 1 as totalFacturado FROM facturas`;

      const noFactura = await mysql.ejecutarQuery( query );
      const numeroSecuencial = generarSecuencialNumerico( noFactura[0].totalFacturado )

      return numeroSecuencial;
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const getNumFactura = async (req, res = response) => {
    try{      
        const numeroSecuencial = await generarSecuencial();
        res.json({ numeroSecuencial })        
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const addVenta = async (req, res = response) =>{
  let { cliente_id, numComprobante, usuario_id, pv_id, detalle, totalPago } = req.body;

    cliente_id = ( cliente_id == 'CONSUMIDOR FINAL' ) ? 3 : cliente_id

    //Consultar secuencial actual de la factura en la BD
    const numSecuancial = await generarSecuencial();
    const arrayNumComprobante = numComprobante.split('-');
    numComprobante = `${ arrayNumComprobante[0] }-${ arrayNumComprobante[1] }-${numSecuancial}`;

  const mysql = new MySQL();

  try{
      const query = `INSERT INTO facturas(cliente_id, usuario_id, pv_id, num_comprobante, 
          totalIva, totalPago, fecha, hora) 
          VALUES(${ cliente_id }, ${ usuario_id }, ${ pv_id }, '${ numComprobante }', 0.00, ${ totalPago }, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR))`;
      await mysql.ejecutarQuery( query );

      const factura_id = await mysql.ejecutarQuery( 'SELECT id FROM facturas ORDER BY id DESC LIMIT 1' );

      let insertQueryDetalle = `INSERT INTO detalle_factura(factura_id, articulo_id, detalle, precio_venta, total_iva, total) VALUES`
        
      detalle.forEach((articulo, index) => {
        insertQueryDetalle += ` (
          ${factura_id[0].id}, 
          ${ articulo.id }, 
          '${ articulo.detalle }', 
          ${ articulo.precio_venta },
          0,
          ${ articulo.precio_venta })
          ${ ((index + 1) != detalle.length ) ? ',' : ';' }`
      });

      await mysql.ejecutarQuery( insertQueryDetalle );
      res.json({ msg: 'Venta Realizado Exitosamente' })
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const getVentas = async (req, res = response) =>{

  const { desde = '', hasta = '', pv_id = '', filter = '' } = req.body;
  const mysql = new MySQL();

  try{
      let query = `SELECT f.*, c.nombres AS cliente, CONCAT(u.nombres, ' ', u.apellidos) AS usuario, 
        pv.nombre AS pv_nombre, SUM( df.total - a.precio_base ) AS estadoVenta
        FROM facturas f, clientes c, usuarios u, puntos_ventas pv, detalle_factura df, articulos a
        WHERE f.cliente_id = c.id AND
        f.usuario_id = u.id AND
        f.pv_id = pv.id AND
        f.id = df.factura_id AND
        df.articulo_id = a.id`

        if (filter != ''){
          query += ` AND df.factura_id = (SELECT f.id
            FROM facturas f, detalle_factura df, articulos a 
            WHERE f.id = df.factura_id and
            df.articulo_id = a.id and
            a.imei = '${ filter }' LIMIT 1) GROUP BY f.id ORDER BY f.id DESC`
        }else{
          if (pv_id != '' && filter == '') 
            query += ` AND pv.id = ${ pv_id }`
  
          if (desde != '' && hasta != '') 
            query += ` AND f.fecha BETWEEN '${ desde }' AND '${ hasta }' GROUP BY f.id ORDER BY f.id DESC`
          else
            query += ` AND f.fecha = SUBSTRING_INDEX(DATE_SUB(NOW(), INTERVAL 5 HOUR), ' ' ,1) GROUP BY f.id ORDER BY f.id DESC`
        } 

      const facturas = await mysql.ejecutarQuery( query );

      const estadoVentas = await getSumaGananciaAndPerdidas( desde, hasta, pv_id, filter );

      res.json({ facturas, estadoVentas })
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}
const getSumaGananciaAndPerdidas = async ( desde = '', hasta = '', pv_id = '', filter = '' ) => {
  const mysql = new MySQL();

  try{
      let query = `SELECT SUM( df.total - a.precio_base ) AS estadoVenta
      FROM detalle_factura df, articulos a, facturas f
      WHERE df.articulo_id = a.id AND
      df.factura_id = f.id AND f.estado = 1`;

      if (filter != '') {
        query += ` AND df.factura_id = ( SELECT f.id
                    FROM facturas f, detalle_factura df, articulos a 
                    WHERE f.id = df.factura_id and
                    df.articulo_id = a.id and
                    a.imei = '${ filter }' LIMIT 1)`
      } else {
        if (pv_id != '') 
            query += ` AND f.pv_id = ${ pv_id }`
  
        if (desde != '' && hasta != '') 
          query += ` AND f.fecha BETWEEN '${ desde }' AND '${ hasta }'`
        else
          query += ` AND f.fecha = SUBSTRING_INDEX(DATE_SUB(NOW(), INTERVAL 5 HOUR), ' ' ,1)`
      }

      query += ' AND ( df.total - a.precio_base )'

      const results = await Promise.all([ 
        await mysql.ejecutarQuery( query + ' < 0' ), 
        await mysql.ejecutarQuery( query + ' > 0' )
      ])
      
      return { perdidas: results[0][0].estadoVenta, ganancias: results[1][0].estadoVenta }
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const anularVenta = async (req, res = response) =>{
  const mysql = new MySQL();

  try{
      const query = `UPDATE facturas SET estado = 0 WHERE id = ${ req.params.factura_id }`

      await mysql.ejecutarQuery( query );

      res.json({ msg: 'Factura Anulada Exitosamente' })
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const detalleVenta = async (req, res = response) =>{
  const mysql = new MySQL();

  try{
      const query = `SELECT a.marca, a.modelo, a.imei, df.detalle, df.total, a.precio_base, ( df.total - a.precio_base) AS estadoVenta
                  FROM detalle_factura df, articulos a
                  WHERE df.articulo_id = a.id AND
                  df.factura_id = ${ req.params.factura_id }`

      const detalleVenta = await mysql.ejecutarQuery( query );

      res.json({ detalleVenta })
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

module.exports = {
  addVenta,
  anularVenta,
  detalleVenta,
  getNumFactura,
  getVentas,
  puntoVentasGet
}