import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, validateRequest, requireAuth, NotAuthorizedError, BadRequestError } from '@geticket/common';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be greater than 0')
], validateRequest,
    async (req: Request, res: Response) => {
        const ticketId = req.params.id;

        if (!mongoose.isValidObjectId(ticketId)) {
            throw new NotFoundError();
        }

        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if (ticket.orderId) {
            throw new BadRequestError('Ticket is being purchased');
        }

        ticket.set({
            title: req.body.title,
            price: req.body.price
        });
        await ticket.save();

        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            title: ticket.title,
            price: ticket.price,
            id: ticket.id,
            version: ticket.version,
            userId: ticket.userId
        });

        res.status(200).send(ticket);
    });

export { router as updateTicketRouter };