const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const validate = require('../middlewares/validate');
const { checkInSchema, checkOutSchema, bookingSchema } = require('../utils/validators');

router.get('/health', parkingController.getHealth);
router.get('/slots', parkingController.getSlots);
router.post('/tickets/check-in', validate(checkInSchema), parkingController.checkIn);
router.post('/tickets/check-out', validate(checkOutSchema), parkingController.checkOut);
router.post('/bookings', validate(bookingSchema), parkingController.createBooking);

module.exports = router;
