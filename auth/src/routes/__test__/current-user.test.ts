import { getCookie } from './../../test/get-cookie';
import request from 'supertest';
import { app } from "../../app";


it('responds with current user details', async () => {
    const cookie = await getCookie();

    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send({})
        .expect(200);
    expect(response.body.currentUser.email).toEqual('test@geticket.com');
});

it('responds with null if not authorized', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send({})
        .expect(200);
    expect(response.body.currentUser).toEqual(null);
});