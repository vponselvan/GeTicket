import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from "@geticket/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedSubscriber } from '../ticket-updated-subscriber';

const setup = async () => {

    const subscriber = new TicketUpdatedSubscriber(natsWrapper.client);

    const ticket = new Ticket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Ticket to Ride',
        price: 50
    });
    await ticket.save();

    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: ticket.title,
        price: 100,
        userId: new mongoose.Types.ObjectId().toHexString()
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { subscriber, data, msg, ticket };

};

it('updates and saves a ticket', async () => {
    const { subscriber, data, msg, ticket } = await setup();

    await subscriber.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket?.title).toEqual(data.title);
    expect(updatedTicket?.price).toEqual(data.price);
    expect(updatedTicket?.version).toEqual(data.version);

});

it('acks the message', async () => {
    const { subscriber, data, msg } = await setup();

    await subscriber.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled()
});

it('throws error if the version is out of order', async () => {
    const { subscriber, data, msg } = await setup();

    data.version = 8;

    try {
        await subscriber.onMessage(data, msg);
    } catch (error) {

    }

    expect(msg.ack).not.toHaveBeenCalled()
});

