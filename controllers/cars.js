const Car = require('../models/Car');

//@desc     Get all cars
//@route    Get /api/v1/cars
//@access   Public
exports.getCars = async (req,res,next) => {
    // try{
    //     const cars = await Car.find();

    //     res.status(200).json({success:true, count:cars.length, data:cars});
    // } catch(err){
    //     res.status(400).json({success:false});
    // }
    let query;

    //Copy req.query
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    //console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    //Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //Finding resource
    query = Car.find(JSON.parse(queryStr)).populate('bookings');

    //Select Fields
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //Sort
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('pricePerDay');
    }

    //Pagination
    const page = parseInt(req.query.page, 10)||1;
    const limit = parseInt(req.query.limit, 10)||25;
    const startIndex = (page-1)*limit;
    const endIndex = page*limit;

    try {
        const total = await Car.countDocuments();
        query = query.skip(startIndex).limit(limit);
        //Execute query
        const cars = await query;
        // console.log(req.query);

        //Pagination result
        const pagination = {};
        if(endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }
        if(startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        res.status(200).json({success: true, count: cars.length, pagination, data: cars});
    } catch(err) {
        res.status(400).json({success: false, message: `Unable to view all cars due to an unexpected error`});
    }
};

//@desc     Get single car
//@route    Get /api/v1/cars/:id
//@access   Public
exports.getCar = async (req,res,next) => {
    try{
        const car = await Car.findById(req.params.id).populate('bookings');

        if(!car){
            return res.status(400).json({success:false, message: `The car does not exist!`});
        }

        res.status(200).json({success:true, data:car});
    } catch(err){
        res.status(400).json({success:false, message: `Unable to view the car due to an unexpected error`});
    }
};

//@desc     Create a car
//@route    POST /api/v1/cars
//@access   Private
exports.createCar = async (req,res,next) => {
    const car = await Car.create(req.body);
    res.status(201).json({success:true, data:car});
};

//@desc     Update single car
//@route    PUT /api/v1/cars/:id
//@access   Private
exports.updateCar = async (req,res,next) => {
    try{
        const car = await Car.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators: true});

        if(!car){
            return res.status(400).json({success:false, message: `The car does not exist!`});
        }

        res.status(200).json({success:true, data:car});
    } catch(err){
        res.status(400).json({success:false, message: 'Unable to update the car due to an unexpected error'});
    }
};

//@desc     Delete single car
//@route    DELETE /api/v1/cars/:id
//@access   Private
exports.deleteCar = async (req,res,next) => {
    try{
        const car = await Car.findById(req.params.id);

        if(!car){
            return res.status(404).json({success:false, message: `The car does not exist!`});
        }

        await car.deleteOne();
        res.status(200).json({success:true, data: {}});

    } catch(err){
        res.status(400).json({success:false, message: 'Unable to delete the car due to an unexpected error'});
    }
};