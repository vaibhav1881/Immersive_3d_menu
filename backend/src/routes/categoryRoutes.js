const express = require('express');
const router = express.Router();
const { categoryController } = require('../controllers');
const { protect, validateCategory, validateMongoId } = require('../middleware');

// Protected routes
router.post('/', protect, validateCategory, categoryController.createCategory);
router.get('/', protect, categoryController.getCategories);
router.get('/:id', protect, validateMongoId('id'), categoryController.getCategory);
router.put('/:id', protect, validateMongoId('id'), categoryController.updateCategory);
router.delete('/:id', protect, validateMongoId('id'), categoryController.deleteCategory);
router.put('/reorder', protect, categoryController.reorderCategories);

module.exports = router;
