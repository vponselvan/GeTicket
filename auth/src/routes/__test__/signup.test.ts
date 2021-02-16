import request from 'supertest';
import { app } from "../../app";


it('returns a 201 on successful signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@geticket.com',
            password: 'password'
        })
        .expect(201);
});

it('returns a 400 on invalid email', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'tsdftest',
            password: 'password'
        })
        .expect(400);
});

it('returns a 400 on invalid password', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@geticket.com',
            password: 'p'
        })
        .expect(400);
});

it('returns a 400 on missing email or password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            password: 'password'
        })
        .expect(400);
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@geticket.com'
        })
        .expect(400);
});

it('Disallow duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@geticket.com',
            password: 'password'
        })
        .expect(201);
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@geticket.com',
            password: 'password'
        })
        .expect(400);
});

it('sets cookie after successful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@geticket.com',
            password: 'password'
        })
        .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();

});
