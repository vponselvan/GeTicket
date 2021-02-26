import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from "@geticket/common";
import mongoose from "mongoose";

export { OrderStatus };

interface OrderAttrs {
    id: string;
    userId: string;
    status: OrderStatus;
    version: number;
    price: number;
}

type OrderDoc = mongoose.Document & OrderAttrs;

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
    findByEvent(event: { id: string, version: number }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema<OrderDoc>({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus)
    },
    price: {
        type: Number,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    },
    versionKey: 'version'
});

orderSchema.plugin(updateIfCurrentPlugin);

// orderSchema.pre('save', function (done) {
//     this.$where = {
//         version: this.get('version') + 1
//     };

//     done();
// });

orderSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Order.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        status: attrs.status,
        userId: attrs.userId,
        version: attrs.version,
        price: attrs.price
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };