const { Order, OrderItem, Address: OrderAddress, Product: OrderProduct, Cart: OrderCart } = require('../models');

// Generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD${timestamp}${random}`;
};

// Create order from cart
exports.createOrder = async (req, res, next) => {
    try {
        const { addressId, deliveryFee = 50, taxRate = 0.18 } = req.body;

        // Get customer's cart
        const cartItems = await OrderCart.findAll({
            where: { customerId: req.customer.id },
            include: [{ model: OrderProduct, as: 'product' }]
        });

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Validate address
        const address = await OrderAddress.findOne({
            where: {
                id: addressId,
                customerId: req.customer.id
            }
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Calculate totals
        const subtotal = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.price) * item.quantity);
        }, 0);

        const tax = subtotal * parseFloat(taxRate);
        const total = subtotal + tax + parseFloat(deliveryFee);

        // Create order
        const order = await Order.create({
            orderNumber: generateOrderNumber(),
            customerId: req.customer.id,
            addressId,
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            deliveryFee: parseFloat(deliveryFee).toFixed(2),
            total: total.toFixed(2),
            status: 'CREATED'
        });

        // Create order items
        for (const item of cartItems) {
            await OrderItem.create({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                total: (parseFloat(item.price) * item.quantity).toFixed(2)
            });
        }

        // Clear cart
        await OrderCart.destroy({
            where: { customerId: req.customer.id }
        });

        // Fetch complete order
        const completeOrder = await Order.findByPk(order.id, {
            include: [
                { model: OrderAddress, as: 'address' },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: OrderProduct, as: 'product' }]
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { order: completeOrder }
        });
    } catch (error) {
        next(error);
    }
};

// Get customer orders
exports.getOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await Order.findAndCountAll({
            where: { customerId: req.customer.id },
            include: [
                { model: OrderAddress, as: 'address' },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: OrderProduct, as: 'product' }]
                }
            ],
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                orders: rows,
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

// Get order by ID
exports.getOrderById = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            where: {
                id: orderId,
                customerId: req.customer.id
            },
            include: [
                { model: OrderAddress, as: 'address' },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: OrderProduct, as: 'product' }]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({
            where: {
                id: orderId,
                customerId: req.customer.id
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order in current status'
            });
        }

        order.status = 'CANCELLED';
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};