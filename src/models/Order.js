const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        orderNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'customers',
                key: 'id'
            }
        },
        addressId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'addresses',
                key: 'id'
            }
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        tax: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        deliveryFee: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('CREATED', 'PAYMENT_PENDING', 'PAID', 'FAILED', 'CANCELLED', 'PROCESSING', 'SHIPPED', 'DELIVERED'),
            defaultValue: 'CREATED'
        },
        razorpayOrderId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        razorpayPaymentId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        razorpaySignature: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'orders',
        timestamps: true
    });

    return Order;
};