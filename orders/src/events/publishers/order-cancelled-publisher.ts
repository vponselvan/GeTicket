import { OrderCancelledEvent, Publisher, Subjects } from '@geticket/common';


export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}