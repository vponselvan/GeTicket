import { Message } from "node-nats-streaming";
import { Subjects } from "./subjects";
import { Subscriber } from "./subscriber";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedSubscriber extends Subscriber<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = 'payments-service';

    onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        console.log('Event data :', data);

        msg.ack();
    }
}