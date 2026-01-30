const express = require('express');
const router = express.Router();
const { dishController } = require('../controllers');
const { protect, validateDish, validateMongoId } = require('../middleware');
const { uploadImages, uploadModel, uploadThumbnail } = require('../config/multer');

// Public routes
router.get('/:id', dishController.getDish);
router.post('/:id/ar-view', dishController.trackARView);

// Protected routes
router.post('/', protect, validateDish, dishController.createDish);
router.get('/', protect, dishController.getDishes);
router.put('/:id', protect, validateMongoId('id'), dishController.updateDish);
router.delete('/:id', protect, validateMongoId('id'), dishController.deleteDish);

// Upload routes
router.post('/:id/images', protect, uploadImages.array('images', 60), dishController.uploadDishImages);
router.post('/:id/model', protect, uploadModel.single('model'), dishController.uploadDishModel);

module.exports = router;
