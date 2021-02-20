import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const getCookie = () => {
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'tester@geticket.com'
    };

    const session = {
        jwt: jwt.sign(payload, process.env.JWT_KEY!)
    };

    const base64 = Buffer.from(JSON.stringify(session)).toString('base64');

    return [`express:sess=${base64}`];
}