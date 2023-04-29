const MySQL = require('../database/config');

const existeUsuarioPorId = async(id) =>{    
    const mysql = new MySQL();

    const query = `SELECT * FROM usuarios WHERE id = ${ id }`;
    const user = await mysql.ejecutarQuery( query );

    if ( user.length === 0 ) {
        throw new Error(`El id no existe: ${id}`);
    }
}

module.exports = {
    existeUsuarioPorId
}



