import request from 'supertest';
import { app } from '../../app';
import { getCookie } from '../../test/get-cookie';

it('returns 404 on an invalid Id', async () => {
    const invalidId = '123hsdf3'
    await request(app)
        .get(`/api/tickets/${invalidId}`)
        .send()
        .expect(404);
});

it('returns the ticket with the valid Id', async () => {
    const title = 'Ticket to Ride';
    const price = 50;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', getCookie())
        .send({ title, price })
        .expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});