const { response, request } = require("express")

const esAdminRole = (req = request, res = response, next) =>{
    if (!req.usuarioAuth) {
        return res.status(500).json({
            msg: "Se quiere verificar el role sin validar el token primero"
        })
    }

    const { rol, nombre } = req.usuarioAuth;
    if (rol !== 'ADMIN_ROL') {
        return res.status(401).json({
            msg: `${nombre} no es administrador`
        });
    }
    
    next(); 
}

const tieneRole = ( ...roles ) => {
    return (req = request, res = response, next) => {
        if (!req.usuarioAuth) {
            return res.status(500).json({
                msg: "Se quiere verificar el role sin validar el token primero"
            })
        }

        if( !roles.includes(req.usuarioAuth.rol) ){
            return res.status(401).json({
                msg: `El servicio requiere uno de estos role ${roles}`
            })
        }
        
        next();
    }
}

module.exports = {
    esAdminRole,
    tieneRole
}


