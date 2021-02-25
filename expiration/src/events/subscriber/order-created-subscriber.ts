import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, Subjects, Subscriber } from '@geticket/common';
import { expirationQueue } from '../../queues/expiration-queue';


export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = process.env.QUEUE_GROUP_NAME!;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();

        await expirationQueue.add({
            orderId: data.id
        }, {
            delay
        });

        msg.ack();
    }
}