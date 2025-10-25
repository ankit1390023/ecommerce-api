const { Brand: BrandModel, Product: BrandProduct } = require('../models');

// Create brand
exports.createBrand = async (req, res, next) => {
    try {
        const { name, description, logo } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Brand name is required'
            });
        }

        // Check if brand already exists
        const existingBrand = await BrandModel.findOne({ where: { name } });
        if (existingBrand) {
            return res.status(400).json({
                success: false,
                message: 'Brand with this name already exists'
            });
        }

        const brand = await BrandModel.create({
            name,
            description,
            logo,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Brand created successfully',
            data: { brand }
        });
    } catch (error) {
        next(error);
    }
};

// Get all brands
exports.getAllBrands = async (req, res, next) => {
    try {
        const { page, limit, search, isActive } = req.query;

        let where = {};

        if (search) {
            where.name = { [require('sequelize').Op.like]: `%${search}%` };
        }

        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

        if (page && limit) {
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const { count, rows } = await BrandModel.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                order: [['name', 'ASC']]
            });

            return res.json({
                success: true,
                data: {
                    brands: rows,
                    pagination: {
                        total: count,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        totalPages: Math.ceil(count / parseInt(limit))
                    }
                }
            });
        }

        const brands = await BrandModel.findAll({
            where,
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: { brands }
        });
    } catch (error) {
        next(error);
    }
};

// Get brand by ID
exports.getBrandById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { includeProducts } = req.query;

        let include = [];
        if (includeProducts === 'true') {
            include.push({ model: BrandProduct, as: 'products' });
        }

        const brand = await BrandModel.findByPk(id, { include });

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        res.json({
            success: true,
            data: { brand }
        });
    } catch (error) {
        next(error);
    }
};

// Update brand
exports.updateBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, logo, isActive } = req.body;

        const brand = await BrandModel.findByPk(id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        // Check if name is being changed and if it's already taken
        if (name && name !== brand.name) {
            const existingBrand = await BrandModel.findOne({ where: { name } });
            if (existingBrand) {
                return res.status(400).json({
                    success: false,
                    message: 'Brand with this name already exists'
                });
            }
        }

        await brand.update({
            name: name || brand.name,
            description: description !== undefined ? description : brand.description,
            logo: logo !== undefined ? logo : brand.logo,
            isActive: isActive !== undefined ? isActive : brand.isActive
        });

        res.json({
            success: true,
            message: 'Brand updated successfully',
            data: { brand }
        });
    } catch (error) {
        next(error);
    }
};

// Delete brand
exports.deleteBrand = async (req, res, next) => {
    try {
        const { id } = req.params;

        const brand = await BrandModel.findByPk(id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        // Check if brand has products
        const productCount = await BrandProduct.count({ where: { brandId: id } });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete brand. It has ${productCount} associated products`
            });
        }

        await brand.destroy();

        res.json({
            success: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Toggle brand status
exports.toggleBrandStatus = async (req, res, next) => {
    try {
        const { id } = req.params;

        const brand = await BrandModel.findByPk(id);

        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        brand.isActive = !brand.isActive;
        await brand.save();

        res.json({
            success: true,
            message: `Brand ${brand.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { brand }
        });
    } catch (error) {
        next(error);
    }
};