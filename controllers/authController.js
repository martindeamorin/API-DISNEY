const db = require("../database/models/index")
const cryptoRandomString = require("crypto-random-string")
const bcryptjs = require("bcryptjs")
const { validationResult } = require("express-validator");
const Cryptr = require('cryptr');
const cryptr = new Cryptr('ZkiU32');

const authController = {
    register : async (req, res) => {

        const errors = validationResult(req);

        if(!errors.isEmpty()){
            let errorResponse = {
                data : {
                    errors : errors.errors
                },
                info : {
                    status : 400
                }
            };
            return res.json(errorResponse);

        } else{

            const {email, pass} = req.body;
            const hashedPass = bcryptjs.hashSync(pass, 10);
            const token = cryptoRandomString({length : 30, type : "alphanumeric"});
            const newUser = await db.User.create(
                {
                    email : email,
                    password : hashedPass,
                    token : token
                }
            );
            if(newUser){
                

                let response = {
                    body : {
                        userInfo : "El usuario se ha creado con exito"
                    },
                    info : {
                        status : 201
                    }
                };
                
               return res.json(response)
            } else {
                let errorResponse = {
                    data : {
                        errors : "Ha ocurrido un error al registrar al usuario, intentelo nuevamente"
                    },
                    info : {
                        status : 500
                    }
                };

                return res.json(errorResponse);
            }
        }
    },
    login : async (req, res) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            let errorResponse = {
                data : {
                    errors : errors.errors
                },
                info : {
                    status : 400
                }
            }
            return res.json(errorResponse)

        } else{
            const {email, pass} = req.body;
            const userCoincidence = await db.User.findOne(
                {
                    where : {
                        email : email
                    },
                    attributes : [
                        "email",
                        "password",
                        "token"
                    ]
                },
            )
            if(userCoincidence){
                if(bcryptjs.compareSync(pass, userCoincidence.password)){
                    res.cookie('email' , cryptr.encrypt(email), { maxAge: 31536000000, httpOnly: true });
                    res.cookie('token' , cryptr.encrypt(userCoincidence.token), { maxAge: 31536000000, httpOnly: true });

                    userCoincidence.password = undefined;

                    let response = {
                        data : {
                            userInfo : userCoincidence
                        },
                        info : {
                            status : 200
                        }
                    };

                    return res.json(response);
                }
            } else {

                let errorResponse = {
                    data : {
                        errors : "El email o la contraseña es incorrecto"
                    },
                    info : {
                        status : 401
                    }
                };

                return res.json(errorResponse);
            }
        }
    }
}

module.exports = authController;