import { ExpirationCompletedEvent, Publisher, Subjects } from '@geticket/common';

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
    readonly subject = Subjects.ExpirationComplete;

}