module.exports = function(sequelize, dataTypes){
    let alias = "Character";
    let cols = {
        id: {
            type: dataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            "allowNull" : false
        },
        name : {
            type : dataTypes.STRING(100),
            "allowNull" : false
        },
        age : {
            type : dataTypes.INTEGER(3),
            "allowNull" : false
        },
        weight : {
            type : dataTypes.INTEGER(3),
            "allowNull" : false
        },
        lore : {
            type : dataTypes.TEXT,
            "allownNull" : false
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
        "tableName": "personaje",
        "underscored" : true,
        "createdAt" : "created_at",
        "updatedAt" : "updated_at"
    }

    let Character = sequelize.define(alias, cols, config)
    Character.associate = function(models){
        Character.belongsToMany(models.Movie, {
            as:"movies",
            through: "CharacterMovie",
            foreignKey: "personaje_id",
            otherKey: "pelicula_id"
        })
    }
    return Character
    }