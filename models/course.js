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
    price:{
        type:Number,
        required:true,
        min:0,
        max:500
    }
}));

function validateCourse(course){
    const schema = {
        name: Joi.string().min(5).max(50),
        price: Joi.number().min(0).max(500)
    }
    return Joi.validate(course, schema);
}

exports.Course = Course;
exports.validate = validateCourse;