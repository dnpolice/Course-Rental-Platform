const { createLogger, transports, format } = require('winston');
const debug = require('debug')('app:startup');
const morgan = require('morgan');
require('winston-mongodb');

module.exports = createLogger({
    transports: [
        new transports.Console({
            level: 'info',
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }),
        new transports.File({
            filename: 'logfile.log',
            level: 'error'
        }),
        new transports.MongoDB({
            db: 'mongodb://localhost/dpData',
            level: 'error',
            options: {useUnifiedTopology: true, useNewUrlParser: true},
            level : 'error'
        })      
    ],
    exceptionHandlers: [
        new transports.Console({
            level: 'info',
            format: format.combine(
                format.colorize(),
                format.simple()
            )
        }),
        new transports.File({
            filename: 'unCaughtExceptions.log',
            level: 'error'
        })
    ]
});


    // winston.configure({
    //     transports : [
    //         new winston.transports.File({ filename: 'logfile.log'}), 
    //         new winston.transports.Console(),
    //         new winston.transports.MongoDB({db : 'mongodb://localhost/dpData',
    //         options: {useUnifiedTopology: true, useNewUrlParser: true}, level : 'error'})
    // ],
    //     exceptionHandlers: [
    //         new winston.transports.File({ filename: 'unCaughtExceptions.log' }),
    //         new winston.transports.Console()
    //     ]
    // });

    // if (app.get('env') === 'development'){
    //     app.use(morgan('tiny'));
    //     debug('Morgan enabled...');
    // }