const db = require("../database/models/index")
const {body} = require("express-validator")

const authMiddleware = {
    registerValidation : [
        body("email").notEmpty().normalizeEmail().isEmail().withMessage("Debe ingresar un email"),
        body("email").custom(function(value){
            return db.User.findOne({where : {email : value}}).then(function(result){
                if(result){
                    return Promise.reject("El email ya está en uso")
                }
            })
        }),
        body("pass").notEmpty().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})").withMessage("Debe ingresar una contraseña con un minimo de 8 caracteres, una minuscula, una mayuscula")
    ],
    loginValidation : [
        body("email").notEmpty().normalizeEmail().isEmail().withMessage("Debe ingresar un email"),
        body("pass").notEmpty().withMessage("Debe ingresar una contraseña")
    ]

}

module.exports = authMiddleware;