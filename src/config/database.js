
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.MYSQL_ADDON_URI, {
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 1,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    // define: {
    //   underscored: true,     // Converts camelCase → snake_case (createdAt → created_at)
    //   freezeTableName: true, // Prevents pluralizing table names
    //   timestamps: true,      // Automatically adds created_at, updated_at
    //   paranoid: true,        // Adds deleted_at for soft deletes (if you want)
    // },
});


const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection has been established successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, testConnection };


