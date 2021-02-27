import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
    console.log('Starting up auth...');

    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }

    try {
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
        console.log('Auth listening at 3000!!');
    });
}

start();