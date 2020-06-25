const mongoose = require('mongoose');
const debug = require('debug')('app:startup');
const morgan = require('morgan');
const Joi = require('joi');
const logger = require('./middleware/logger');
const courses = require('./routes/courses');
const customers = require('./routes/customers');
const home = require('./routes/home');
const express = require('express');
const app = express();

mongoose.connect('mongodb://localhost/dpData')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...'))

app.set('view engine', 'pug');
app.use(express.json());
app.use(express.static('public'));
app.use(logger);
app.use('/api/courses', courses);
app.use('/api/customers', customers);
app.use('/', home);

if (app.get('env') === 'development'){
    app.use(morgan('tiny'));
    debug('Morgan enabled...');
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));