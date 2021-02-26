import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, Subscriber, Subjects, OrderStatus } from '@geticket/common';
import { Order } from '../../models/order';


export class OrderCancelledSubscriber extends Subscriber<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = process.env.QUEUE_GROUP_NAME!;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const { id, version } = data;
        const order = await Order.findByEvent({
            id, version
        });

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        msg.ack();
    }
}