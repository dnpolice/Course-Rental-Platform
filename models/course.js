const Joi = require('joi');
const mongoose = require('mongoose');

const Course = mongoose.model('Course', new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:5,
        maxlength:50
		//enum : ['Hello']
    },
    numberInStock: {
        type:Number,
        required:true,
        min:0,
        max:500
    },
    dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 300
    }
}));

function validateCourse(course){
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        numberInStock: Joi.number().min(0).max(500).required(),
        dailyRentalRate: Joi.number().min(0).max(300).required()
    }
    return Joi.validate(course, schema);
}

exports.Course = Course;
exports.validateCourse = validateCourse;