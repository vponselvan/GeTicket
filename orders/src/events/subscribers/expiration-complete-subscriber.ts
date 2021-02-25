import { Message } from 'node-nats-streaming';
import { Subscriber, ExpirationCompletedEvent, Subjects, OrderStatus } from '@geticket/common';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';


export class ExpirationCompleteSubscriber extends Subscriber<ExpirationCompletedEvent> {
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = process.env.QUEUE_GROUP_NAME!;

    async onMessage(data: ExpirationCompletedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');

        if (!order) {
            throw new Error('Order doesnt exist');
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled
        });
        await order.save();
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        msg.ack();
    };
}