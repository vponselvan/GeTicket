import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from "@geticket/common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledSubscriber } from "../order-cancelled-subscriber";
import { Order } from '../../../models/order';


const setup = async () => {

    const subscriber = new OrderCancelledSubscriber(natsWrapper.client);

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        version: 0,
        userId: '12safas',
        price: 50
    });
    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: mongoose.Types.ObjectId().toHexString()
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { subscriber, data, msg, order };

};

it('updates the status of order', async () => {
    const { subscriber, data, msg, order } = await setup();

    await subscriber.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const { subscriber, data, msg } = await setup();

    await subscriber.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
