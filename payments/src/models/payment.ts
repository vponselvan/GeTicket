import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from "mongoose";

interface PaymentAttrs {
    orderId: string;
    stripeId: string;
}

type PaymentDoc = mongoose.Document & PaymentAttrs & { version: number };

const paymentSchema = new mongoose.Schema<PaymentDoc>({
    orderId: {
        type: String,
        required: true
    },
    stripeId: {
        type: String,
        required: true,
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    },
    versionKey: 'version',
    //optimisticConcurrency: true
});

paymentSchema.plugin(updateIfCurrentPlugin);

// orderSchema.pre('save', function (done) {
//     this.$where = {
//         version: this.get('version') + 1
//     };

//     done();
// });

const PaymentModel = mongoose.model<PaymentDoc>('Payment', paymentSchema);

export class Payment extends PaymentModel {

    constructor(attrs: PaymentAttrs) {
        super(attrs);

    }
}