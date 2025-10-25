const { Cart, Product: CartProduct, Brand: CartBrand } = require('../models');

// Add to cart
exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Check if product exists and is available
        const product = await CartProduct.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Product is not available'
            });
        }

        // Check if item already in cart
        let cartItem = await Cart.findOne({
            where: {
                customerId: req.customer.id,
                productId
            }
        });

        if (cartItem) {
            // Update quantity
            cartItem.quantity += parseInt(quantity);
            cartItem.price = product.price;
            await cartItem.save();
        } else {
            // Create new cart item
            cartItem = await Cart.create({
                customerId: req.customer.id,
                productId,
                quantity: parseInt(quantity),
                price: product.price
            });
        }

        const updatedCart = await Cart.findByPk(cartItem.id, {
            include: [{
                model: CartProduct,
                as: 'product',
                include: [{ model: CartBrand, as: 'brand' }]
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Item added to cart',
            data: { cartItem: updatedCart }
        });
    } catch (error) {
        next(error);
    }
};

// Get cart items
exports.getCart = async (req, res, next) => {
    try {
        const cartItems = await Cart.findAll({
            where: { customerId: req.customer.id },
            include: [{
                model: CartProduct,
                as: 'product',
                include: [{ model: CartBrand, as: 'brand' }]
            }]
        });

        const subtotal = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);

        res.json({
            success: true,
            data: {
                cartItems,
                summary: {
                    itemCount: cartItems.length,
                    subtotal: subtotal.toFixed(2)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update cart item
exports.updateCartItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }

        const cartItem = await Cart.findOne({
            where: {
                id: itemId,
                customerId: req.customer.id
            }
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        cartItem.quantity = parseInt(quantity);
        await cartItem.save();

        const updatedCart = await Cart.findByPk(cartItem.id, {
            include: [{ model: CartProduct, as: 'product' }]
        });

        res.json({
            success: true,
            message: 'Cart updated successfully',
            data: { cartItem: updatedCart }
        });
    } catch (error) {
        next(error);
    }
};

// Remove from cart
exports.removeFromCart = async (req, res, next) => {
    try {
        const { itemId } = req.params;

        const cartItem = await Cart.findOne({
            where: {
                id: itemId,
                customerId: req.customer.id
            }
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        await cartItem.destroy();

        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        next(error);
    }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
    try {
        await Cart.destroy({
            where: { customerId: req.customer.id }
        });

        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        next(error);
    }
};
