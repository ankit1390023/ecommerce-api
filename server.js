const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database (use { force: true } to drop and recreate tables - only in development)
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();