import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { NotFoundError } from '@geticket/common';
import { Ticket } from '../models/ticket';


const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const ticketId = req.params.id;

    if (!mongoose.isValidObjectId(ticketId)) {
        throw new NotFoundError();
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        throw new NotFoundError();
    }

    res.status(200).send(ticket);
});

export { router as showTicketRouter };