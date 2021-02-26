import { Publisher, PaymentCreatedEvent, Subjects } from '@geticket/common';


export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}