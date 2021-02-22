import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError } from '@geticket/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
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

    res.status(200).send(order);
});

export { router as showOrderRouter };