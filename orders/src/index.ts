import { natsWrapper } from './nats-wrapper';
import mongoose from "mongoose";
import { app } from "./app";
import { TicketCreatedSubscriber } from './events/subscribers/ticket-created-subscriber';
import { TicketUpdatedSubscriber } from './events/subscribers/ticket-updated-subscriber';

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined');
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined');
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined');
    }
    if (!process.env.EXPIRATION_WINDOW_SECONDS) {
        throw new Error('EXPIRATION_WINDOW_SECONDS must be defined');
    }
    if (!process.env.QUEUE_GROUP_NAME) {
        throw new Error('QUEUE_GROUP_NAME must be defined');
    }

    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
        natsWrapper.client.on('close', () => {
            console.log('Connection closed');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new TicketCreatedSubscriber(natsWrapper.client).subscribe();
        new TicketUpdatedSubscriber(natsWrapper.client).subscribe();

        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('connected to db');
    } catch (err) {
        console.log(err);
    }
    app.listen(3000, () => {
        console.log('Tickets listening at 3000!!');
    });
}

start();