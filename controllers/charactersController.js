const db = require("../database/models/index")
const { validationResult } = require("express-validator")
const fs = require('fs');
const path = require("path");
const {Op} = require("sequelize");

const charactersController = {

    getCharacters: async (req, res) => {
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
            const name = req.query.name || "";
            const age = req.query.age || "";
            const weight = req.query.weight || "";

            const where = {
                name : {[Op.like] : `%${name}%`},
                age : {[Op.like] : `%${age}%`},
                weight : {[Op.like] : `%${weight}%`},
            }
            if(req.query.movies){
                where["$movies.id$"] = req.query.movies
            } else{
                req.query.movies = false;
            }
            const allCharacters = await db.Character.findAll(
                {
                    attributes: [
                        "logo",
                        "name",
                        "created_at"
                    ],
                    where,
                    include : [{
                        association : "movies",

                    }]
                }
            )

            if(allCharacters){
                const filteredValues = [];
                for(let i = 0; i < allCharacters.length; i++){
                    if((req.query.movies === false) || (req.query.movies.length === allCharacters[i].movies.length)){
                        let {name, logo, created_at} = allCharacters[i]
                        logo = `http://localhost:3000/images/charactersLogos/${logo}`
                        filteredValues.push({name, logo, created_at})
                    }
                }


                const response = {
                    body: {
                        characters: filteredValues
                    },
                    info: {
                        status: 200,
                        length : allCharacters.length,
                        url : req.protocol + '://' + req.get('host') + req.originalUrl
                    }
                }

                return res.json(response)
            } else {
                const errorResponse = {
                    data: {
                        errors: `Ocurrio un error al buscar los personajes, intentelo nuevamente`
                    },
                    info: {
                        status: 500
                    }
                };

                return res.json(errorResponse);
            }
        }
    },
    getCharacter : async (req, res) => {
        const getCharacter = await db.Character.findOne({
            where : {
                id : req.params.id
            },
            include : [
                {
                    association : "movies"
                }
            ]
        }
        )

        if(getCharacter){
            getCharacter.logo = `http://localhost:3000/images/charactersLogos/${getCharacter.logo}`

            const response = {
                body: {
                    characters: getCharacter
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
                    errors: `Ocurrio un error al buscar el personaje, intentelo nuevamente`
                },
                info: {
                    status: 500
                }
            };

            return res.json(errorResponse);
        }
    },
    newCharacter: async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            if (req.files[0]) {
                fs.unlinkSync(path.normalize(path.resolve(__dirname, `../public/images/charactersLogos/${req.files[0].filename}`)))
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
            const { name, age, weight, lore } = req.body;
            const logo = req.files[0].filename

            const createCharacter = await db.Character.create(
                {
                    name,
                    age,
                    weight,
                    lore,
                    logo
                }
            );

            if (createCharacter) {
                if (req.body.movies) {
                    const relations = []
                    req.body.movies.forEach(element => {
                        relations.push(
                            {
                                personaje_id: createCharacter.id,
                                pelicula_id: element
                            }
                        )
                    })
                    const createRelation = await db.CharacterMovie.bulkCreate(relations)
                    if (createRelation) {
                        const response = {
                            body: {
                                message: `Se ha creado con exito el personaje ${name}`
                            },
                            info: {
                                status: 201
                            }
                        }

                        return res.json(response);
                    } else {
                        const errorResponse = {
                            data: {
                                errors: `No se ha podido crear la relacion para el personaje ${name}, intentelo nuevamente`
                            },
                            info: {
                                status: 500
                            }
                        };

                        return res.json(errorResponse);
                    }
                } else {
                    const response = {
                        body: {
                            message: `Se ha creado con exito el personaje ${name}`
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
                        errors: `No se ha podido crear el personaje ${name}, intentelo nuevamente`
                    },
                    info: {
                        status: 500
                    }
                };

                return res.json(errorResponse);
            }
        }
    },
    updateCharacter: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            if (req.files[0]) {
                fs.unlinkSync(path.normalize(path.resolve(__dirname, `../public/images/charactersLogos/${req.files[0].filename}`)))
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
            const { name, age, weight, lore } = req.body;

            const updateCharacter = await db.Character.update(
                {
                    name,
                    age,
                    weight,
                    lore
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
                    const updateLogo = await db.Character.update(
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
                if (req.body.movies) {

                    const destroyRelations = await db.CharacterMovie.destroy(
                        {
                            where:
                            {
                                personaje_id: req.params.id
                            }
                        }
                    )
                    if (destroyRelations) {
                        const relations = []
                        req.body.movies.forEach(element => {
                            relations.push(
                                {
                                    personaje_id: req.params.id,
                                    pelicula_id: element
                                }
                            )
                        })
                        const createRelation = await db.CharacterMovie.bulkCreate(relations)
                        if (!createRelation) {
                            const errorResponse = {
                                data: {
                                    errors: `No se han podido actualizar las relaciones para el personaje ${name}, intentelo nuevamente`
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
                    body: {
                        message: `Se ha editado con exito el personaje ${name}`
                    },
                    info: {
                        status: 201
                    }
                }
                return res.json(response);

            } else {
                const errorResponse = {
                    data: {
                        errors: `No se ha podido actualizar el personaje ${name}`
                    },
                    info: {
                        status: 500
                    }
                };

                return res.json(errorResponse);

            }
        }
    },
    deleteCharacter: async (req, res) => {

        const characterDeleted = await db.Character.findOne(
            {
                where:
                {
                    id: req.params.id
                },
                attributes:
                    [
                        "logo",
                        "name"
                    ],
                include: [{ association: "movies" }]
            },
        )

        if (characterDeleted) {

            if (characterDeleted.movies[0]) {
                const destroyRelations = await db.CharacterMovie.destroy(
                    {
                        where:
                        {
                            personaje_id: req.params.id
                        }
                    }
                )
                if (destroyRelations) {
                    const destroyCharacter = await db.Character.destroy(
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
                                errors: `Ocurrio un error al eliminar al personaje ${characterDeleted.name}`
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
                            errors: `Ocurrio un error al eliminar las relaciones del personaje ${characterDeleted.name}`
                        },
                        info: {
                            status: 400
                        }
                    };
                    return res.json(errorResponse);
                }
            }

            fs.unlinkSync(path.normalize(path.resolve(__dirname, `../public/images/charactersLogos/${characterDeleted.logo}`)))

            const response = {
                body: {
                    message: `Se ha eliminado con exito el personaje ${characterDeleted.name}`
                },
                info: {
                    status: 200
                }
            }
            return res.json(response);
        }
    } 
}

module.exports = charactersController;