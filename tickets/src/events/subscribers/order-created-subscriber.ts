import { Ticket } from './../../models/ticket';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, Subscriber, Subjects } from '@geticket/common';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';


export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = process.env.QUEUE_GROUP_NAME!;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.set({ orderId: data.id });
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
    };
}