const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Brand = sequelize.define('Brand', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'brands',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['name']
            }
        ]
    });

    // Define associations
    Brand.associate = (models) => {
        Brand.hasMany(models.Product, { 
            foreignKey: 'brandId', 
            as: 'products' 
        });
        Brand.belongsTo(models.User, { 
            foreignKey: 'createdBy', 
            as: 'creator' 
        });
    };

    return Brand;
};