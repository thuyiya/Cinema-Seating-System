import { useParams } from 'react-router-dom';

const Ticket = () => {
  const { bookingId } = useParams();

  return (
    <div className="ticket">
      <h2>Your Ticket #{bookingId}</h2>
      <div className="ticket-details">
        {/* Ticket details here */}
      </div>
      <button onClick={() => window.print()}>Print Ticket</button>
    </div>
  );
};

export default Ticket