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
            const course = new Course({ name: 'course1', price: 5});
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
        let price;

        const exec = async () => {
            return await request(server)
            .post('/api/courses')
            .set('x-auth-token', token)
            .send({ name , price });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'course1';
            price = 5;
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

        it('should return 400 if price is less than 0 characters', async () => {
            price = -1;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if price is more than 500 characters', async () => {
            price = 600;

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return the course if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', name);
            expect(res.body).toHaveProperty('price', price);
        });
    });

    describe('PUT /', () => {
        let token;
        let newName;
        let newPrice;
        let course;
        let id;

        const exec = async() => {
            return await request(server)
                .put('/api/courses/' + id)
                .set('x-auth-token', token)
                .send({ name: newName, price: newPrice });
        }

        beforeEach(async () => {
            course = new Course({ name: 'course1', price: 5 });
            await course.save();

            token = new User().generateAuthToken();
            id = course._id;
            newName = 'updatedName';
            newPrice = 50;
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

        it('should return 400 if price is more than 500', async () =>{
            newPrice = 501;

            const res = await exec();
            
            expect(res.status).toBe(400);
        });

        it('should return 400 if price is more than 500', async () =>{
            newPrice = -10;

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

            const updatedCourse = await Course.findById(course.id);

            expect(updatedCourse.name).toBe(newName);
            expect(updatedCourse.price).toBe(newPrice);
        });

        it('should return the updated course course is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', newName);
            expect(res.body).toHaveProperty('price', newPrice);
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
            course = new Course({ name: 'course1', price: 5});
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

            const genreInDb = await Course.findById(id);

            expect(genreInDb).toBeNull();
        });

        it('should return the removed course', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id', course._id.toHexString());
            expect(res.body).toHaveProperty('name', course.name);
            expect(res.body).toHaveProperty('price', course.price);
        });
    });
});