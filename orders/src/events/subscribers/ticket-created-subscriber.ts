import { Message } from 'node-nats-streaming';
import { Subjects, Subscriber, TicketCreatedEvent } from "@geticket/common";
import { Ticket } from '../../models/ticket';


export class TicketCreatedSubscriber extends Subscriber<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = process.env.QUEUE_GROUP_NAME!;

    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        const { id, title, price } = data;

        const ticket = Ticket.build({
            id, title, price
        });
        await ticket.save();

        msg.ack();
    };
}