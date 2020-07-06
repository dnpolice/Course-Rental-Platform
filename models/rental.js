const Joi = require('joi');
const mongoose = require('mongoose');
const moment = require('moment');

const rentalSchema = mongoose.Schema({
    customer: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            },
            isGold: {
                type: Boolean,
                defualt: false
            },
            phone: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            }
        }),
        required: true
    },
    course: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                trim: true,
                minlength: 5,
                maxlength: 255
            },
            dailyRentalRate: {
                type: Number,
                required: true,
                min: 0,
                max: 255
            }
        }),
        required: true
    },
    dateOut: {
        type: Date,
        default: Date.now()
    },
    dateReturned: {
        type: Date
    },
    rentalFee: {
        type: Number,
        min: 0
    }
});

rentalSchema.statics.lookup = function(customerId, courseId){
    return this.findOne({
        'customer._id': customerId,
        'course._id': courseId
    });
}

rentalSchema.methods.return = function () {
    this.dateReturned = new Date();

    const rentalDays = moment().diff(this.dateOut, 'days')
    this.rentalFee = rentalDays * this.course.dailyRentalRate;
}

const Rental = mongoose.model('Rental', rentalSchema);

const validate = function(rental){
    const schema = {
        customerId: Joi.string().required(),
        courseId: Joi.string().required()
    };

    return Joi.validate(rental, schema);
}

exports.Rental = Rental;
exports.validate = validate;
