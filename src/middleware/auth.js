const jwt = require('jsonwebtoken');
const { User, Customer } = require('../models');

// Admin authentication
exports.authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const user = await User.findByPk(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user inactive.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token.',
            error: error.message
        });
    }
};

// Customer authentication
exports.authenticateCustomer = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Customer only.'
            });
        }

        const customer = await Customer.findByPk(decoded.id);

        if (!customer || !customer.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or customer inactive.'
            });
        }

        req.customer = customer;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token.',
            error: error.message
        });
    }
};