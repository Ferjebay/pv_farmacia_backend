const { response } = require('express');
const MySQL = require('../database/config');

const contarArticulos = async (req, res = response) =>{
  const { page, rowsPerPage, busqueda, pv_id, tipoBusqueda } = req.body;

  const mysql = new MySQL();

  try{
      let query = `SELECT COUNT(a1.id) AS total FROM articulos a1`  

      if (tipoBusqueda == 'codigo')
        query += ` WHERE a1.cod_barra LIKE '%${busqueda}%'`
      if (tipoBusqueda == 'nombre')
        query += ` WHERE a1.producto LIKE '%${busqueda}%'`

      if (pv_id != '')
          query += ` AND a1.pv_id = ${ pv_id }`
      
      let articulosContados = await mysql.ejecutarQuery( query );
      
      const articulos = await getListArticulos( page, rowsPerPage, busqueda, pv_id, tipoBusqueda );
      res.json({ articulosContados, articulos });        
  }catch (error) {
      console.log("primer consulta", error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const getListArticulos = async(page = 0, rowsPerPage, busqueda = '', pv_id, tipoBusqueda) => {
  const mysql = new MySQL();
  try{
      if (busqueda == 'sin-busqueda') busqueda = ''

      let query = `SELECT a.*, (SELECT COUNT(*) FROM articulos a` 
      
      if (tipoBusqueda == 'codigo')
        query += ` WHERE a.cod_barra LIKE '%${busqueda}%'`
      if (tipoBusqueda == 'nombre')
        query += ` WHERE a.producto LIKE '%${busqueda}%'`
        
        if (pv_id != '')
          query += ` AND a.pv_id = ${ pv_id }`

      query += `) AS totalArticulos, pv.id AS 'pv_id', pv.nombre AS 'pv_nombre'
      FROM articulos a, puntos_ventas pv
      WHERE a.pv_id = pv.id`;

      if (tipoBusqueda == 'codigo')
        query += ` AND a.cod_barra LIKE '%${busqueda}%'`
      if (tipoBusqueda == 'nombre')
        query += ` AND a.producto LIKE '%${busqueda}%'`

      if (pv_id != '')
          query += ` AND a.pv_id = ${ pv_id }`
      
      query +=` ORDER BY a.id DESC`
      
      if ( rowsPerPage != 0 ) 
        query += ` LIMIT ${ page }, ${ rowsPerPage }`;

      const articulos = await mysql.ejecutarQuery( query );
      return articulos;
  }catch (error) {
      console.log("segunda consulta", error);
  }
}

const articuloPost = async (req, res = response) =>{

  const {  
    categoria_id, empresa_id, cod_barra, descuento, f_caja,
    fecha_caducidad, iva, laboratorio_id,
    p_unitario, presentacion_id, principio_activo,
    producto, pvm, pvp, pv_id, rol_name, punto_agregar } = req.body;

  const mysql = new MySQL();

  try {
      let queryNuevoArticulo = `INSERT INTO articulos(pv_id, laboratorio_id, presentacion_id, categoria_id, aplicaIva, cod_barra, producto, principio_activo, fecha_caducidad, fxc, pvm, pvp, p_unit, descuento) VALUES`;

      //Agregara el articulos a todos los puntos de ventas si es admin
      if ( punto_agregar == 0 ){
        let getPVs = `SELECT id, nombre FROM puntos_ventas WHERE 
        empresa_id = ( SELECT pv.empresa_id FROM puntos_ventas pv WHERE pv.id = ${ empresa_id } ) AND estado = 1`
        const puntosVentas = await mysql.ejecutarQuery( getPVs ); 
        
        const pvPermitidos = puntosVentas.filter(( pv ) => pv.nombre != 'OTROS-JEFE');
        
        pvPermitidos.forEach((pv, index) => {
          queryNuevoArticulo += `(${ pv.id }, ${ laboratorio_id }, ${ presentacion_id }, ${ categoria_id }, '${ iva }', '${ cod_barra }', '${ producto }', '${ principio_activo }', '${ fecha_caducidad }', '${ f_caja }', '${ pvm }', '${ pvp }', '${ p_unitario }', '${ descuento }') 
          ${ ((index + 1) != pvPermitidos.length ) ? ',' : ';' }`;            

        });
      }else{ //Agrega articulo solo al punto de venta del usuario logueado
        queryNuevoArticulo += `(${ punto_agregar }, ${ laboratorio_id }, ${ presentacion_id }, ${ categoria_id }, '${ iva }', '${ cod_barra }', '${ producto }', '${ principio_activo }', '${ fecha_caducidad }', '${ f_caja }', '${ pvm }', '${ pvp }', '${ p_unitario }', '${ descuento }');`
      } 
      

      await mysql.ejecutarQuery( queryNuevoArticulo );
              
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
      return res.json({ msg: 'Error, este articulo no se puede eliminar' })
  }
}

const articuloPut = async (req, res = response) => {

  let { cod_barra, iva, principio_activo, producto, categoria_id,
    presentacion_id, laboratorio_id, f_caja, f_total, fecha_caducidad,
    pvm, pvp, p_unitario, descuento } = req.body;

  const mysql = new MySQL();
  
  try {
      let query = `UPDATE articulos SET 
                  laboratorio_id = ${ laboratorio_id },
                  presentacion_id = ${ presentacion_id },
                  categoria_id = ${ categoria_id }, 
                  aplicaIva = '${ iva }',
                  cod_barra = '${ cod_barra }',
                  producto = '${ producto }',
                  principio_activo = '${ principio_activo }',
                  fecha_caducidad = '${ fecha_caducidad }',
                  fracciones_total = ${ f_total },
                  fxc = ${ f_caja },
                  pvm = ${ pvm },
                  pvp = ${ pvp },
                  p_unit = ${ p_unitario },
                  descuento = ${ descuento }
                  WHERE id = ${ req.params.articulo_id }`;
      
      await mysql.ejecutarQuery( query );
              
      res.json({ msg: "Articulo actualizado exitosamente" })        
  }catch (error){
      return res.json({ msg: error.sqlMessage })
  }
}
const updateDate = async (req, res = response) => {

  const mysql = new MySQL();
  
  try {
      let query = `UPDATE articulos SET 
                  fecha_caducidad = '${ req.body.fecha_caducidad_update }'
                  WHERE id = ${ req.params.articulo_id }`;
      
      await mysql.ejecutarQuery( query );
              
      res.json({ msg: "Articulo actualizado exitosamente" })        
  }catch (error){
      return res.json({ msg: error.sqlMessage })
  }
}

const getArticuloByCodBarra = async (req, res = response) =>{
  const mysql = new MySQL();
  try{
      let articulo;
      //BUSCAR POR COD. BARRA
      const query = `SELECT * FROM articulos a 
                    WHERE cod_barra = '${ req.params.codBarra }' 
                    AND pv_id = ${ req.params.pv_id }`;

      articulo = await mysql.ejecutarQuery( query );

      //BUSCAR POR NOMBRE
      if ( articulo.length == 0 ) {
        const query = `SELECT a.*, pv.nombre AS 'pv_nombre'
                FROM articulos a, puntos_ventas pv
                WHERE a.pv_id = pv.id AND
                a.producto LIKE '%${ req.params.codBarra.toUpperCase() }%'`;

        articulo = await mysql.ejecutarQuery( query );
      }

      res.json({ articulo })        
  }catch (error) {
      console.log(error);
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

const productByExpirar = async (req, res = response) =>{
  const mysql = new MySQL();

  try{
      const query = `SELECT id, cod_barra, producto, fecha_caducidad, fracciones_total, fxc, TIMESTAMPDIFF(DAY, NOW(), fecha_caducidad) AS diasPorCaducar
      FROM articulos 
      WHERE TIMESTAMPDIFF(DAY, NOW(), fecha_caducidad) < 60 ORDER BY diasPorCaducar ASC;`

      const articulos = await mysql.ejecutarQuery( query );

      res.json({ articulos });        
  }catch (error) {
      return res.json({ msg: 'Error al consultar en la DB' })
  }
}

module.exports = {
  articuloPut,
  articuloPost,
  articulosDelete,
  contarArticulos,
  getArticuloByCodBarra,
  productByExpirar,
  updateDate
}