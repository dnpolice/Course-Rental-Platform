const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', {title: 'Course Rentals' , message: 'Course Rental Platform'});
});

module.exports = router;