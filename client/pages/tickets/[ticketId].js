import Router from 'next/router';
import useRequest from '../../hooks/use-request';

const TicketDetails = ({ ticket }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });

  return (
    <div>
      <div className="card text-center">
        <div className="card-header">{ticket.title}</div>
        <div className="card-body">
          <h5 className="card-title">Ticket Description</h5>
        </div>
        <div className="card-footer text-muted">
          {errors}
          <button onClick={() => doRequest()} className="btn btn-primary">
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

TicketDetails.getInitialProps = async (context, client) => {
  const { ticketId } = context.query;
  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketDetails;
