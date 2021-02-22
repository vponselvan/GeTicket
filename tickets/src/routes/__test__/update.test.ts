import { natsWrapper } from './../../nats-wrapper';
import request from 'supertest';
import { app } from '../../app';
import { createTicket } from './../../test/create-ticket';
import { getCookie } from './../../test/get-cookie';

it('returns 404 if the id is invalid or doesnt exist', async () => {
    const invalidId = '123hsdf3'
    await request(app)
        .put(`/api/tickets/${invalidId}`)
        .set('Cookie', getCookie())
        .send({
            title: 'Ticket to Ride',
            price: 50
        })
        .expect(404);
});

it('returns 401 if the user is not authenticated', async () => {
    const invalidId = '123hsdf3'
    await request(app)
        .put(`/api/tickets/${invalidId}`)
        .send({
            title: 'Ticket to Ride',
            price: 50
        })
        .expect(401);
});

it('returns 401 if the user doesnt own the ticket', async () => {
    const response = await createTicket('Ticket to Ride', 50);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', getCookie())
        .send({
            title: 'Ticket to Ride',
            price: 100
        })
        .expect(401);

});

it('returns 400 if the request has invalid title or price', async () => {
    const cookie = getCookie();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Ticket to Ride',
            price: 20
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 50
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            price: 50
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Ticket to Ride',
            price: -50
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Ticket to Ride'
        })
        .expect(400);

});

it('updates the ticket', async () => {
    const cookie = getCookie();
    const title = 'Ticket to Ride';

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price: 20
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            price: 50
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send({});

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(50);
});

it('publishes an event when the ticket is updated', async () => {
    const cookie = getCookie();
    const title = 'Ticket to Ride';

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title,
            price: 20
        })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            price: 50
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});