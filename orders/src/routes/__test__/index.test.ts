import { createTicket } from './../../test/create-ticket';
import request from 'supertest';
import { app } from '../../app';
import { getCookie } from '../../test/get-cookie';

it('fetches all the orders for an user', async () => {
    const ticketOne = await createTicket();
    const ticketTwo = await createTicket();
    const ticketThree = await createTicket();

    const userOneCookie = getCookie();
    const userTwoCookie = getCookie();

    await request(app)
        .post('/api/orders')
        .set('Cookie', userOneCookie)
        .send({ ticketId: ticketOne.id })
        .expect(201);

    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwoCookie)
        .send({ ticketId: ticketTwo.id })
        .expect(201);

    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwoCookie)
        .send({ ticketId: ticketThree.id })
        .expect(201);

    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwoCookie)
        .expect(200);

    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
    expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});