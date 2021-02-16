import request from 'supertest';
import { app } from "../../app";


it('fails when an email that does not exist is used', async () => {
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@geticket.com',
            password: 'password'
        })
        .expect(400);
});

it('fails when in correct password is used', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@geticket.com',
            password: 'password'
        })
        .expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@geticket.com',
            password: 'passwor'
        })
        .expect(400);
});

it('response has a cookie on a valid sigin', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@geticket.com',
            password: 'password'
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@geticket.com',
            password: 'password'
        })
        .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});