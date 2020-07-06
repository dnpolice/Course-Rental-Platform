const Joi = require('joi');
const {Rental} = require('../models/rental');
const {Course} = require('../models/course');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const express = require('express');
const router = express.Router();


router.post('/', [auth, validate(validateReturn)], async (req, res) => {

    const rental = await Rental.lookup(req.body.customerId, req.body.courseId)
    
    if (!rental) return res.status(404).send('Rental not found');
    
    if (rental.dateReturned) return res.status(400).send('Return already processed');

    rental.return();

    await Course.update({ _id: rental.course._id }, {
        $inc: { numberInStock: 1 }
    });

    await rental.save();

    return res.send(rental);
});

function validateReturn(req){
    const schema = {
        customerId: Joi.objectId().required(),
        courseId: Joi.objectId().required()
    }
    return Joi.validate(req, schema);
};

module.exports = router;