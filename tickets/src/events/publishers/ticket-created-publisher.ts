import {Publisher, Subjects, TicketCreatedEvent, } from '@geticket/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}