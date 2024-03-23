const express = require('express');
const {getCars, getCar, createCar, updateCar, deleteCar} = require('../controllers/cars');
const bookingRouter = require('./bookings');
const router = express.Router();
const {protect,authorize} = require('../middleware/auth');

//router มีหน้าที่ส่งต่อ request ให้กับ method ที่เกี่ยวข้อง (ซึ่งเป็น method ที่อยู่ในส่วนของ cars)
//Re-route into other resource routers
router.use('/:carId/bookings/', bookingRouter);

router.route('/').get(getCars).post(protect, authorize('admin'), createCar);
router.route('/:id').get(getCar).put(protect, authorize('admin'), updateCar).delete(protect, authorize('admin'), deleteCar);

module.exports = router;