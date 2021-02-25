import { createTicket } from './../../../test/create-ticket';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from "@geticket/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedSubscriber } from "../order-created-subscriber";
import { Ticket } from '../../../models/ticket';


const setup = async () => {

    const subscriber = new OrderCreatedSubscriber(natsWrapper.client);

    const ticket = await (await createTicket('Ticket to Ride', 50)).body;

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'asdfsdf',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { subscriber, data, msg, ticket };

};

it('sets the order id of the ticket', async () => {
    const { subscriber, data, msg, ticket } = await setup();

    await subscriber.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(ticket?.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const { subscriber, data, msg } = await setup();

    await subscriber.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes ticket updated event', async () => {
    const { subscriber, data, msg, ticket } = await setup();

    await subscriber.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdated = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(data.id).toEqual(ticketUpdated.orderId);
});