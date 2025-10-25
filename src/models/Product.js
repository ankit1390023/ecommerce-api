const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sku: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'out_of_stock'),
            defaultValue: 'active'
        },
        images: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        },
        brandId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'brands',
                key: 'id'
            }
        }
    }, {
        tableName: 'products',
        timestamps: true
    });

    return Product;
};