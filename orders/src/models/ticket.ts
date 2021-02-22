import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

interface TicketAttrs {
    title: string;
    price: number;
}

export type TicketDoc = mongoose.Document & TicketAttrs & {
    isLocked(): Promise<boolean>;
};

const ticketSchema = new mongoose.Schema<TicketDoc>({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.methods.isLocked = async function () {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $ne: OrderStatus.Cancelled
        }
    });

    return !!existingOrder;
}

const TicketModel = mongoose.model<TicketDoc>('Ticket', ticketSchema);

export class Ticket extends TicketModel {
    constructor(attrs: TicketAttrs) {
        super(attrs);

    }
};