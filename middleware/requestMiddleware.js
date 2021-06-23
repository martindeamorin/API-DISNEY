const Cryptr = require('cryptr');
const cryptr = new Cryptr('ZkiU32');

const requestMiddleware = {
    authCheck : (req, res, next) => {
        if(!(req.originalUrl === '/auth/login' || req.originalUrl === '/auth/register')){
            if(req.cookies.email && req.cookies.token){
                if(req.header("Authorization")){
                    if(req.header("Authorization").includes(cryptr.decrypt(req.cookies.token))){
                        return next()
                    } else {
                        const errorResponse = {
                            data: {
                                errors: `El token no es correcto`
                            },
                            info: {
                                status: 401
                            }
                        };
            
                        return res.json(errorResponse);
                    }
                } else{
                    const errorResponse = {
                        data: {
                            errors: `Es necesario un header Authorization del tipo Bearer para hacer un request`
                        },
                        info: {
                            status: 401
                        }
                    };
        
                    return res.json(errorResponse);
                }
            } else{
                const errorResponse = {
                    data: {
                        errors: `No estas logueado, inicia sesion antes de realizar un request.`
                    },
                    info: {
                        status: 401
                    }
                };

                return res.json(errorResponse);
            }
        }
        return  next()
    }
}

module.exports = requestMiddleware;