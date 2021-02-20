import { createTicket } from './../../test/create-ticket';
import request from 'supertest';
import { app } from '../../app';

it('returns list of all tickets', async () => {
    await createTicket('Ticket to Ride', 50);
    await createTicket('Ticket to Fly', 250);
    await createTicket('Ticket to Sail', 150);

    const response = await request(app)
        .get('/api/tickets')
        .send({})
        .expect(200);

    expect(response.body.length).toEqual(3);
})