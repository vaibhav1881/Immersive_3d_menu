const express = require('express');
const router = express.Router();
const { restaurantController } = require('../controllers');
const { protect, validateRestaurant, validateMongoId } = require('../middleware');

// Public routes
router.get('/:id', restaurantController.getRestaurant);
router.get('/:id/menu', restaurantController.getRestaurantMenu);

// Protected routes
router.post('/', protect, validateRestaurant, restaurantController.createRestaurant);
router.get('/me', protect, restaurantController.getMyRestaurant);
router.put('/:id', protect, validateMongoId('id'), restaurantController.updateRestaurant);
router.delete('/:id', protect, validateMongoId('id'), restaurantController.deleteRestaurant);

module.exports = router;
