const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import model definitions
const User = require('./User')(sequelize);
const Customer = require('./Customer')(sequelize);
const Address = require('./Address')(sequelize);
const Brand = require('./Brand')(sequelize);
const Category = require('./Category')(sequelize);
const Store = require('./Store')(sequelize);
const Product = require('./Product')(sequelize);
const Cart = require('./Cart')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);

// Define junction tables
const ProductCategory = sequelize.define('ProductCategory', {}, {
    tableName: 'product_categories',
    timestamps: false
});

const ProductStore = sequelize.define('ProductStore', {
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'product_stores',
    timestamps: true
});

// Create models object for associations
const models = {
    User,
    Customer,
    Address,
    Brand,
    Category,
    Store,
    Product,
    Cart,
    Order,
    OrderItem,
    ProductCategory,
    ProductStore,
    sequelize
};

// Run the associate function for each model
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

module.exports = models;