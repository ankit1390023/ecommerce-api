const { Customer: CustomerModel, Address: AddressModel } = require('../models');

// Get customer profile
exports.getProfile = async (req, res, next) => {
    try {
        const customer = await CustomerModel.findByPk(req.customer.id, {
            include: [{ model: AddressModel, as: 'addresses' }]
        });

        res.json({
            success: true,
            data: { customer }
        });
    } catch (error) {
        next(error);
    }
};

// Update customer profile
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;

        const customer = await CustomerModel.findByPk(req.customer.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        await customer.update({
            name: name || customer.name,
            phone: phone || customer.phone
        });

        const updatedCustomer = await CustomerModel.findByPk(req.customer.id, {
            include: [{ model: AddressModel, as: 'addresses' }]
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { customer: updatedCustomer }
        });
    } catch (error) {
        next(error);
    }
};

// Add new address
exports.addAddress = async (req, res, next) => {
    try {
        const { addressLine1, addressLine2, city, state, country, pincode, latitude, longitude, isDefault } = req.body;

        if (!addressLine1 || !city || !state || !pincode || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await AddressModel.update(
                { isDefault: false },
                { where: { customerId: req.customer.id } }
            );
        }

        const address = await AddressModel.create({
            customerId: req.customer.id,
            addressLine1,
            addressLine2,
            city,
            state,
            country: country || 'India',
            pincode,
            latitude,
            longitude,
            isDefault: isDefault || false
        });

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: { address }
        });
    } catch (error) {
        next(error);
    }
};

// Get all addresses
exports.getAddresses = async (req, res, next) => {
    try {
        const addresses = await AddressModel.findAll({
            where: { customerId: req.customer.id },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: { addresses }
        });
    } catch (error) {
        next(error);
    }
};

// Update address
exports.updateAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const { addressLine1, addressLine2, city, state, country, pincode, latitude, longitude, isDefault } = req.body;

        const address = await AddressModel.findOne({
            where: { id: addressId, customerId: req.customer.id }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // If setting as default, unset other defaults
        if (isDefault) {
            await AddressModel.update(
                { isDefault: false },
                { where: { customerId: req.customer.id } }
            );
        }

        await address.update({
            addressLine1: addressLine1 || address.addressLine1,
            addressLine2: addressLine2 !== undefined ? addressLine2 : address.addressLine2,
            city: city || address.city,
            state: state || address.state,
            country: country || address.country,
            pincode: pincode || address.pincode,
            latitude: latitude || address.latitude,
            longitude: longitude || address.longitude,
            isDefault: isDefault !== undefined ? isDefault : address.isDefault
        });

        res.json({
            success: true,
            message: 'Address updated successfully',
            data: { address }
        });
    } catch (error) {
        next(error);
    }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;

        const address = await AddressModel.findOne({
            where: { id: addressId, customerId: req.customer.id }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Don't allow deletion of default address if it's the only one
        if (address.isDefault) {
            const addressCount = await AddressModel.count({
                where: { customerId: req.customer.id }
            });

            if (addressCount === 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete the only address'
                });
            }
        }

        await address.destroy();

        res.json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Set default address
exports.setDefaultAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;

        const address = await AddressModel.findOne({
            where: { id: addressId, customerId: req.customer.id }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Unset all default addresses
        await AddressModel.update(
            { isDefault: false },
            { where: { customerId: req.customer.id } }
        );

        // Set this address as default
        address.isDefault = true;
        await address.save();

        res.json({
            success: true,
            message: 'Default address updated',
            data: { address }
        });
    } catch (error) {
        next(error);
    }
};