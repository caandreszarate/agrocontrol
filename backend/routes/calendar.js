const express = require('express');
const router = express.Router();
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/calendarController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/', getEvents);
router.post('/', adminOnly, createEvent);
router.put('/:id', adminOnly, updateEvent);
router.delete('/:id', adminOnly, deleteEvent);

module.exports = router;
