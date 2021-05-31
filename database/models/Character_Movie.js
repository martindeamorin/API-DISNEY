module.exports = function(sequelize, dataTypes){
    let alias = "CharacterMovie";
    let cols = {
        id: {
            type: dataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            "allowNull" : false
        },

        personaje_id: {
            type: dataTypes.BIGINT.UNSIGNED,
            references: {
                model: 'Character',
                key: 'id'
            }
        },
        pelicula_id: {
            type: dataTypes.BIGINT.UNSIGNED,
            references: {
                model: 'Movie',
                key: 'id'
            }
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
        "tableName": "personaje_pelicula",
        "underscored" : true,
        "createdAt" : "created_at",
        "updatedAt" : "updated_at"
    }

    let CharacterMovie = sequelize.define(alias, cols, config)
    CharacterMovie.associate = function(models){
        CharacterMovie.belongsTo(models.Character,{
            foreignKey: "personaje_id",
            as : "character"
        })
        
        CharacterMovie.belongsTo(models.Movie,{
            foreignKey: "pelicula_id",
            as :"movie"
        })
    }
    return CharacterMovie
    }