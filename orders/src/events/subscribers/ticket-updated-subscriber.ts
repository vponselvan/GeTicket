import { Message } from 'node-nats-streaming';
import { Subjects, Subscriber, TicketUpdatedEvent } from "@geticket/common";
import { Ticket } from '../../models/ticket';

export class TicketUpdatedSubscriber extends Subscriber<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
    queueGroupName = process.env.QUEUE_GROUP_NAME!;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        const { id, title, price, version } = data;
        const ticket = await Ticket.findByEvent(data);

        if (!ticket) {
            throw new Error('Ticket not found');
        }

        ticket.set({ title, price });
        await ticket.save();

        msg.ack();
    }
}