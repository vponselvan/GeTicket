import mongoose from 'mongoose';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, BadRequestError, OrderStatus } from '@geticket/common';
import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

const router = express.Router();

router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .withMessage('Ticketid must be provided')
], validateRequest, async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    if (!mongoose.isValidObjectId(ticketId)) {
        throw new NotFoundError();
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }

    const existingOrder = await ticket.isLocked();

    if (existingOrder) {
        throw new BadRequestError('Ticket is already locked');
    };

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + parseInt(process.env.EXPIRATION_WINDOW_SECONDS!));

    const order = new Order({
        userId: req.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket
    });
    await order.save();

    //Publish event

    res.status(201).send(order);
});

export { router as createOrderRouter };
