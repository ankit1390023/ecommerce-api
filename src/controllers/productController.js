const { Product, Brand, Category, Store, ProductStore } = require('../models');
const cloudinary = require('../config/cloudinary');
const { Op } = require('sequelize');

// Upload images to Cloudinary
const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'products' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(file.buffer);
    });
};

// Create product
exports.createProduct = async (req, res, next) => {
    try {
        const { name, sku, description, price, status, brandId, categoryIds, storeIds } = req.body;

        if (!name || !sku || !price || !brandId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Validate brand exists
        const brand = await Brand.findByPk(brandId);
        if (!brand) {
            return res.status(404).json({
                success: false,
                message: 'Brand not found'
            });
        }

        // Validate categories if provided
        let parsedCategoryIds = [];
        if (categoryIds) {
            parsedCategoryIds = JSON.parse(categoryIds);
            const categories = await Category.findAll({
                where: { id: parsedCategoryIds }
            });

            if (categories.length !== parsedCategoryIds.length) {
                return res.status(404).json({
                    success: false,
                    message: 'One or more categories not found'
                });
            }
        }

        // Upload images if provided
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToCloudinary(file));
            imageUrls = await Promise.all(uploadPromises);
        }

        // Create product
        const product = await Product.create({
            name,
            sku,
            description,
            price,
            status: status || 'active',
            images: imageUrls,
            brandId
        });

        // Associate categories
        if (parsedCategoryIds.length > 0) {
            await product.setCategories(parsedCategoryIds);
        }

        // Associate stores if provided
        if (storeIds) {
            const parsedStoreIds = JSON.parse(storeIds);
            await product.setStores(parsedStoreIds);
        }

        // Fetch complete product with associations
        const completeProduct = await Product.findByPk(product.id, {
            include: [
                { model: Brand, as: 'brand' },
                { model: Category, as: 'categories' },
                { model: Store, as: 'stores' }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product: completeProduct }
        });
    } catch (error) {
        next(error);
    }
};

// Get all products with brand and categories
exports.getAllProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, brandId, categoryId, minPrice, maxPrice } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        let where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { sku: { [Op.like]: `%${search}%` } }
            ];
        }

        if (brandId) {
            where.brandId = brandId;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }

        let include = [
            { model: Brand, as: 'brand' },
            { model: Category, as: 'categories' }
        ];

        // Filter by category if provided
        if (categoryId) {
            include[1].where = { id: categoryId };
            include[1].required = true;
        }

        const { count, rows } = await Product.findAndCountAll({
            where,
            include,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        res.json({
            success: true,
            data: {
                products: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, {
            include: [
                { model: Brand, as: 'brand' },
                { model: Category, as: 'categories' },
                { model: Store, as: 'stores', through: { attributes: ['stock'] } }
            ]
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

// Get products by category with pagination
exports.getProductsByCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const { count, rows } = await Product.findAndCountAll({
            include: [
                {
                    model: Category,
                    as: 'categories',
                    where: { id: categoryId },
                    attributes: []
                },
                { model: Brand, as: 'brand' }
            ],
            limit: parseInt(limit),
            offset,
            distinct: true,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                category,
                products: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Link product to stores
exports.linkProductToStores = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { storeIds, stock = 0 } = req.body;

        if (!storeIds || !Array.isArray(storeIds)) {
            return res.status(400).json({
                success: false,
                message: 'Store IDs array is required'
            });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Add product to stores with stock
        for (const storeId of storeIds) {
            await ProductStore.upsert({
                productId,
                storeId,
                stock
            });
        }

        const updatedProduct = await Product.findByPk(productId, {
            include: [{ model: Store, as: 'stores', through: { attributes: ['stock'] } }]
        });

        res.json({
            success: true,
            message: 'Product linked to stores successfully',
            data: { product: updatedProduct }
        });
    } catch (error) {
        next(error);
    }
};
