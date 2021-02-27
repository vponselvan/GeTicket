import express from "express";
import 'express-async-errors';
import { json } from "body-parser";
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from "@geticket/common";

import { currentUserRouter } from './routes/current-user';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { signinRouter } from './routes/signin';

const app = express();
app.set('trust proxy', true); //to trust the ingress-nginix proxy
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: false//process.env.NODE_ENV !== 'test'
}));

app.use(currentUserRouter);
app.use(signupRouter);
app.use(signoutRouter);
app.use(signinRouter);

app.all('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler);

export { app };