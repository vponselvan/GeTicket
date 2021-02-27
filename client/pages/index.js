import Link from 'next/link';

const LandingPage = ({ tickets }) => {
  const ticketList = tickets.map((ticket) => {
    const buttonText = ticket.orderId ? 'Sold' : 'Details';
    return (
      <div className="col-4" key={ticket.id}>
        <div className="card" styleName="width: 18rem;">
          <div className="card-body">
            <h5 className="card-title">{ticket.title}</h5>
            <h6 className="card-subtitle mb-2 text-muted">${ticket.price}</h6>
            <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={ticket.orderId}
              >
                {buttonText}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div>
      <h1>Tickets</h1>
      <div className="row">{ticketList}</div>
    </div>
  );
};

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get('/api/tickets');

  return { tickets: data };
};

export default LandingPage;
