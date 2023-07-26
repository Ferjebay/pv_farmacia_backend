const { response } = require('express');
const moment = require('moment');

const MySQL = require('../database/config');
const { generarXMLFactura } = require('./generarXML');
const { imprimirFactura } = require('./impresionTickect');

const calcularDigitoVerificadorMod11 = ( clave ) => {
  let factor = 7;
  let total = 0;
  
  for (let i = 0; i < clave.length; i++){
      total += parseInt(clave[i]) * factor;

      factor -= 1;
      if (factor === 1) factor = 7;
  }

  const module11 = 11 - (total % 11);
  
  if (module11 === 11) return 0;
  else if (module11 === 10) return 1;
  
  return module11;
}

const puntoVentasGet = async (req, res = response) =>{
  const mysql = new MySQL();

  try{
      const query = `SELECT id, nombre, estado FROM puntos_ventas`;

      const pv = await mysql.ejecutarQuery( query );
              
      res.json({ pv })        
  }catch (error){
      console.log(error);
      return res.json({ msg: 'Error al consultar los puntos de ventas en la DB' })
  }
}

const generarSecuencial = async ( pv_id ) => {

  const mysql = new MySQL();
  try{
      const query = `SELECT secuencia_factura + 1 AS totalFacturado, punto_emision, codigo_establecimiento AS 'cod_est' FROM puntos_ventas WHERE id = ${ pv_id }`;

      const noFactura = await mysql.ejecutarQuery( query );

      const numeroSecuencial = noFactura[0].totalFacturado.toString().padStart(9, '0') 
      const cod_est = noFactura[0].cod_est.toString().padStart(3, '0') 
      const punto_emision = noFactura[0].punto_emision.toString().padStart(3, '0') 
      
      return `${ cod_est }-${ punto_emision }-${ numeroSecuencial }`;
  }catch (error) {
      console.log(error);
  }
}

const getNumFactura = async (req, res = response) => {
    try{      
        const numeroSecuencial = await generarSecuencial( req.params.pv_id );
        res.json({ numeroSecuencial })        
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const reimprimirFactura = async (req, res = response) => {
  const mysql = new MySQL();

  const { cliente: cl, cliente_id, pv_id, id, clave_acceso, num_comprobante, subtotal, iva, descuento, total, usuario, fecha } = req.body

  //CONSULTAR DATOS DEL PUNTO DE VENTA
  let queryDatosEmpresa = `SELECT pv.direccion, e.*
                FROM puntos_ventas pv, empresas e
                WHERE pv.empresa_id = e.id AND pv.id = ${ pv_id }`
  const datosEmpresa = await mysql.ejecutarQuery( queryDatosEmpresa );

  //DATOS DEL CLIENTE
  let cliente = {}
  if ( cl == 'CONSUMIDOR FINAL' || cl == 0) {
    cliente.tipo_identificacion = '07'
    cliente.cliente = 'CONSUMIDOR FINAL'
    cliente.identificacion_cliente = '9999999999999'
    cliente.direccion_cliente = 'CONSUMIDOR FINAL' 
  }else{
    let queryDatosCliente = `SELECT nombres, tipo_documento, direccion, num_documento, email FROM clientes WHERE id = ${ cliente_id }`
    const datosCliente = await mysql.ejecutarQuery( queryDatosCliente );

    if(datosCliente[0].tipo_documento == 'Ruc') 
      cliente.tipo_identificacion = '04'
    if(datosCliente[0].tipo_documento == 'Cedula') 
      cliente.tipo_identificacion = '05'
    if(datosCliente[0].tipo_documento == 'Pasaporte') 
      cliente.tipo_identificacion = '06'

    cliente.cliente                 = datosCliente[0].nombres
    cliente.identificacion_cliente  = datosCliente[0].num_documento
    cliente.direccion_cliente       = datosCliente[0].direccion
    cliente.email                   = datosCliente[0].email
    cliente.tipo_documento          = datosCliente[0].tipo_documento
  }

  let listArticulos = [];
  const detalles = await detalle( id );

  detalles.forEach( a => {
    listArticulos.push({
      fxc: a.fxc,
      cant_venta: a.cajas,
      f_c: a.fracciones,
      producto: a.producto,
      v_total: a.total.toFixed(2)
    })
  })

  const valoresFactura = { 
    subtotal: subtotal.toFixed(2), 
    iva: iva.toFixed(2), 
    descuento: descuento.toFixed(2), 
    total: total.toFixed(2) 
  };

  const arrayFecha = fecha.split('  ');

  imprimirFactura(datosEmpresa[0], cliente, listArticulos, clave_acceso, num_comprobante, valoresFactura, usuario, arrayFecha[0], arrayFecha[1])

  res.json({ msg: 'impreso' });
}

const addVenta = async (req, res = response) => {
  const { 
    cliente_id, 
    usuario_id, 
    usuario_name,
    pv_id, 
    detalle, 
    valoresFactura,
    imprimir 
  } = req.body;

  const mysql = new MySQL();
  //CONSULTAR DATOS DEL PUNTO DE VENTA
  let queryDatosEmpresa = `SELECT pv.direccion, e.*
                FROM puntos_ventas pv, empresas e
                WHERE pv.empresa_id = e.id AND pv.id = ${ pv_id }`
  const datosEmpresa = await mysql.ejecutarQuery( queryDatosEmpresa );

  //DATOS DEL CLIENTE
  let cliente = {}
  if ( cliente_id == 'CONSUMIDOR FINAL' || cliente_id == 0) {
    cliente.tipo_identificacion = '07'
    cliente.cliente = 'CONSUMIDOR FINAL'
    cliente.identificacion_cliente = '9999999999999'
    cliente.direccion_cliente = 'CONSUMIDOR FINAL' 
  }else{
    let queryDatosCliente = `SELECT nombres, tipo_documento, direccion, num_documento, email FROM clientes WHERE id = ${ cliente_id }`
    const datosCliente = await mysql.ejecutarQuery( queryDatosCliente );

    if(datosCliente[0].tipo_documento == 'Ruc') 
      cliente.tipo_identificacion = '04'
    if(datosCliente[0].tipo_documento == 'Cedula') 
      cliente.tipo_identificacion = '05'
    if(datosCliente[0].tipo_documento == 'Pasaporte') 
      cliente.tipo_identificacion = '06'

    cliente.cliente                 = datosCliente[0].nombres
    cliente.identificacion_cliente  = datosCliente[0].num_documento
    cliente.direccion_cliente       = datosCliente[0].direccion
    cliente.email                   = datosCliente[0].email
    cliente.tipo_documento          = datosCliente[0].tipo_documento
  }

  //GENERAR CLAVE DE ACCESO O N/A
    const numFactura = await generarSecuencial( pv_id );

    const codigoEstablecimiento = numFactura.split('-')[0];
    const puntoEmision = numFactura.split('-')[1];;   

    const fechaEmision = moment().format('DDMMYYYY');
    const tipoComprobante = '01' //Factura
    const ruc = datosEmpresa[0].ruc
    const ambiente = datosEmpresa[0].ambiente === 'PRUEBA' ? '1' : '2' ;
    const serie = codigoEstablecimiento + '' + puntoEmision;
    const secuencia = numFactura.split('-')[2];
    const codigoNumerico = Date.now().toString(10).substring(5);
    const tipoEmision = '1' //Emision Normal

    let claveAcceso = fechaEmision + tipoComprobante + ruc + ambiente + serie + secuencia + codigoNumerico + tipoEmision;

    const digitoVerificador = calcularDigitoVerificadorMod11( claveAcceso );

    claveAcceso = claveAcceso + digitoVerificador;
  
  //GUARDAR LA FACTURA
  try {
      const in_cliente = cliente.cliente == 'CONSUMIDOR FINAL' ? 4 : cliente_id

      let factura_id = await mysql.ejecutarQuery( 'SELECT id FROM facturas ORDER BY id DESC LIMIT 1' );

      ( factura_id.length === 0 ) ? factura_id = 1 : factura_id = factura_id[0].id + 1 ;

      let queryInsertFactura = `INSERT INTO facturas
      VALUES(${ factura_id }, ${ in_cliente }, ${ usuario_id }, ${ pv_id }, '${ claveAcceso }', DATE_SUB(NOW(), INTERVAL 0 HOUR), DATE_SUB(NOW(), INTERVAL 0 HOUR), '${ numFactura }', ${ valoresFactura.subtotal }, ${ valoresFactura.descuento }, ${ valoresFactura.iva }, ${ valoresFactura.total }, 1)`

      await mysql.ejecutarQuery( queryInsertFactura );

      let insertQueryDetalle = `INSERT INTO detalle_factura VALUES`
        
      detalle.forEach((articulo, index) => {
        insertQueryDetalle += ` (
          ${ factura_id }, 
          ${ articulo.id }, 
          ${ articulo.cant_venta }, 
          ${ articulo.f_c },
          ${ articulo.v_total })
          ${ ((index + 1) != detalle.length ) ? ',' : ';' }`
      });

      await mysql.ejecutarQuery( insertQueryDetalle );

      res.json({ msg: 'Venta Realizado Exitosamente' })

      //IMPRIMIR FACTURA
      if ( imprimir ){
        const fechaEmision = moment().format('DD/MM/YYYY');
        const horaEmision  = moment().format('h:mma');

        imprimirFactura(datosEmpresa[0], cliente, detalle, claveAcceso, numFactura, valoresFactura, usuario_name, fechaEmision, horaEmision)
      } 
        
      //GENERA EL XML LO FIRMA Y VERIFICA SI FUE APROBADO O NO POR EL SRI
      generarXMLFactura( datosEmpresa[0], cliente, detalle, claveAcceso, numFactura, valoresFactura )

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
        pv.nombre AS pv_nombre
        FROM facturas f, clientes c, usuarios u, puntos_ventas pv, detalle_factura df, articulos a
        WHERE f.cliente_id = c.id AND
        f.usuario_id = u.id AND
        f.pv_id = pv.id AND
        f.id = df.factura_id AND
        df.articulo_id = a.id`

        if (filter != ''){
          query += ` AND df.factura_id = (SELECT f.id 
            FROM facturas f WHERE f.num_comprobante = '${ filter }' LIMIT 1) 
            GROUP BY f.id ORDER BY f.id DESC`
        }else{
          if (pv_id != '' && filter == '') 
            query += ` AND pv.id = ${ pv_id }`
  
          if (desde != '' && hasta != '') 
            query += ` AND f.fecha_emision BETWEEN '${ desde }' AND '${ hasta }' GROUP BY f.id ORDER BY f.id DESC`
          else
            query += ` AND f.fecha_emision = SUBSTRING_INDEX(DATE_SUB(NOW(), INTERVAL 0 HOUR), ' ' ,1) GROUP BY f.id ORDER BY f.id DESC`
        } 

      const facturas = await mysql.ejecutarQuery( query );

      res.json({ facturas })
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const anularVenta = async (req, res = response) =>{
  const mysql = new MySQL();

  try{
    const querySumarStock = `SELECT id, fracciones_total, fxc, cajas, fracciones
                      FROM detalle_factura df, articulos a
                      WHERE df.factura_id = ${ req.params.factura_id } AND
                      df.articulo_id = a.id`;
      const listArticulos = await mysql.ejecutarQuery( querySumarStock );

      listArticulos.forEach( async( articulo ) => {
        let fraccionesVendidas = (articulo.fxc * articulo.cajas) + parseInt(articulo.fracciones)

        const querySumarStock = `UPDATE articulos 
                                SET fracciones_total = ${ fraccionesVendidas + articulo.fracciones_total }
                                WHERE id = ${ articulo.id }`;
        await mysql.ejecutarQuery( querySumarStock );
      })
      
      const query = `UPDATE facturas SET estado = 0 WHERE id = ${ req.params.factura_id }`;
      await mysql.ejecutarQuery( query );

      res.json({ msg: 'Factura Anulada Exitosamente' })
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const detalle = async ( factura_id ) => {
    const mysql = new MySQL();
    try{
        const query = `SELECT a.cod_barra, a.producto, a.fxc, df.cajas, df.fracciones, df.subtotal, f.subtotal AS 'sub_fact', f.iva, f.descuento, f.total, TRUNCATE(a.pvp, 2) AS 'pvp', TRUNCATE(a.p_unit, 2) AS 'p_unit', a.aplicaIva, a.descuento AS 'd_a'
        FROM facturas f, detalle_factura df, articulos a
        WHERE f.id = df.factura_id AND
        df.articulo_id = a.id AND
        df.factura_id = ${ factura_id }`

        const detalleVenta = await mysql.ejecutarQuery( query );

        return detalleVenta;
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const detalleVenta = async (req, res = response) => {
  try{
      const detalles = await detalle( req.params.factura_id );

      res.json({ detalleVenta: detalles })
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
  puntoVentasGet,
  reimprimirFactura
}