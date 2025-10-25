const jwt = require('jsonwebtoken');
const { User, Customer, Address } = require('../models');

// Generate JWT Token
const generateToken = (id, type) => {
    return jwt.sign({ id, type }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Admin Register
exports.registerAdmin = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const user = await User.create({ name, email, password, role: role || 'admin' });
        const token = generateToken(user.id, 'admin');

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data: { user, token }
        });
    } catch (error) {
        next(error);
    }
};

// Admin Login
exports.loginAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user.id, 'admin');

        res.json({
            success: true,
            message: 'Login successful',
            data: { user, token }
        });
    } catch (error) {
        next(error);
    }
};

// Customer Register
exports.registerCustomer = async (req, res, next) => {
    try {
        const { name, email, password, phone, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const existingCustomer = await Customer.findOne({ where: { email } });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Customer already exists with this email'
            });
        }

        const customer = await Customer.create({ name, email, password, phone });

        // Create default address
        const defaultAddress = {
            customerId: customer.id,
            addressLine1: address?.addressLine1 || 'Default Address',
            addressLine2: address?.addressLine2 || '',
            city: address?.city || 'Default City',
            state: address?.state || 'Default State',
            country: address?.country || 'India',
            pincode: address?.pincode || '000000',
            latitude: address?.latitude || 0.0,
            longitude: address?.longitude || 0.0,
            isDefault: true
        };

        await Address.create(defaultAddress);

        const token = generateToken(customer.id, 'customer');

        const customerWithAddress = await Customer.findByPk(customer.id, {
            include: [{ model: Address, as: 'addresses' }]
        });

        res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            data: { customer: customerWithAddress, token }
        });
    } catch (error) {
        next(error);
    }
};

// Customer Login
exports.loginCustomer = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const customer = await Customer.findOne({
            where: { email },
            include: [{ model: Address, as: 'addresses' }]
        });

        if (!customer || !customer.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await customer.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(customer.id, 'customer');

        res.json({
            success: true,
            message: 'Login successful',
            data: { customer, token }
        });
    } catch (error) {
        next(error);
    }
};