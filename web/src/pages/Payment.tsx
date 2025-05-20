import { useNavigate, useLocation } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  
  const handlePayment = () => {
    // Process payment
    const bookingId = 'BOOK123'; // From your API
    navigate(`/ticket/${bookingId}`);
  };

  return (
    <div>
      <h2>Payment</h2>
      <p>Movie: {state.movieId}</p>
      <p>Seats: {state.seats.join(', ')}</p>
      <p>Total: ${state.price}</p>
      
      {/* Payment form here */}
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default Payment