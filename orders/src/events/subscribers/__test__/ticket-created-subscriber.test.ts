import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketCreatedEvent } from "@geticket/common";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedSubscriber } from "../ticket-created-subscriber";
import { Ticket } from '../../../models/ticket';


const setup = async () => {

    const subscriber = new TicketCreatedSubscriber(natsWrapper.client);

    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        title: 'Ticket to Ride',
        price: 50,
        userId: new mongoose.Types.ObjectId().toHexString()
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { subscriber, data, msg };

};

it('creates and saves a ticket', async () => {
    const { subscriber, data, msg } = await setup();

    await subscriber.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket?.title).toEqual(data.title);
    expect(ticket?.price).toEqual(data.price);

});

it('acks the message', async () => {
    const { subscriber, data, msg } = await setup();

    await subscriber.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled()
});