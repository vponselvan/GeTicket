import mongoose, { Schema } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
};

type TicketDoc = mongoose.Document & TicketAttrs & { version: number };

const ticketSchema = new mongoose.Schema<TicketDoc>({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    },
    versionKey: 'version',
    optimisticConcurrency: true
});

// ticketSchema.set('versionKey', 'version');
// ticketSchema.plugin(updateIfCurrentPlugin);

const TicketModel = mongoose.model<TicketDoc>('Ticket', ticketSchema);

export class Ticket extends TicketModel {
    constructor(attrs: TicketAttrs) {
        super(attrs);
    }
};
