const { Store, sequelize } = require('../models');

// Create store
exports.createStore = async (req, res, next) => {
    try {
        const { name, code, contact, email, addressLine1, addressLine2, city, state, country, pincode, latitude, longitude } = req.body;

        if (!name || !code || !contact || !addressLine1 || !city || !state || !pincode || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const store = await Store.create({
            name, code, contact, email,
            addressLine1, addressLine2,
            city, state, country: country || 'India',
            pincode, latitude, longitude
        });

        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            data: { store }
        });
    } catch (error) {
        next(error);
    }
};

// Get all stores
exports.getAllStores = async (req, res, next) => {
    try {
        const stores = await Store.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: { stores }
        });
    } catch (error) {
        next(error);
    }
};

// Get store by ID
exports.getStoreById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const store = await Store.findByPk(id);

        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        res.json({
            success: true,
            data: { store }
        });
    } catch (error) {
        next(error);
    }
};

// Get nearby stores (Haversine query)
exports.getNearbyStores = async (req, res, next) => {
    try {
        const { latitude, longitude, radius = 5 } = req.query;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const radiusKm = parseFloat(radius);

        // Haversine formula in SQL
        const stores = await sequelize.query(`
      SELECT *,
        (6371 * acos(
          cos(radians(:lat)) * 
          cos(radians(latitude)) * 
          cos(radians(longitude) - radians(:lon)) + 
          sin(radians(:lat)) * 
          sin(radians(latitude))
        )) AS distance_km
      FROM stores
      WHERE isActive = 1
      HAVING distance_km <= :radius
      ORDER BY distance_km ASC
    `, {
            replacements: { lat, lon, radius: radiusKm },
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: {
                stores,
                searchLocation: { latitude: lat, longitude: lon },
                radiusKm
            }
        });
    } catch (error) {
        next(error);
    }
};
