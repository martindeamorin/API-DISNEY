const db = require("../database/models/index");
const {body, query} = require("express-validator");
const path = require("path");
const {Op} = require("sequelize")

const charactersMiddleware = {
    characterValidation : [
        body("name").notEmpty().withMessage("El campo es requerido"),
        body("name").custom( async (value, {req}) => {
            if(value){
                const findCharacter =  await db.Character.findOne(
                    {
                        where : 
                        {
                            name : value
                        }
                    }
                )
                if(findCharacter){
                    if(!(req.method === "PUT")){
                        return Promise.reject("Este personaje ya existe")
                    } else{
                        return true
                    }
                }
            }
        }),
        body("age").notEmpty().isNumeric().withMessage("El campo es requerido y debe ser numérico"),
        body("weight").notEmpty().isNumeric().withMessage("El campo es requerido y debe ser numérico"),
        body("lore").notEmpty().withMessage("El campo es requerido"),
        body("logo", "El producto debe tener una imagen (JPG, JPEG o PNG)").custom((value, {req}) => {
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
        body("movies").optional().notEmpty().isArray().custom( async (value, {req}) => {
            if(req.body.movies){
                const movies = []
                value.forEach(element => {
                    movies.push(element)
                })
                const findMovie =  await db.Movie.findAll(
                    {
                        where : 
                        {
                            id: {
                                [Op.in]: movies
                            }
                        }
                    }
                )
                if(findMovie.length !== movies.length){
                    return Promise.reject("No puede quedar vacio, debe ser un array y las peliculas deben existir en la base de datos")
                }
            }
        }),
    ],
    characterExists: async (req, res, next) => {
        if (req.params.id) {
            const findCharacter = await db.Character.findOne(
                {
                    where:
                    {
                        id: req.params.id
                    }
                }
            )
            if (!findCharacter) {
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
        query("name", "Debe pasar un valor de busqueda").optional().notEmpty(),
        query("age", "Debe pasar un valor de busqueda numerico").optional().notEmpty().isNumeric(),
        query("weight", "Debe pasar un valor de busqueda numerico").optional().notEmpty().isNumeric(),
        query("movies", "Debe pasar un array (movies[]=elemento), no puede estar vacio").optional().notEmpty().isArray()
    ]

}

module.exports = charactersMiddleware;
