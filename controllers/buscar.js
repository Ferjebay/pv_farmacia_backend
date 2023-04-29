const { request, response } = require('express');


const buscar = (req, res = request) => {
    const { coleccion, termino } = req.params;
}

module.exports = {
    buscar
}