const express = require('express');
const router = express.Router();
const {
  getExpenses, createExpense, updateExpense, deleteExpense, getExpenseSummary
} = require('../controllers/expenseController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/summary', getExpenseSummary);
router.get('/', getExpenses);
router.post('/', adminOnly, createExpense);
router.put('/:id', adminOnly, updateExpense);
router.delete('/:id', adminOnly, deleteExpense);

module.exports = router;
