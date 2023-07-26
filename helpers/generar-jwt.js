const jwt = require('jsonwebtoken');

const generarJWT = (user = '') => {
    return new Promise( (resolve, reject) => {
        const payload = { user };

        jwt.sign(payload, process.env.SECRETORPRIVATEKEY, {
            expiresIn: '9999 years'
        }, (err, token) => {
            if(err){
                console.log(err);
                reject('No se pudo generar el token');
            }else{
                resolve(token)
            }
        })
    })
}

module.exports = {
    generarJWT
}