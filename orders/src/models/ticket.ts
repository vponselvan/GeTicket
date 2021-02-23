import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

interface TicketAttrs {
    id: string;
    title: string;
    price: number;
}

export type TicketDoc = mongoose.Document & TicketAttrs & {
    isLocked(): Promise<boolean>;
};

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

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

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price,
    });
};

ticketSchema.methods.isLocked = async function () {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $ne: OrderStatus.Cancelled
        }
    });

    return !!existingOrder;
}

// const TicketModel = mongoose.model<TicketDoc>('Ticket', ticketSchema);

// export class Ticket extends TicketModel {
//     constructor(attrs: TicketAttrs) {
//         let updatedAttrs;
//         if (attrs.id) {
//             const { id, ...rest } = attrs;
//             updatedAttrs = {
//                 _id: attrs.id,
//                 ...rest
//             }
//         } else {
//             updatedAttrs = attrs;
//         }
//         super(updatedAttrs);
//     }
// };

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };