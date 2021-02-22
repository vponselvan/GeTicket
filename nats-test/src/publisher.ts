import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

const stan = nats.connect('geticket', 'abc', {
    url: 'http://localhost:4222'
});

stan.on('connect', async () => {
    console.log('Publisher connected to NATS');

    const publisher = new TicketCreatedPublisher(stan);
    try {
        await publisher.publish({
            id: '12nsdfs',
            title: 'Ticket to Ride',
            price: 50
        });
    } catch (err) {
        console.error(err);
    }


    // const data = JSON.stringify({
    //     id: '12nsdfs',
    //     title: 'Ticket to Ride',
    //     price: 50
    // });

    // stan.publish('ticket:created', data, () => {
    //     console.log('Event Published');
    // });
});