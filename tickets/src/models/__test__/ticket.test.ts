import { Ticket } from "../ticket";

it('implements Optimistic Concurrency Control', async (done) => {
    const ticket = new Ticket({
        title: 'Ticket to Ride',
        price: 50,
        userId: '12dweq13'
    });

    await ticket.save();

    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    firstInstance?.set({ price: 10 });
    secondInstance?.set({ price: 82 });

    await firstInstance?.save();

    try {
        await secondInstance?.save();
    } catch (err) {
        return done();
    }

    throw new Error('this shouldnt be executed');

});

it('increments the version number when changes are saved', async () => {
    const ticket = new Ticket({
        title: 'Ticket to Ride',
        price: 50,
        userId: '12dweq13'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);
    ticket.price = 80;
    await ticket.save();
    expect(ticket.version).toEqual(1);
})