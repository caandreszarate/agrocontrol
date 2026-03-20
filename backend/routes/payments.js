const express = require('express');
const router = express.Router();
const {
  getPayments, createPayment, updatePayment, markAsPaid, deletePayment
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/', getPayments);
router.post('/', adminOnly, createPayment);
router.put('/:id', adminOnly, updatePayment);
router.patch('/:id/pay', adminOnly, markAsPaid);
router.delete('/:id', adminOnly, deletePayment);

module.exports = router;
