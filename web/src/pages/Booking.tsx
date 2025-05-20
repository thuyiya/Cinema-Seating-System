import { useNavigate, useParams } from 'react-router-dom';

const Booking = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  
  const handleSeatSelect = (selectedSeats: string[]) => {
    // Save seats to state/context/API
    navigate('/payment', { 
      state: { 
        movieId, 
        seats: selectedSeats,
        price: selectedSeats.length * 10 // $10 per seat
      } 
    });
  };

  return (
    <div>
      <h2>Select Seats for Movie {movieId}</h2>
      {/* Seat selection UI here */}
      <button onClick={() => handleSeatSelect(['A1', 'A2'])}>
        Confirm Seats
      </button>
    </div>
  );
};

export default Booking