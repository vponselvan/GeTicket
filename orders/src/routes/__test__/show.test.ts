import { createTicket } from './../../test/create-ticket';
import request from 'supertest';
import { app } from '../../app';
import { getCookie } from '../../test/get-cookie';

it('fetches all the orders for an user', async () => {
    const title = 'Ticket to Ride';
    const price = 50;
    const ticket = await createTicket(title, price);

    const userCookie = getCookie();

    const orderResponse = await request(app)
        .post('/api/orders')
        .set('Cookie', userCookie)
        .send({ ticketId: ticket.id })
        .expect(201);

    const response = await request(app)
        .get(`/api/orders/${orderResponse.body.id}`)
        .set('Cookie', userCookie)
        .send()
        .expect(200);

    expect(response.body.id).toEqual(orderResponse.body.id);
});

it('returns unathorized error if another user access the order', async () => {
    const title = 'Ticket to Ride';
    const price = 50;
    const ticket = await createTicket(title, price);

    const userCookie = getCookie();

    const orderResponse = await request(app)
        .post('/api/orders')
        .set('Cookie', userCookie)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .get(`/api/orders/${orderResponse.body.id}`)
        .set('Cookie', getCookie())
        .send()
        .expect(401);
});