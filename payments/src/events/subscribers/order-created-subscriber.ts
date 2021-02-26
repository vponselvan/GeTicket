import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, Subscriber, Subjects } from '@geticket/common';
import { Order } from '../../models/order';


export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = process.env.QUEUE_GROUP_NAME!;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            version: data.version,
            userId: data.userId,
            price: data.ticket.price,
            status: data.status
        });
        await order.save();

        msg.ack();
    }
}