import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { getCookie } from '../../test/get-cookie';

it('returns 404 if the ticket doesnt exist', async () => {
    const ticketId = '12fsdf12';
    await request(app)
        .post('/api/orders')
        .set('Cookie', getCookie())
        .send({ ticketId })
        .expect(404);
});

it('returns an error if the ticket is locked', async () => {
    const ticket = new Ticket({
        title: 'Ticket to Ride',
        price: 50
    });
    await ticket.save();

    const order = new Order({
        ticket,
        userId: 'wsafdas',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', getCookie())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it('reserves a ticket', async () => {
    const ticket = new Ticket({
        title: 'Ticket to Ride',
        price: 50
    });
    await ticket.save();

    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', getCookie())
        .send({ ticketId: ticket.id })
        .expect(201);
});

it.todo('emit an event');


