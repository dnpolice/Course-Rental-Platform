const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {Customer, validate} = require('../models/customer');
const express = require('express');
const router = express.Router();

//Get all customers
router.get('/', auth, async (req, res) => {
  try{
    const customers = await Customer.find().sort('name');
  } catch (ex){
    res.status(500).send('Failed');
  }
    res.send(customers);
});

//Add new customer
router.post('/', auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold

    });
    customer = await customer.save();
    
    res.send(customer);
});

//Modify Customer
router.put('/:id', async (req, res) => {
    const { error } = validate(req.body); 
    if (error) return res.status(400).send(error.details[0].message);
  
    const customer = await Customer.findByIdAndUpdate(req.params.id,
      { 
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone
      }, { new: true });
  
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    
    res.send(customer);
  });

//Remove customer
router.delete('/:id', [auth, admin] ,async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if (!customer) return res.status(404).send('The customer with given ID not found');

    res.send(customer);
});

//Get specific customer
router.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if(!customer) return res.status(404).send('The customer with given ID not found');

    res.send(customer);
});

module.exports = router;