const Booking = require('../models/Booking');
const Car = require('../models/Car');

//@desc Get all Bookings
//@route GET /api/v1/bookings
//@access Public
exports.getBookings = async (req, res, next) => {
    let query;
    //General users can see only their Bookings!
    if(req.user.role !== 'admin') {
        query = Booking.find({user: req.user.id}).populate({
            path: 'car',
            select: 'brand carModel type licensePlate googleMapsURL tel'
        });
    } else { //If you are an admin, you can see all!
        if(req.params.carId) {
            // console.log(req.params.CarId);
            query = Booking.find({car: req.params.carId}).populate({
                path: 'car',
                select: 'brand carModel type licensePlate googleMapsURL tel'
            });
        } else {
            query = Booking.find().populate({
                path: 'car',
                select: 'brand carModel type licensePlate googleMapsURL tel'
            });
        }
    }

    try {
        const bookings = await query;
        res.status(200).json({success: true, count: bookings.length, data: bookings});
    } catch(err) {
        console.log(err.stack); //500 server error
        return res.status(500).json({success: false, message: 'Unable to find the bookings due to an unexpected error'});
    }
};

//@desc Get single Booking
//@route GET /api/v1/bookings/:id
//@access Public
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'car',
            select: 'brand carModel type licensePlate googleMapsURL tel'
        });

        if(!booking) {
            return res.status(404).json({success: false, message: `No booking with the id of ${req.params.id}.`});
        }

        res.status(200).json({success: true, data: booking});

    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({success: false, message: 'Unable to view the booking due to an unexpected error'});
    }
};

//@desc Add Booking
//@route POST /api/v1/cars/:carId/bookings/
//@access Private
exports.addBooking = async (req, res, next) => {
    try {
        req.body.car = req.params.carId;

        const car = await Car.findById(req.params.carId);

        if (!car) {
            return res.status(404).json({ success: false, message: `The car does not exist!` });
        }

        // Add user Id to req.body
        req.body.user = req.user.id;

        // Check for existing Bookings for the same car and date
        const existingBooking = await Booking.findOne({
            car: req.params.carId,
            bookingDate: req.body.bookingDate
        });

        // If the booking already exists for the same car and date
        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: `Cannot book the car ID ${req.params.carId} on date ${req.body.bookingDate}.`,
            });
        }

        // Check for existed Bookings
        const existedBookings = await Booking.find({ user: req.user.id });

        // If the user is not an admin, they can only create 3 Bookings.
        if (existedBookings.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: `The user with ID ${req.user.id} has already made 3 Bookings.`,
            });
        }

        const booking = await Booking.create(req.body);
        res.status(200).json({ success: true, data: booking });

    } catch (err) {
        console.log(err.stack);
        return res.status(500).json({ success: false, message: 'Unable to add the booking due to an unexpected error'});
    }
};

//@desc Update Booking
//@route PUT /api/v1/bookings/:id
//@access Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if(!booking) {
            return res.status(404).json({success: false, message: `The booking does not exist!`});
        }

        //Make sure user is the Booking owner
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this Booking`});
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({success: true, data: booking});

    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({success: false, message: 'Unable to update the booking due to an unexpected error'});
    }
};

//@desc Delete Booking
//@route DELETE /api/v1/bookings/:id
//@access Private
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if(!booking) {
            return res.status(404).json({success: false, message: `The booking does not exist!`});
        }

        //Make sure user is the Booking owner
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this Booking`});
        }

        await booking.deleteOne();
        res.status(200).json({success: true, data: {}});

    } catch(err) {
        console.log(err.stack);
        return res.status(500).json({success: false, message: 'Unable to delete the booking due to an unexpected error'});
    }
};