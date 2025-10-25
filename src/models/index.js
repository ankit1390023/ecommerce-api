const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import models
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

// Define associations

// Customer - Address (One to Many)
Customer.hasMany(Address, { foreignKey: 'customerId', as: 'addresses' });
Address.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// Product - Brand (Many to One)
Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });
Brand.hasMany(Product, { foreignKey: 'brandId', as: 'products' });

// Product - Category (Many to Many)
const ProductCategory = sequelize.define('ProductCategory', {}, {
    tableName: 'product_categories',
    timestamps: false
});

Product.belongsToMany(Category, {
    through: ProductCategory,
    foreignKey: 'productId',
    as: 'categories'
});

Category.belongsToMany(Product, {
    through: ProductCategory,
    foreignKey: 'categoryId',
    as: 'products'
});

// Product - Store (Many to Many)
const ProductStore = sequelize.define('ProductStore', {
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'product_stores',
    timestamps: true
});

Product.belongsToMany(Store, {
    through: ProductStore,
    foreignKey: 'productId',
    as: 'stores'
});

Store.belongsToMany(Product, {
    through: ProductStore,
    foreignKey: 'storeId',
    as: 'products'
});

// Cart associations
Cart.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Order associations
Order.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Order.belongsTo(Address, { foreignKey: 'addressId', as: 'address' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User associations
Brand.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Category.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

module.exports = {
    sequelize,
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
    ProductStore
};