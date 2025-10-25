const razorpayInstance = require('../config/razorpay');
const crypto = require('crypto');
const { Order: PaymentOrder } = require('../models');

// Create Razorpay order
exports.createRazorpayOrder = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Get order details
        const order = await PaymentOrder.findOne({
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

        if (order.status === 'PAID') {
            return res.status(400).json({
                success: false,
                message: 'Order already paid'
            });
        }

        // Check if Razorpay order already exists
        if (order.razorpayOrderId) {
            return res.json({
                success: true,
                message: 'Razorpay order already exists',
                data: {
                    razorpayOrderId: order.razorpayOrderId,
                    amount: Math.round(parseFloat(order.total) * 100),
                    currency: 'INR',
                    orderNumber: order.orderNumber
                }
            });
        }

        // Create Razorpay order
        const razorpayOrder = await razorpayInstance.orders.create({
            amount: Math.round(parseFloat(order.total) * 100), // Amount in paise
            currency: 'INR',
            receipt: order.orderNumber,
            notes: {
                orderId: order.id,
                customerId: order.customerId
            }
        });

        // Update order with Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;
        order.status = 'PAYMENT_PENDING';
        await order.save();

        res.json({
            success: true,
            message: 'Razorpay order created successfully',
            data: {
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                orderNumber: order.orderNumber,
                keyId: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        next(error);
    }
};

// Verify payment
exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
            return res.status(400).json({
                success: false,
                message: 'All payment details are required'
            });
        }

        // Get order
        const order = await PaymentOrder.findOne({
            where: {
                id: orderId,
                customerId: req.customer.id,
                razorpayOrderId
            }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        if (generatedSignature !== razorpaySignature) {
            order.status = 'FAILED';
            await order.save();

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Update order
        order.razorpayPaymentId = razorpayPaymentId;
        order.razorpaySignature = razorpaySignature;
        order.status = 'PAID';
        await order.save();

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: { order }
        });
    } catch (error) {
        next(error);
    }
};

// Webhook handler
exports.handleWebhook = async (req, res, next) => {
    try {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

        const event = req.body.event;
        const payload = req.body.payload.payment.entity;

        console.log('Webhook Event:', event);
        console.log('Payload:', payload);

        if (event === 'payment.captured') {
            // Payment successful
            const order = await PaymentOrder.findOne({
                where: { razorpayOrderId: payload.order_id }
            });

            if (order && order.status !== 'PAID') {
                order.razorpayPaymentId = payload.id;
                order.status = 'PAID';
                await order.save();
                console.log(`Order ${order.orderNumber} marked as PAID`);
            }
        } else if (event === 'payment.failed') {
            // Payment failed
            const order = await PaymentOrder.findOne({
                where: { razorpayOrderId: payload.order_id }
            });

            if (order) {
                order.status = 'FAILED';
                await order.save();
                console.log(`Order ${order.orderNumber} marked as FAILED`);
            }
        }

        res.json({ success: true, message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook error:', error);
        next(error);
    }
};

// Get payment details
exports.getPaymentDetails = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await PaymentOrder.findOne({
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

        if (!order.razorpayPaymentId) {
            return res.status(404).json({
                success: false,
                message: 'No payment found for this order'
            });
        }

        // Fetch payment details from Razorpay
        const payment = await razorpayInstance.payments.fetch(order.razorpayPaymentId);

        res.json({
            success: true,
            data: {
                payment,
                orderStatus: order.status
            }
        });
    } catch (error) {
        next(error);
    }
};
