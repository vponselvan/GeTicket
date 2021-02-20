import request from 'supertest';
import { app } from '../../app';
import { Ticket } from './../../models/ticket';

import { getCookie } from '../../test/get-cookie';

it('has a route handler listening to /api/tickets for post', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.status).not.toEqual(404);
});

it('can only be accessed if signed in', async () => {
    await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
});

it('returns status code other than 401 for valid requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', getCookie())
        .send({});

    expect(response.status).not.toEqual(401);
});

it('returns an error on invalid title', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', getCookie())
        .send({
            title: '',
            price: 50
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', getCookie())
        .send({
            price: 50
        })
        .expect(400);
});

it('returns an error on invalid price', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', getCookie())
        .send({
            title: 'Ticket to Ride',
            price: -50
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', getCookie())
        .send({
            title: 'Ticket to Ride'
        })
        .expect(400);
});

it('creates a ticket on valid input', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'Ticket to Ride';
    const price = 50;

    await request(app)
        .post('/api/tickets')
        .set('Cookie', getCookie())
        .send({
            title,
            price
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
});



