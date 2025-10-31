const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Category = sequelize.define('Category', {
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
        image: {
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
        tableName: 'categories',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['name']
            }
        ]
    });

    // Define associations
    Category.associate = (models) => {
        Category.belongsToMany(models.Product, {
            through: models.ProductCategory,
            foreignKey: 'categoryId',
            as: 'products'
        });
        Category.belongsTo(models.User, { 
            foreignKey: 'createdBy', 
            as: 'creator' 
        });
    };

    return Category;
};
