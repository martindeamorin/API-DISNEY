const db = require("../database/models/index");
const {body, query} = require("express-validator");
const path = require("path");
const {Op} = require("sequelize");

const moviesMiddleware = {
    movieValidation : [
        body("title").notEmpty().withMessage("El campo es requerido"),
        body("title").custom( async (value, {req}) => {
            if(value){
                const findMovie =  await db.Movie.findOne(
                    {
                        where : 
                        {
                            title : value
                        }
                    }
                )
                if(findMovie){
                    if(!(req.method === "PUT")){
                        return Promise.reject("Esta pelicula ya existe")
                    } else{
                        return true
                    }
                }
            }
        }),
        body("genre", "Este campo es opcional, numerico y no puede quedar vacio").optional().notEmpty().isNumeric().custom( async (value) => {
            const findGenre = await db.Genre.findOne({
                where : {
                    id : value
                }
            })
            if(!findGenre){
                return Promise.reject("No existe un genero con ese ID, puede obviar este campo y crear la pelicula sin su genero.")
            }
        }),
        body("rating").notEmpty().isFloat({min:0,max:10}).withMessage("El campo es requerido y debe ser un numero entre 0 y 10"),
        body("logo", "La pelicula debe tener una imagen (JPG, JPEG o PNG)").custom((value, {req}) => {
            if(req.files[0]){
                const extension = (path.extname(req.files[0].originalname)).toLowerCase();
                switch (extension) {
                    case '.jpg':
                    case '.jpeg':
                    case  '.png':
                        return true;
                        break;
                    default:
                        return false;
                        break;
                }
            }
            if(!(req.method == "PUT")){
                return false;
            } else{
                return true
            }
        }),
        
        body("characters", "No puede quedar vacio, debe ser un array").optional().notEmpty().isArray().custom( async (value, {req}) => {
            if(req.body.characters){
                const characters = []
                value.forEach(element => {
                    characters.push(element)
                })
                const findCharacter =  await db.Character.findAll(
                    {
                        where : 
                        {
                            id: {
                                [Op.in]: characters
                            }
                        }
                    }
                )
                if(findCharacter.length !== characters.length){
                    return Promise.reject("Los personajes deben existir en la base de datos")
                }
            }
        }),
    ],
    movieExists: async (req, res, next) => {
        if (req.params.id) {
            const findMovie = await db.Movie.findOne(
                {
                    where:
                    {
                        id: req.params.id
                    }
                }
            )
            if (!findMovie) {
                let errorResponse = {
                    data: {
                        errors: "El parametro que se ha pasado no coincide con ningun ID"
                    },
                    info: {
                        status: 404
                    }
                };
                return res.json(errorResponse);
            }
        }

        return next()
    },
    queryFilters : [
        query("title", "Debe pasar un valor de busqueda").optional().notEmpty(),
        query("genre", "Debe pasar un valor de busqueda numerico").optional().notEmpty().isNumeric(),
        query("order", "Valores posibles: ASC o DESC").optional().custom( value => {
            switch(value){
                case "DESC":
                case "ASC":
                    return true;
                    break;
                default:
                    return false;
                    break;
            }
        })
    ]

}

module.exports = moviesMiddleware;
