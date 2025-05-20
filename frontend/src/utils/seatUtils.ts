import type { Seat, SeatMap, SeatType } from '../types/seat';

const TOTAL_ROWS = 10;
const SEATS_PER_ROW = 12; // 12 seats per row to get 120 total
const LEFT_SECTION_END = 3;  // 4 seats in left section
const CENTER_START = 4;      // 4 seats in center
const CENTER_END = 7;
const RIGHT_START = 8;       // 4 seats in right section

export const generateSeatMap = (): SeatMap => {
  const seats: Seat[] = [];
  
  // Pre-defined positions for special seats (adjusted for 120 seats)
  const accessibleSeats = new Set([0, 1, 118, 119]); // Front and back row accessible seats
  const brokenSeats = new Set([15, 45, 78, 92]); // Random broken seats throughout
  const occupiedSeats = new Set([5, 6, 7, 25, 26, 38, 39, 55, 56, 57, 88, 89, 90, 102, 103]); // Dummy bookings
  const gaps = new Set([36, 37, 72, 73]); // Gaps for aisles between sections

  for (let row = 0; row < TOTAL_ROWS; row++) {
    for (let seatNum = 0; seatNum < SEATS_PER_ROW; seatNum++) {
      const id = row * SEATS_PER_ROW + seatNum;
      
      let type: SeatType = 'standard';
      if (accessibleSeats.has(id)) type = 'accessible';
      if (brokenSeats.has(id)) type = 'broken';
      if (gaps.has(id)) type = 'gap';

      // Vary prices based on section and row position
      let price = 10;
      if (row < 3) price = 15; // Premium front rows
      if (row > 7) price = 8; // Back rows discount
      
      // Premium pricing for center section
      if (seatNum >= CENTER_START && seatNum <= CENTER_END) {
        price += 2; // Additional charge for center section
      }
      
      seats.push({
        id,
        row,
        number: seatNum + 1,
        type,
        isOccupied: occupiedSeats.has(id),
        price,
        section: seatNum <= LEFT_SECTION_END ? 'left' : 
                 seatNum >= RIGHT_START ? 'right' : 'center'
      });
    }
  }

  return {
    rows: TOTAL_ROWS,
    seatsPerRow: SEATS_PER_ROW,
    seats
  };
};

// Memoize selected seats for performance
const selectedSeatsCache = new Map<number, boolean>();

export const isSeatSelected = (seatId: number): boolean => {
  return selectedSeatsCache.get(seatId) || false;
};

export const updateSeatSelection = (seatId: number, selected: boolean): void => {
  selectedSeatsCache.set(seatId, selected);
};

// Calculate total price efficiently
export const calculateTotalPrice = (selectedSeats: number[], seatMap: SeatMap): number => {
  return selectedSeats.reduce((total, seatId) => {
    const seat = seatMap.seats.find(s => s.id === seatId);
    return total + (seat?.price || 0);
  }, 0);
};

// Helper function to check if a seat is available for selection
export const isSeatAvailable = (seat: Seat): boolean => {
  return seat.type !== 'broken' && 
         seat.type !== 'gap' && 
         !seat.isOccupied;
};