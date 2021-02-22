import { TicketCreatedSubscriber } from './events/ticket-created-subscriber';
import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

const stan = nats.connect('geticket', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222'
});

stan.on('connect', () => {
    console.log('Subscriber connected to NATS');

    stan.on('close', () => {
        console.log('Connection closed');
        process.exit();
    });

    new TicketCreatedSubscriber(stan).subcribe();

});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());
