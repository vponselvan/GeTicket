import { getCookie } from './get-cookie';
import request from 'supertest';
import { app } from '../app';

export const createTicket = async (title: string, price: number) => {
    return request(app)
        .post('/api/tickets')
        .set('Cookie', getCookie())
        .send({ title, price })
}