const request = require('supertest');
const { Course } = require('../../models/course');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/courses', () => {
    beforeEach(() => { server = require('../../index') });
    afterEach(async done => { 
        await server.close();
        await Course.deleteMany({});
        done();
     });

    describe('GET /', () => {
        it('should return all courses', async () => {
            Course.collection.insertMany([
                { name: 'course1' },
                { name: 'course2' }
            ]);
            const res = await request(server).get('/api/courses');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some( c => c.name === 'course1')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return course if valid id is passed', async () => {
            const course = new Course({ name: 'course1', numberInStock: 200, dailyRentalRate: 300 });
            await course.save();

            const res = await request(server).get('/api/courses/' + course._id);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', course.name);
        });

        it('should return 404 if invalid id is passed', async () => {
            const res = await request(server).get('/api/courses/1');
            expect(res.status).toBe(404);
        });

        it('should return 404 if no course with given id exists', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/courses/' + id);
            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {

        let token;
        let name;
        let numberInStock;
        let dailyRentalRate;

        const exec = async () => {
            return await request(server)
            .post('/api/courses')
            .set('x-auth-token', token)
            .send({ name , numberInStock, dailyRentalRate });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'course1';
            numberInStock = 200;
            dailyRentalRate = 300;
        });

        it('should save the course if it is valid', async () => {
            const res = await exec();

            const course = await Course.findOne({ name:'course1'});

            expect(course).not.toBeNull();
        });

        it('should return 401 if the client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if course is less than 5 characters', async () => {
            name = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if course is more than 50 characters', async () => {
            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if numberInStock is less than 0 characters', async () => {
            numberInStock = -1;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if numberInStock is more than 500 characters', async () => {
            numberInStock = 600;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if price is less than 0 characters', async () => {
            dailyRentalRate = -1;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if price is more than 300 characters', async () => {
            dailyRentalRate = 400;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return the course if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', name);
            expect(res.body).toHaveProperty('numberInStock', numberInStock);
            expect(res.body).toHaveProperty('dailyRentalRate', dailyRentalRate);
        });
    });

    describe('PUT /', () => {
        let token;
        let newName;
        let newNumberInStock;
        let newDailyRentalRate;
        let course;
        let id;

        const exec = async() => {
            return await request(server)
                .put('/api/courses/' + id)
                .set('x-auth-token', token)
                .send({ name: newName, dailyRentalRate: newDailyRentalRate, numberInStock: newNumberInStock });
        }

        beforeEach(async () => {
            course = new Course({ name: 'course1', dailyRentalRate: 100, numberInStock: 100 });
            await course.save();

            token = new User().generateAuthToken();
            id = course._id;
            newName = 'updatedName';
            newNumberInStock = 200;
            newDailyRentalRate = 200;
        });

        it('should return 401 if client is not logged on', async () => {
            token = '';

            const res = await exec();
            
            expect(res.status).toBe(401);
        });

        it('should return 400 if name is less than 5 characters', async () =>{
            newName = 'aaaa';

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 400 if name is more than 50 characters', async () =>{
            newName = new Array(52).join('a');

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 400 if numberInStock is more than 500', async () =>{
            newNumberInStock = 501;

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 400 if numberInStock is less than 500', async () =>{
            newNumberInStock = -10;

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 400 if dailyRentalRate is more than 500', async () =>{
            newDailyRentalRate = 501;

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 400 if dailyRentalRate is less than 500', async () =>{
            newDailyRentalRate = -10;

            const res = await exec();
            
            expect(res.status).toBe(400);
        });


        it('should return 404 if id is invalid', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if id is invalid', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if course with given id was not found', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should update the course if input is valid', async () => {
            await exec();

            const updatedCourse = await Course.findOne({_id : course.id});
            
            expect(updatedCourse.name).toBe(newName);
            expect(updatedCourse.dailyRentalRate).toBe(newDailyRentalRate);
            expect(updatedCourse.numberInStock).toBe(newNumberInStock);
        });

        it('should return the updated course course is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', newName);
            expect(res.body).toHaveProperty('dailyRentalRate', newDailyRentalRate);
            expect(res.body).toHaveProperty('numberInStock', newNumberInStock);
        });
    });

    describe('DELETE /', () => {
        let course;
        let id;
        let token;

        const exec = async () => {
            return await request(server)
                .delete('/api/courses/' + id)
                .set('x-auth-token', token)
                .send();
        }


        beforeEach(async () => {
            course = new Course({ name: 'course1', dailyRentalRate: 100, numberInStock: 100 });
            await course.save();
            
            id = course._id;
            token = User({ isAdmin: true }).generateAuthToken();
        });

        it('should return 401 if not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if the user is not admin', async () => {
            token = new User({isAdmin:false}).generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if the id is invalid', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if no course is found with given id', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete the course if input is valid', async () => {
            await exec();

            const courseInDb = await Course.findById(id);

            expect(courseInDb).toBeNull();
        });

        it('should return the removed course', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id', course._id.toHexString());
            expect(res.body).toHaveProperty('name', course.name);
            expect(res.body).toHaveProperty('dailyRentalRate', course.dailyRentalRate);
            expect(res.body).toHaveProperty('numberInStock', course.numberInStock);
        });
    });
});