import { PasswordManager } from '../services/password-manager';
import mongoose from "mongoose";

//User attribute
interface UserAttrs {
    email: string;
    password: string;
}

type UserDoc = mongoose.Document & UserAttrs;

//User model
// interface UserModel extends mongoose.Model<UserDoc> {
//     build(attrs: UserAttrs): UserDoc;
// }

//User document
// interface UserDoc extends mongoose.Document {
//     email: string;
//     password: string;
// }

const userSchema = new mongoose.Schema<UserDoc>({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashed = await PasswordManager.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});

// userSchema.statics.build = (attrs: UserAttrs) => {
//     return new User(attrs);
// };

// const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// export { User };

const UserModel = mongoose.model<UserDoc>('User', userSchema);

export class User extends UserModel {
    constructor(attrs: UserAttrs) {
        super(attrs);
    }
}

