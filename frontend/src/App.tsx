import { useState, useEffect, useMemo } from 'react';
import './App.css';
import type { Seat, SeatMap } from './types/seat';
import { generateSeatMap, isSeatAvailable, calculateTotalPrice } from './utils/seatUtils';

function App() {
  const [seatMap, setSeatMap] = useState<SeatMap>(generateSeatMap());
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize seat map with performance optimization
  useEffect(() => {
    const initializeSeats = async () => {
      // Simulate API call for occupied seats
      const simulateBackendCall = () => new Promise(resolve => setTimeout(resolve, 200));
      await simulateBackendCall();
      setLoading(false);
    };

    initializeSeats();
  }, []);

  const totalPrice = useMemo(() => 
    calculateTotalPrice(selectedSeats, seatMap),
    [selectedSeats, seatMap]
  );

  const getRowLetter = (index: number) => {
    return String.fromCharCode(65 + index); // Convert 0-9 to A-J
  };

  const getSeatLabel = (seat: Seat) => {
    return `${seat.number}${getRowLetter(seat.row)}`;
  };

  const handleSeatClick = (seat: Seat) => {
    if (!isSeatAvailable(seat)) return;

    setSelectedSeats(prev => {
      if (prev.includes(seat.id)) {
        return prev.filter(id => id !== seat.id);
      }
      return [...prev, seat.id];
    });
  };

  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeats.includes(seat.id);
    let seatClass = 'seat';
    
    if (seat.type === 'gap') return <div key={seat.id} className="gap" />;
    if (seat.type === 'broken') seatClass += ' broken';
    if (seat.type === 'accessible') seatClass += ' accessible';
    if (seat.isOccupied) seatClass += ' occupied';
    if (isSelected) seatClass += ' selected';

    return (
      <div
        key={seat.id}
        className={seatClass}
        onClick={() => handleSeatClick(seat)}
      >
        <span className="seat-label">{getSeatLabel(seat)}</span>
      </div>
    );
  };

  const renderRow = (rowIndex: number) => {
    const rowSeats = seatMap.seats.filter(seat => seat.row === rowIndex);
    
    // Group seats by section
    const leftSeats = rowSeats.filter(seat => seat.section === 'left');
    const centerSeats = rowSeats.filter(seat => seat.section === 'center');
    const rightSeats = rowSeats.filter(seat => seat.section === 'right');

    return (
      <div key={rowIndex} className="row">
        <div className="row-label">{getRowLetter(rowIndex)}</div>
        <div className="section left">
          {leftSeats.map(seat => renderSeat(seat))}
        </div>
        <div className="section center">
          {centerSeats.map(seat => renderSeat(seat))}
        </div>
        <div className="section right">
          {rightSeats.map(seat => renderSeat(seat))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading seating map...</div>;
  }

  return (
    <div className="movie-container">
      <h1>Cinema Seating System</h1>
      
      <ul className="showcase">
        <li>
          <div className="seat"></div>
          <small>Available</small>
        </li>
        <li>
          <div className="seat selected"></div>
          <small>Selected</small>
        </li>
        <li>
          <div className="seat occupied"></div>
          <small>Occupied</small>
        </li>
        <li>
          <div className="seat accessible"></div>
          <small>Accessible</small>
        </li>
        <li>
          <div className="seat broken"></div>
          <small>Broken</small>
        </li>
      </ul>

      <div className="container">
        <div className="screen"></div>
        <div className="seating-area">
          {Array.from({ length: seatMap.rows }, (_, index) => renderRow(index))}
        </div>
      </div>

      <p className="text">
        You have selected <span>{selectedSeats.length}</span> seats 
        for a total price of <span>${totalPrice}</span>
      </p>
      
      {selectedSeats.length > 0 && (
        <button 
          className="book-button"
          onClick={() => {
            alert('Booking functionality will be implemented soon!');
          }}
        >
          Book Selected Seats
        </button>
      )}
    </div>
  );
}

export default App;
