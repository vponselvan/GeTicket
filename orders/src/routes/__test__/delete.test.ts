import { createTicket } from './../../test/create-ticket';
import request from 'supertest';
import { app } from '../../app';
import { getCookie } from '../../test/get-cookie';
import { OrderStatus } from '@geticket/common';

it('updates order to cancelled', async () => {
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
        .patch(`/api/orders/${orderResponse.body.id}`)
        .set('Cookie', userCookie)
        .send()
        .expect(204);

    const { body: updatedOrder } = await request(app)
        .get(`/api/orders/${orderResponse.body.id}`)
        .set('Cookie', userCookie)
        .send();

    expect(updatedOrder.status).toEqual(OrderStatus.Cancelled);
});

it.todo('publish an cancel event')