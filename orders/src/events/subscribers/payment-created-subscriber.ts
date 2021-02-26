import { Order } from './../../models/order';
import { Message } from 'node-nats-streaming';
import { Subscriber, PaymentCreatedEvent, Subjects, OrderStatus } from "@geticket/common";


export class PaymentCreatedSubscriber extends Subscriber<PaymentCreatedEvent>{
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = process.env.QUEUE_GROUP_NAME!;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Complete });
        await order.save();

        msg.ack();
    }
}