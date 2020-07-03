const {Course, validate} = require('../models/course');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const courses = await Course.find().sort('name');
    res.send(courses)
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let course = new Course({
        name: req.body.name,
        price: req.body.price
    });
    course = await course.save();

    res.send(course);
});

//To Update Name
router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const course = await Course.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            price: req.body.price
        }, { new: true});

    if (!course) return res.status(404).send('The course with the given ID was not found.');

    res.send(course);
});

//Delete By ID
router.delete('/:id', async (req, res) => {
    const course = await Course.findByIdAndRemove(req.params.id);

    if(!course) return res.status(404).send('The course with the given ID was not found.');
    
    res.send(course);
});

//
router.get('/:id', async (req, res) => {
    const course = await Course.findById(req.params.id);
    
    if (!course) res.status(404).send('The course with the given ID was not found.');
    
    res.send(course);
});

module.exports = router;