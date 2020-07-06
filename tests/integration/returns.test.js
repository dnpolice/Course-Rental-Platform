const moment = require('moment');
const request = require('supertest');
const {Rental} = require('../../models/rental');
const {Course} = require('../../models/course');
const {User} = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/returns', () => {
    let customerId;
    let courseId;
    let rental;
    let course;

    const exec = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, courseId });
    }

    beforeEach(async () => { 
        server = require('../../index');

        customerId = mongoose.Types.ObjectId();
        courseId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        course = new Course({
            _id: courseId,
            name:'12345',
            dailyRentalRate: 1,
            numberInStock: 5
        })
        await course.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name:'12345',
                phone:'12345'
            },
            course: {
                _id: courseId,
                name: '12345',
                dailyRentalRate: 1
            }
        });
        await rental.save();
    });
    afterEach(async done => {
        await server.close();
        await Rental.deleteMany({});
        await Course.deleteMany({});
        done();
    });

    it('should return 401 if client is not logged in', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async () => {
        customerId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if courseId is not provided', async () => {
        courseId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental found for customer/course', async () => {
        await Rental.deleteMany({});

        const res = await exec();

        expect(res.status).toBe(404);
    });

    it('should return 400 if no return is already processed', async () => {
        rental.dateReturned = new Date();
        await rental.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if valid', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });

    it('should set return date given valid input', async () => {
        const res = await exec();

        const rentalInDb = await Rental.findOne({ _id: rental._id });        
        const diff = new Date() - rentalInDb.dateReturned;
        
        expect(diff).toBeLessThan(10*1000);
    });

    it('should set the rentalFee if valid input', async () => {
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();
        
        const res = await exec();

        const rentalInDb = await Rental.findOne({ _id: rental._id });                
        expect(rentalInDb.rentalFee).toBe(7);
    });

    it('should increase the course stock by 1 if valid', async () => {      
        const res = await exec();

        const courseInDb = await Course.findOne({ _id: course._id });                
        expect(courseInDb.numberInStock).toBe(course.numberInStock + 1);
    });

    it('should return the rental the input is valid', async () => {      
        const res = await exec();
        
        const rentalInDb = await Rental.findOne({ _id: rental._id })

        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'course'])
        )
    });
});