const request = require('supertest');
const { User } = require('../../models/user');
const { Course } = require('../../models/course');

let server;

describe('auth middleware', ()=> {

    beforeEach(() =>{ server = require('../../index'); });
    afterEach(async done => {
        await server.close();
        await Course.deleteMany({});
        done();
    });

    let token;

    const exec = () => {
        return request(server)
        .post('/api/courses')
        .set('x-auth-token', token)
        .send({ name: 'course1', price: 5 });
    }

    beforeEach(() => {
        token = new User().generateAuthToken();
    });


    it ('should return 401 if no token is provided', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it ('should return 400 if token is invalid', async () => {
        token = 'ajsdojasojd';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 if token is valid', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
    });
});