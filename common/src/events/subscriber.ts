import { Message, Stan } from "node-nats-streaming";
import { Event } from './event';


export abstract class Subscriber<T extends Event> {
    abstract subject: T['subject'];
    abstract queueGroupName: string;
    abstract onMessage(data: T['data'], msg: Message): void;

    private _client: Stan;
    protected ackWait = 5 * 1000; //5Sec 

    constructor(client: Stan) {
        this._client = client;
    }

    subscriptionOptions() {
        return this._client.subscriptionOptions()
            .setDeliverAllAvailable()
            .setManualAckMode(true)
            .setDurableName(this.queueGroupName)
            .setAckWait(this.ackWait)
    }

    subcribe() {
        const subscription = this._client.subscribe(this.subject, this.queueGroupName, this.subscriptionOptions());
        subscription.on('message', (msg: Message) => {
            console.log(`Message Received: ${this.subject}/${this.queueGroupName}`);

            const parsedMessage = this.parseMessage(msg);
            this.onMessage(parsedMessage, msg);
        });
    }

    parseMessage(msg: Message) {
        const data = msg.getData();
        return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf8'));
    }
}