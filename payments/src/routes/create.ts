import { stripe } from './../stripe';
import { BadRequestError, requireAuth, validateRequest, NotFoundError, NotAuthorizedError, OrderStatus } from '@geticket/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments', requireAuth, [
    body('token')
        .not()
        .isEmpty()
        .withMessage('Token is invalid'),
    body('orderId')
        .not()
        .isEmpty()
        .withMessage('Order id is required')
], validateRequest, async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser?.id) {
        throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot be charged for cancelled order');
    }

    const stripeResponse = await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token,
        description: 'GeTicket Purchase'
    });

    const payment = new Payment({
        orderId, stripeId: stripeResponse.id
    });
    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId
    });

    res.status(201).send({ id: payment.id });
});

export { router as createChargeRouter };