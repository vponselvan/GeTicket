import { requireAuth, NotFoundError, NotAuthorizedError, OrderStatus } from '@geticket/common';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/order';
import { natsWrapper } from './../nats-wrapper';
import { OrderCancelledPublisher } from './../events/publishers/order-cancelled-publisher';

const router = express.Router();

router.patch('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    if (!mongoose.isValidObjectId(orderId)) {
        throw new NotFoundError();
    }

    const order = await Order.findById(orderId).populate('ticket');
    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    //Publish an event
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id
        }
    });

    res.status(204).send(order);
});

export { router as deleteOrderRouter };