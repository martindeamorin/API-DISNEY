const db = require("../database/models/index")
const { validationResult } = require("express-validator")
const fs = require('fs');
const path = require("path");
const {Op} = require("sequelize");

const  moviesController = {

    getMovies: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            let errorResponse = {
                data: {
                    errors: errors.errors
                },
                info: {
                    status: 400
                }
            };
            return res.json(errorResponse);

        } else {
            const title = req.query.title || "";
            const genre = req.query.genre || null;
            const order = req.query.order || "ASC"
            const where = {
                title : {[Op.like] : `%${title}%`},
            }

            if(genre){
                where["$genre.id$"] = genre
            }

            const allMovies = await db.Movie.findAll(
                {
                    attributes: [
                        "logo",
                        "title",
                        "created_at"
                    ],
                    where,
                    order : [["created_at", order]]
                    ,
                    include : [
                        {
                        association : "genre"
                        }
                    ]
                }
            )

            if(allMovies){
                const filteredValues = [];
                for(let i = 0; i < allMovies.length; i++){
                    let {title, logo, created_at} = allMovies[i]
                    logo = `http://localhost:3000/images/moviesLogos/${logo}`
                    filteredValues.push({title, logo, created_at})
                }

                const response = {
                    data: {
                        movies: filteredValues
                    },
                    info: {
                        status: 200,
                        length : allMovies.length,
                        url : req.protocol + '://' + req.get('host') + req.originalUrl
                    }
                }

                return res.json(response)
            } else {
                const errorResponse = {
                    data: {
                        errors: `Ocurrio un error al buscar las peliculas, intentelo nuevamente`
                    },
                    info: {
                        status: 500
                    }
                };

                return res.json(errorResponse);
            }
        }
    },
    getMovie : async (req, res) => {
        const getMovie = await db.Movie.findOne({
            where : {
                id : req.params.id
            },
            include : [
                {
                    association : "genre"
                },
                {
                    association : "characters"
                }
            ]
        }
        )

        if(getMovie){
            getMovie.logo = `http://localhost:3000/images/moviesLogos/${getMovie.logo}`

            const response = {
                data: {
                    movie: getMovie
                },
                info: {
                    status: 200,
                    url : req.protocol + '://' + req.get('host') + req.originalUrl
                }
            }

            return res.json(response)
        } else {
            const errorResponse = {
                data: {
                    errors: `Ocurrio un error al buscar la pelicula, intentelo nuevamente`
                },
                info: {
                    status: 500
                }
            };

            return res.json(errorResponse);
        }
    },
    newMovie: async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            if (req.files[0]) {
                fs.unlinkSync(path.normalize(path.resolve(__dirname, `../public/images/moviesLogos/${req.files[0].filename}`)))
            }
            let errorResponse = {
                data: {
                    errors: errors.errors
                },
                info: {
                    status: 400
                }
            };
            return res.json(errorResponse);

        } else {
            const {title, rating, genre} = req.body;
            const logo = req.files[0].filename

            const createMovie = await db.Movie.create(
                {
                    title,
                    rating,
                    logo,
                    genre
                }
            );

            if (createMovie) {
                if (req.body.characters) {
                    const relations = []
                    req.body.characters.forEach(element => {
                        relations.push(
                            {
                                personaje_id: element,
                                pelicula_id: createMovie.id
                            }
                        )
                    })
                    const createRelation = await db.CharacterMovie.bulkCreate(relations)
                    if (createRelation) {
                        const response = {
                            data: {
                                message: `Se ha creado con exito la pelicula ${title}`
                            },
                            info: {
                                status: 201
                            }
                        }

                        return res.json(response);
                    } else {
                        const errorResponse = {
                            data: {
                                errors: `No se ha podido crear la relacion para la pelicula ${title}, intentelo nuevamente`
                            },
                            info: {
                                status: 500
                            }
                        };

                        return res.json(errorResponse);
                    }
                } else {
                    const response = {
                        data: {
                            message: `Se ha creado con exito la pelicula ${title}`
                        },
                        info: {
                            status: 201
                        }
                    }
                    return res.json(response);

                }
            } else {
                const errorResponse = {
                    data: {
                        errors: `No se ha podido crear la pelicula ${title}, intentelo nuevamente`
                    },
                    info: {
                        status: 500
                    }
                };

                return res.json(errorResponse);
            }
        }
    },
    updateMovie: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            if (req.files[0]) {
                fs.unlinkSync(path.normalize(path.resolve(__dirname, `../public/images/moviesLogos/${req.files[0].filename}`)))
            }
            let errorResponse = {
                data: {
                    errors: errors.errors
                },
                info: {
                    status: 400
                }
            };
            return res.json(errorResponse);

        } else {
            const {title, rating, genre} = req.body;

            const updateCharacter = await db.Movie.update(
                {
                    title,
                    rating,
                    genre
                },
                {
                    where:
                    {
                        id: req.params.id
                    }
                }
            );
            if (updateCharacter) {
                if (req.files[0]) {
                    const updateLogo = await db.Movie.update(
                        {
                            logo: req.files[0].filename
                        },
                        {
                            where:
                            {
                                id: req.params.id
                            }
                        }
                    )

                    if (!updateLogo) {
                        const errorResponse = {
                            data: {
                                errors: `No se ha podido subir la imagen`
                            },
                            info: {
                                status: 500
                            }
                        };

                        return res.json(errorResponse);
                    }
                }
                if (req.body.characters) {

                    const destroyRelations = await db.CharacterMovie.destroy(
                        {
                            where:
                            {
                                pelicula_id: req.params.id
                            }
                        }
                    )
                    if (destroyRelations) {
                        const relations = []
                        req.body.characters.forEach(element => {
                            relations.push(
                                {
                                    personaje_id: element,
                                    pelicula_id: req.params.id
                                }
                            )
                        })
                        const createRelation = await db.CharacterMovie.bulkCreate(relations)
                        if (!createRelation) {
                            const errorResponse = {
                                data: {
                                    errors: `No se ha podido actualizar la relacion para la pelicula ${title}, intentelo nuevamente`
                                },
                                info: {
                                    status: 500
                                }
                            };

                            return res.json(errorResponse);

                        }
                    }
                }

                const response = {
                    data: {
                        message: `Se ha editado con exito la pelicula ${title}`
                    },
                    info: {
                        status: 201
                    }
                }
                return res.json(response);

            } else {
                const errorResponse = {
                    data: {
                        errors: `No se ha podido actualizar la pelicula ${title}`
                    },
                    info: {
                        status: 500
                    }
                };

                return res.json(errorResponse);

            }
        }
    },
    deleteMovie: async (req, res) => {

        const movieDeleted = await db.Movie.findOne(
            {
                where:
                {
                    id: req.params.id
                },
                attributes:
                    [
                        "logo",
                        "title"
                    ],
                include: [{ association: "characters" }]
            },
        )

        if (movieDeleted) {

            if (movieDeleted.characters[0]) {
                const destroyRelations = await db.CharacterMovie.destroy(
                    {
                        where:
                        {
                            pelicula_id: req.params.id
                        }
                    }
                )
                if (destroyRelations) {
                    const destroyCharacter = await db.Movie.destroy(
                        {
                            where:
                            {
                                id: req.params.id
                            }
                        }
                    )

                    if (!destroyCharacter) {
                        let errorResponse = {
                            data: {
                                errors: `Ocurrio un error al eliminar la pelicula ${movieDeleted.title}`
                            },
                            info: {
                                status: 400
                            }
                        };
                        return res.json(errorResponse);
                    }
                } else {
                    let errorResponse = {
                        data: {
                            errors: `Ocurrio un error al eliminar las relaciones de la pelicula ${movieDeleted.title}`
                        },
                        info: {
                            status: 400
                        }
                    };
                    return res.json(errorResponse);
                }
            }

            fs.unlinkSync(path.normalize(path.resolve(__dirname, `../public/images/moviesLogos/${movieDeleted.logo}`)))

            const response = {
                data: {
                    message: `Se ha eliminado con exito la pelicula ${movieDeleted.title}`
                },
                info: {
                    status: 200
                }
            }
            return res.json(response);
        }
    } 
}

module.exports = moviesController;