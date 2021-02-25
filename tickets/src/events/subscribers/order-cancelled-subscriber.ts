import { TicketUpdatedPublisher } from './../publishers/ticket-updated-publisher';
import { Ticket } from './../../models/ticket';
import { Message } from 'node-nats-streaming';
import { Subscriber, OrderCancelledEvent, Subjects } from '@geticket/common';


export class OrderCancelledSubscriber extends Subscriber<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = process.env.QUEUE_GROUP_NAME!;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.set({ orderId: undefined });
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId
        });

        msg.ack();
    }
}