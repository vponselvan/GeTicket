import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from "@geticket/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedSubscriber } from "../order-created-subscriber";
import { Order } from '../../../models/order';


const setup = async () => {

    const subscriber = new OrderCreatedSubscriber(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'asdfsdf',
        ticket: {
            id: mongoose.Types.ObjectId().toHexString(),
            price: 50
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { subscriber, data, msg };

};

it('creates the order record', async () => {
    const { subscriber, data, msg } = await setup();

    await subscriber.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order?.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
    const { subscriber, data, msg } = await setup();

    await subscriber.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});