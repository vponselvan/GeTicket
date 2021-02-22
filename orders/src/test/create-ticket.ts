import { Ticket } from '../models/ticket';

export const createTicket = async (title: string, price: number) => {
    const ticket = new Ticket({
        title: 'Ticket to Ride',
        price: 50
    });
    await ticket.save();

    return ticket;
}