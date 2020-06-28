const config = require('config');
const mongoose = require('mongoose');
const debug = require('debug')('app:startup');
const morgan = require('morgan');
const Joi = require('joi');
const courses = require('./routes/courses');
const customers = require('./routes/customers');
const home = require('./routes/home');
const users = require('./routes/users');
const auth = require('./routes/auth');
const express = require('express');
const app = express();

if(!config.get('jwtPrivateKey')){
    console.log('FATAL ERROR: jwtPrivateKey is not defined');
    process.exit(1);
}
mongoose.connect('mongodb://localhost/dpData')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...'))

app.set('view engine', 'pug');
app.use(express.json());
app.use(express.static('public'));
app.use('/api/courses', courses);
app.use('/api/customers', customers);
app.use('/api/users', users);
app.use('/api/auth',auth);
app.use('/', home);

if (app.get('env') === 'development'){
    app.use(morgan('tiny'));
    debug('Morgan enabled...');
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));