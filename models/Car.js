const mongoose = require('mongoose');

//name address district province postalcode tel type price licenseplate
const CarSchema = new mongoose.Schema({
    brand: {
        type: String,
        enum: ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan',
        'Volkswagen', 'Tesla', 'Lexus', 'Subaru', 'Mazda', 'Hyundai', 'Kia', 'Volvo',
        'Porsche', 'Jaguar', 'Land Rover', 'Jeep', 'Ram', 'Chrysler', 'Dodge', 'Cadillac',
        'Buick', 'GMC', 'Acura', 'Infiniti', 'Mitsubishi', 'Mini', 'Fiat', 'Alfa Romeo',
        'Genesis', 'Smart', 'Lincoln', 'Bentley', 'Ferrari', 'Maserati', 'McLaren', 'Rolls-Royce',
        'Bugatti', 'Lamborghini', 'Aston Martin', 'Lotus', 'Koenigsegg', 'Pagani', 'Maybach',
        'Saab', 'Saturn', 'Pontiac', 'Hummer', 'Oldsmobile', 'Plymouth', 'Datsun', 'Isuzu',
        'Suzuki', 'Scion', 'Geo', 'AMC', 'Studebaker', 'Hudson', 'DeLorean', 'Packard'],
        required: [true, 'Please add a name of car brand.']
    },
    carModel: {
        type: String,
        required: [true, 'Please add a name of model.'],
        trim: true,
        maxlength: [50, 'Name of model can not be more than 50 characters.']
    },
    type: {
        type: String,
        enum: ['sedan', 'sport', 'truck', 'hatchback', 'convertible', 'suv', 'coupe', 
        'van', 'minivan', 'pickup', 'electric', 'hybrid', 'luxury', 'crossover'],
        required: [true, 'Please add a type.']
    },
    pricePerDay: {
        type: Number,
        required: true,
        min: [0, 'Price per day must be greater than or equal to 0.']
    },
    licensePlate :{
        type: String,
        unique: true
    },
    address: {
        type: String,
        required: [true, 'Please add an address.']
    },
    district: {
        type: String,
        required: [true, 'Please add a district.']
    },
    province: {
        type: String,
        required: [true, 'Please add a province.']
    },
    postalCode: {
        type: String,
        required: [true, 'Please add a postalcode.'],
        maxlength: [5,'Postal Code cannot be more than 5 digits.']
    },
    googleMapsURL: {
        type: String,
        required: [true, 'Please add an Google Maps URL.'],
        // match: [
        //     /^(https:\/\/maps\.app\.goo\.gl\/.*)$|^(https?:\/\/(www\.)?google\.com\/maps\/(?:.*?\&)?(q|daddr)=.*)$/,
        //     'Please add a valid Google Maps URL.'
        // ]
    },
    imageURL: {
        type: String,
        required: [true, 'Please add an image URL'],
        // match: [
        //     /^https?:\/\/.*\.(jpg|jpeg|png|webp|avif|gif|svg)(\?.*)?$/i,
        //     'Please add a valid image URL.'
        // ]
    },
    tel: {
        type: String,
        required: [true, 'Please add a telephone number.'],
        match: [
            /^0[0-9]{9}$/,
            'Please add a valid telephone number.'
        ]
    }

}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Reverse populate with virtuals
CarSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'car',
    justOne: false
});

//Cascade delete appointments when  a hospital is deleted
CarSchema.pre('deleteOne', {document: true, query: false}, async function(next) {
    console.log(`Bookings being removed from car ${this.id}`);
    await this.model('Booking').deleteMany({car: this.id});
    next();
});

module.exports=mongoose.model('Car',CarSchema);