const express = require('express');
const router = express.Router();
const {
  getProduction, createProduction, updateProduction, deleteProduction, getProductionSummary
} = require('../controllers/productionController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/summary', getProductionSummary);
router.get('/', getProduction);
router.post('/', adminOnly, createProduction);
router.put('/:id', adminOnly, updateProduction);
router.delete('/:id', adminOnly, deleteProduction);

module.exports = router;
