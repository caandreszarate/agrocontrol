const express = require('express');
const router = express.Router();
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/calendarController');
const { protect, calendarWrite } = require('../middleware/auth');

router.use(protect);
router.get('/', getEvents);
router.post('/', calendarWrite, createEvent);
router.put('/:id', calendarWrite, updateEvent);
router.delete('/:id', calendarWrite, deleteEvent);

module.exports = router;
