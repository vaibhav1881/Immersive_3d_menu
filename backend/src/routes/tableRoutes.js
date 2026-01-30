const express = require('express');
const router = express.Router();
const { tableController } = require('../controllers');
const { protect, validateTable, validateMongoId } = require('../middleware');

// Protected routes
router.post('/', protect, validateTable, tableController.createTable);
router.post('/bulk', protect, tableController.bulkCreateTables);
router.get('/', protect, tableController.getTables);
router.get('/:id', protect, validateMongoId('id'), tableController.getTable);
router.put('/:id', protect, validateMongoId('id'), tableController.updateTable);
router.delete('/:id', protect, validateMongoId('id'), tableController.deleteTable);
router.post('/:id/regenerate-qr', protect, validateMongoId('id'), tableController.regenerateQR);

module.exports = router;
