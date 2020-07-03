const logger = require('./logging');
const mongoose = require('mongoose');

module.exports = function(){
    mongoose.connect('mongodb://localhost/dpData', {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false})
    .then(() => logger.info('Connected to MongoDB...'));
}