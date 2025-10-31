const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Cart = sequelize.define('Cart', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'customers',
                key: 'id'
            }
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'carts',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['customerId', 'productId']
            }
        ]
    });

    // Define associations
    Cart.associate = (models) => {
        Cart.belongsTo(models.Customer, { 
            foreignKey: 'customerId', 
            as: 'customer' 
        });
        Cart.belongsTo(models.Product, { 
            foreignKey: 'productId', 
            as: 'product' 
        });
    };

    return Cart;
};