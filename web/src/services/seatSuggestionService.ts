import type { Seat } from '../types/movie';

interface Section {
  name: string;
  seats: Seat[];
}

export class SeatSuggestionService {
  // Calculate the center point of the theater
  private static getScreenCenter(sections: Section[]): number {
    const allSeats = sections.flatMap(s => s.seats);
    const maxSeatNumber = Math.max(...allSeats.map(s => s.number));
    return Math.floor(maxSeatNumber / 2);
  }

  // Calculate distance from center
  private static getDistanceFromCenter(seatNumber: number, centerPoint: number): number {
    return Math.abs(seatNumber - centerPoint);
  }

  // Score a seat based on various factors
  private static scoreSeat(seat: Seat, centerPoint: number): number {
    let score = 0;

    // Prefer center seats
    const distanceFromCenter = this.getDistanceFromCenter(seat.number, centerPoint);
    score -= distanceFromCenter * 2;

    // Prefer middle rows (assuming rows are lettered A-Z)
    const rowScore = Math.abs(seat.row.charCodeAt(0) - 'K'.charCodeAt(0));
    score -= rowScore;

    // Bonus for preferred view seats
    if (seat.preferredView) score += 10;

    // Bonus for aisle seats
    if (seat.position === 'aisle') score += 5;

    // Penalty for edge seats
    if (seat.position === 'edge') score -= 3;

    return score;
  }

  // Find best available seats for a group
  static findBestSeats(sections: Section[], groupSize: number): Seat[] {
    const centerPoint = this.getScreenCenter(sections);
    const availableSeats = sections.flatMap(s => s.seats)
      .filter(seat => !seat.isBooked && seat.status !== 'broken' && seat.status !== 'maintenance');

    // Group seats by row
    const seatsByRow = availableSeats.reduce<Record<string, Seat[]>>((acc, seat) => {
      if (!acc[seat.row]) acc[seat.row] = [];
      acc[seat.row].push(seat);
      return acc;
    }, {});

    // Find best consecutive seats in each row
    let bestSeats: Seat[] = [];
    let bestScore = -Infinity;

    Object.values(seatsByRow).forEach((rowSeats: Seat[]) => {
      // Sort seats by number
      rowSeats.sort((a: Seat, b: Seat) => a.number - b.number);

      // Find consecutive seat groups
      for (let i = 0; i <= rowSeats.length - groupSize; i++) {
        const consecutiveSeats = rowSeats.slice(i, i + groupSize);
        
        // Check if seats are truly consecutive
        const isConsecutive = consecutiveSeats.every((seat: Seat, index: number) => 
          index === 0 || seat.number === consecutiveSeats[index - 1].number + 1
        );

        if (isConsecutive) {
          const groupScore = consecutiveSeats.reduce(
            (score: number, seat: Seat) => score + this.scoreSeat(seat, centerPoint),
            0
          );

          if (groupScore > bestScore) {
            bestScore = groupScore;
            bestSeats = consecutiveSeats;
          }
        }
      }
    });

    return bestSeats;
  }
} 