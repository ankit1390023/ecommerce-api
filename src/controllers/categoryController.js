const { Category } = require('../models');

// Create category
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description, image } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const category = await Category.create({
            name,
            description,
            image,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { category }
        });
    } catch (error) {
        next(error);
    }
};

// Get all categories
exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: { categories }
        });
    } catch (error) {
        next(error);
    }
};

// Get category by ID
exports.getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: { category }
        });
    } catch (error) {
        next(error);
    }
};