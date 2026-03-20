const express = require('express');
const router = express.Router();
const { getPhases, updatePhase, getPhaseWithExpenses } = require('../controllers/phaseController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/', getPhases);
router.get('/:id/detail', getPhaseWithExpenses);
router.put('/:id', adminOnly, updatePhase);

module.exports = router;
