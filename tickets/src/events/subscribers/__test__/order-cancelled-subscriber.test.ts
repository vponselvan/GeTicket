import { createTicket } from './../../../test/create-ticket';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from "@geticket/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledSubscriber } from "../order-cancelled-subscriber";
import { Ticket } from '../../../models/ticket';


const setup = async () => {

    const subscriber = new OrderCancelledSubscriber(natsWrapper.client);

    const ticket = await (await createTicket('Ticket to Ride', 50)).body;

    const data: OrderCancelledEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { subscriber, data, msg, ticket };
};

it('sets the order id of the ticket to undefined', async () => {
    const { subscriber, data, msg, ticket } = await setup();

    await subscriber.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(undefined);
});

it('acks the message', async () => {
    const { subscriber, data, msg } = await setup();

    await subscriber.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes ticket updated event', async () => {
    const { subscriber, data, msg } = await setup();

    await subscriber.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdated = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(data.id).toEqual(ticketUpdated.orderId);
});