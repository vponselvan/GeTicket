import { requireAuth, NotFoundError, NotAuthorizedError, OrderStatus } from '@geticket/common';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/order';

const router = express.Router();

router.patch('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    if (!mongoose.isValidObjectId(orderId)) {
        throw new NotFoundError();
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    //Publish an event

    res.status(204).send(order);
});

export { router as deleteOrderRouter };