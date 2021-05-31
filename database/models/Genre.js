module.exports = function(sequelize, dataTypes){
    let alias = "Genre";
    let cols = {
        id: {
            type: dataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            "allowNull" : false
        },

        logo : {
            type : dataTypes.STRING(200),
            "allowNull" : false
        },

        name : {
            type : dataTypes.STRING(100),
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
        "tableName": "genero",
        "underscored" : true,
        "createdAt" : "created_at",
        "updatedAt" : "updated_at"
    }

    let Genre = sequelize.define(alias, cols, config)
        Genre.associate = function(models){
            Genre.hasMany(models.Movie,{
                as : "movies",
                foreignKey: "genero_id"
            })
        }
    return Genre
    }