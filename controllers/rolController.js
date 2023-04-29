const { response } = require('express');
const MySQL = require('../database/config');

const rolesGet = async (req, res = response) =>{
    const mysql = new MySQL();

    try{
        const query = `SELECT r.*, GROUP_CONCAT(p.nombre ORDER BY p.nombre SEPARATOR '|') permisos_nombres
                        FROM roles r, roles_permisos rp, permisos p
                        WHERE r.id = rp.rol_id AND
                        rp.permiso_id = p.id GROUP BY r.nombre`;

        const roles = await mysql.ejecutarQuery( query );
                
        res.json({ roles })        
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const getPermisosByRol = async (req, res = response) =>{
    const mysql = new MySQL();
    const rol_id = req.params.rol_id;
    try{
        const query = `SELECT p.nombre
                    FROM roles r, roles_permisos rp, permisos p
                    WHERE p.id = rp.permiso_id AND
                    rp.rol_id = r.id AND
                    r.id =  ${ rol_id }`;

        const permisos = await mysql.ejecutarQuery( query );
                
        res.json({ permisos })        
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const rolesPost = async (req, res = response) =>{
    const { rol, permisosId } = req.body;

    const mysql = new MySQL();

    try{
        const query = `INSERT INTO roles(nombre) VALUES('${ rol }')`;
        await mysql.ejecutarQuery( query );

        //Consultar id del ultimo rol
        const rol_id = await mysql.ejecutarQuery( 'SELECT id FROM roles ORDER BY id DESC LIMIT 1' );
        
        let insertQuery = `INSERT INTO roles_permisos( rol_id, permiso_id) VALUES`
        
        permisosId.forEach((permiso_id, index) => {
            insertQuery += ` (${rol_id[0].id}, ${ permiso_id })${ ((index + 1) != permisosId.length ) ? ',' : ';' }`
        });

        await mysql.ejecutarQuery( insertQuery );
        res.json({ msg: 'rol insertado exitosamente' })
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}

const rolesPut = async (req, res = response) =>{
    const { rol, permisosId } = req.body;
    const { rol_id } = req.params;

    const mysql = new MySQL();

    try{
        const query = `UPDATE roles SET nombre = '${ rol }' WHERE id = ${ rol_id }`;
        await mysql.ejecutarQuery( query );

        //Eliminar registros anteriores
        await mysql.ejecutarQuery( `DELETE FROM roles_permisos WHERE rol_id = ${ rol_id }` );
        
        let insertQuery = `INSERT INTO roles_permisos( rol_id, permiso_id) VALUES`
        
        permisosId.forEach((permiso_id, index) => {
            insertQuery += ` (${ rol_id }, ${ permiso_id })${ ((index + 1) != permisosId.length ) ? ',' : ';' }`
        });

        await mysql.ejecutarQuery( insertQuery );
        res.json({ msg: 'rol editado exitosamente' })
    }catch (error) {
        console.log(error);
        return res.json({ msg: 'Error al consultar en la DB' })
    }
}
const rolDelete = async (req, res = response) =>{
    const { rol_id } = req.params;
    const mysql = new MySQL();

    try{
        await mysql.ejecutarQuery( `DELETE FROM roles_permisos WHERE rol_id = ${ rol_id }` );
        
        res.json({ msg: 'Rol eliminado exitosamente' })
    }catch (error) {
        return res.status(500).json({ msg: 'Error, no puede eliminar este Rol' })
    }
}

module.exports = {
    getPermisosByRol,
    rolesGet,
    rolesPost,
    rolesPut,
    rolDelete
}