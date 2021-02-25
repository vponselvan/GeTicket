import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { ExpirationCompletedEvent, OrderStatus } from "@geticket/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteSubscriber } from './../expiration-complete-subscriber';
import { Order } from '../../../models/order';


const setup = async () => {

    const subscriber = new ExpirationCompleteSubscriber(natsWrapper.client);

    const ticket = new Ticket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'Ticket to Ride',
        price: 50
    });
    await ticket.save();

    const order = new Order({
        status: OrderStatus.Created,
        userId: 'asdfsf',
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    const data: ExpirationCompletedEvent['data'] = {
        orderId: order.id,
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { subscriber, data, msg, ticket, order };

};

it('updates the order to cancelled', async () => {
    const { subscriber, data, msg, ticket, order } = await setup();

    await subscriber.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);

});

it('acks the message', async () => {
    const { subscriber, data, msg } = await setup();

    await subscriber.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('emits an order cancelled event', async () => {
    const { order, subscriber, data, msg } = await setup();

    await subscriber.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(eventData.id).toEqual(order.id);
});
