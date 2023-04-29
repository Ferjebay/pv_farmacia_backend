const mysql = require('mysql2/promise');

class MySQL{     
    
    async conectarDB(){
        try{
            const cnn = await mysql.createPool({
                host: 'containers-us-west-106.railway.app',
                user: 'root', 
                password: 'Ady24q0xoaRyyoQ3R7gb',
                database: 'railway',
                port: '6178'
            });
            return cnn;
        }catch (error) {
            console.log("Fallo en la conexion a la base de datos");
            console.log( error );
        }
    }

    async ejecutarQuery( query ){
        const connection = await this.conectarDB();
        const [rows, fields] = await connection.execute( query );
        connection.end()
        return rows
    }    
}

module.exports = MySQL;