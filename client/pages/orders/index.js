const OrderIndex = ({ orders }) => {
  return (
    <div>
      <div className="list-group">
        {orders.map((order) => {
          return (
            <div
              className="list-group-item list-group-item-action mb-3"
              key={order.id}
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{order.ticket.title}</h5>
                <small>{order.status}</small>
              </div>
              <p className="mb-1">Ticket Description</p>
              <small>${order.ticket.price}</small>
            </div>
          );
        })}
      </div>
    </div>
  );
};

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get('/api/orders');

  return { orders: data };
};

export default OrderIndex;
