import { createTicket } from './../../../test/create-ticket';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from "@geticket/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledSubscriber } from "../order-cancelled-subscriber";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    const listener = new OrderCancelledSubscriber(natsWrapper.client);

    const orderId = mongoose.Types.ObjectId().toHexString();
    const ticket = new Ticket({
        title: 'concert',
        price: 20,
        userId: 'asdf',
    });
    ticket.set({ orderId });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id,
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { msg, data, ticket, orderId, listener };
};

it('updates the ticket, publishes an event, and acks the message', async () => {
    const { msg, data, ticket, orderId, listener } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});