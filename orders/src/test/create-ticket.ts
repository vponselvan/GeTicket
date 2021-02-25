import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';

export const createTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Ticket to Ride',
        price: 50
    });
    await ticket.save();

    return ticket;
}