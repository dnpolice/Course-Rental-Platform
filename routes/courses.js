const {Course, validateCourse} = require('../models/course');
const express = require('express');
const router = express.Router();
const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');

router.get('/', async (req, res) => {
    const courses = await Course.find().sort('name');
    res.send(courses)
});

router.post('/', [auth, validate(validateCourse)], async (req, res) => {
    let course = new Course({
        name: req.body.name,
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    });

    course = await course.save();

    res.send(course);
});

//To Update Name
router.put('/:id', [validateObjectId, auth, validate(validateCourse)], async (req, res) => {
    const course = await Course.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            numberInStock: req.body.numberInStock,
            dailyRentalRate: req.body.dailyRentalRate
        }, { new: true});

    if (!course) return res.status(404).send('The course with the given ID was not found.');

    res.send(course);
});

//Delete By ID
router.delete('/:id', [validateObjectId, auth, admin], async (req, res) => {
    const course = await Course.findByIdAndRemove(req.params.id);

    if (!course) return res.status(404).send('The course with the given ID was not found.');
    
    res.send(course);
});

//
router.get('/:id', validateObjectId, async (req, res) => {      
    const course = await Course.findOne({ _id: req.params.id});
    
    if (!course) return res.status(404).send('The course with the given ID was not found.');
    
    res.send(course);
});

module.exports = router;