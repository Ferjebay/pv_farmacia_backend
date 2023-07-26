const mysql = require('mysql2/promise');

class MySQL{     
    
    async conectarDB(){
        try{
            const cnn = await mysql.createPool({
                host: 'localhost',
                user: 'root', 
                password: '',
                database: 'pos-ventas',
                port: '3306'
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