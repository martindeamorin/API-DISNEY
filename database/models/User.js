module.exports = function(sequelize, dataTypes){
    let alias = "User";
    let cols = {
        id: {
            type: dataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            "allowNull" : false
        },
        email : {
            type : dataTypes.STRING(100),
            "allowNull" : false
        },
        password : {
            type : dataTypes.CHAR(60),
            "allowNull" : false
        },
        token : {
            type : dataTypes.STRING(30),
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
        "tableName": "usuario",
        "underscored" : true,
        "createdAt" : "created_at",
        "updatedAt" : "updated_at"
    }

    let User = sequelize.define(alias, cols, config)

    return User;
    }