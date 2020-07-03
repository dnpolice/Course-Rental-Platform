const express = require('express');
const courses = require('../routes/courses');
const customers = require('../routes/customers');
const home = require('../routes/home');
const users = require('../routes/users');
const auth = require('../routes/auth');
const error = require('../middleware/error');

module.exports = function(app){
    app.set('view engine', 'pug');
    app.use(express.json());
    app.use(express.static('public'));
    app.use('/api/courses', courses);
    app.use('/api/customers', customers);
    app.use('/api/users', users);
    app.use('/api/auth',auth);
    app.use('/', home);
    app.use(error);
}