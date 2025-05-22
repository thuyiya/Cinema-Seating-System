import React from 'react';
/** @jest-environment jsdom */
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils';
import SeatLayout from '../SeatLayout';

const mockSections = [
  {
    name: 'Main Hall',
    seats: [
      {
        id: 'A1',
        row: 'A',
        number: 1,
        type: 'REGULAR' as const,
        isBooked: false,
        position: 'edge' as const,
        preferredView: true
      },
      {
        id: 'A2',
        row: 'A',
        number: 2,
        type: 'VIP' as const,
        isBooked: true,
        position: 'middle' as const,
        preferredView: true
      },
      {
        id: 'A3',
        row: 'A',
        number: 3,
        type: 'ACCESSIBLE' as const,
        isBooked: false,
        status: 'maintenance' as const,
        position: 'aisle' as const,
        preferredView: true
      }
    ]
  }
];

const mockOnSeatClick = jest.fn();

describe('SeatLayout', () => {
  beforeEach(() => {
    mockOnSeatClick.mockClear();
  });

  it('renders section name', () => {
    render(
      <SeatLayout
        sections={mockSections}
        selectedSeats={[]}
        onSeatClick={mockOnSeatClick}
      />
    );
    expect(screen.getByText('Main Hall')).toBeInTheDocument();
  });

  it('renders all seats', () => {
    render(
      <SeatLayout
        sections={mockSections}
        selectedSeats={[]}
        onSeatClick={mockOnSeatClick}
      />
    );
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText('A3')).toBeInTheDocument();
  });

  it('shows correct seat status', () => {
    render(
      <SeatLayout
        sections={mockSections}
        selectedSeats={[]}
        onSeatClick={mockOnSeatClick}
      />
    );
    const regularSeat = screen.getByText('A1').closest('div');
    const bookedSeat = screen.getByText('A2').closest('div');
    const maintenanceSeat = screen.getByText('A3').closest('div');

    expect(regularSeat).toHaveClass('REGULAR');
    expect(bookedSeat).toHaveClass('booked');
    expect(maintenanceSeat).toHaveClass('maintenance');
  });

  it('handles seat selection', () => {
    render(
      <SeatLayout
        sections={mockSections}
        selectedSeats={[]}
        onSeatClick={mockOnSeatClick}
      />
    );
    const availableSeat = screen.getByText('A1');
    fireEvent.click(availableSeat);
    expect(mockOnSeatClick).toHaveBeenCalledWith('A1', mockSections[0].seats[0]);
  });

  it('shows selected seats', () => {
    render(
      <SeatLayout
        sections={mockSections}
        selectedSeats={['A1']}
        onSeatClick={mockOnSeatClick}
      />
    );
    const selectedSeat = screen.getByText('A1').closest('div');
    expect(selectedSeat).toHaveClass('selected');
  });

  it('prevents clicking booked seats', () => {
    render(
      <SeatLayout
        sections={mockSections}
        selectedSeats={[]}
        onSeatClick={mockOnSeatClick}
      />
    );
    const bookedSeat = screen.getByText('A2');
    fireEvent.click(bookedSeat);
    expect(mockOnSeatClick).not.toHaveBeenCalled();
  });

  it('prevents clicking maintenance seats', () => {
    render(
      <SeatLayout
        sections={mockSections}
        selectedSeats={[]}
        onSeatClick={mockOnSeatClick}
      />
    );
    const maintenanceSeat = screen.getByText('A3');
    fireEvent.click(maintenanceSeat);
    expect(mockOnSeatClick).not.toHaveBeenCalled();
  });

  it('displays seat types correctly', () => {
    render(
      <SeatLayout
        sections={mockSections}
        selectedSeats={[]}
        onSeatClick={mockOnSeatClick}
      />
    );
    const regularSeat = screen.getByText('A1').closest('div');
    const vipSeat = screen.getByText('A2').closest('div');
    const accessibleSeat = screen.getByText('A3').closest('div');

    expect(regularSeat).toHaveClass('REGULAR');
    expect(vipSeat).toHaveClass('VIP');
    expect(accessibleSeat).toHaveClass('ACCESSIBLE');
  });

  it('displays seat positions correctly', () => {
    render(
      <SeatLayout
        sections={mockSections}
        selectedSeats={[]}
        onSeatClick={mockOnSeatClick}
      />
    );
    const edgeSeat = screen.getByText('A1').closest('div');
    const middleSeat = screen.getByText('A2').closest('div');
    const aisleSeat = screen.getByText('A3').closest('div');

    expect(edgeSeat).toHaveClass('edge');
    expect(middleSeat).toHaveClass('middle');
    expect(aisleSeat).toHaveClass('aisle');
  });
}); 