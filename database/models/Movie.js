module.exports = function(sequelize, dataTypes){
    let alias = "Movie";
    let cols = {
        id: {
            type: dataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            "allowNull" : false
        },

        genero_id: {
            type: dataTypes.BIGINT.UNSIGNED,
            "allowNull" : true
        },
        title : {
            type : dataTypes.STRING(100),
            "allowNull" : false
        },

        rating : {
            type : dataTypes.INTEGER(1),
            "allowNull" : false
        },

        logo : {
            type : dataTypes.STRING(200),
            "allowNull" : false
        },
 
        created_at: {
            type: dataTypes.DATE(),
            "allowNull" : false
        },
        updated_at: {
            type: dataTypes.DATE(),
            "allowNull" : false
        },

    }

    let config = {
        "tableName": "pelicula",
        "underscored" : true,
        "createdAt" : "created_at",
        "updatedAt" : "updated_at"
    }

    let Movie = sequelize.define(alias, cols, config)
    Movie.associate = function(models){
        Movie.belongsTo(models.Genre, {
            as : "genre",
            foreignKey: "genero_id"
        })
        Movie.belongsToMany(models.Character, {
            as:"characters",
            through: "CharacterMovie",
            foreignKey: "pelicula_id",
            otherKey: "personaje_id"
        })
    }
    return Movie;
    }