import { Publisher, Subjects, TicketUpdatedEvent, } from '@geticket/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}