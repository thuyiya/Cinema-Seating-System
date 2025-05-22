import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import SeatLayout from './SeatLayout';
import { useEffect, useState } from 'react';

interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'REGULAR' | 'VIP' | 'ACCESSIBLE';
  isBooked: boolean;
  status?: 'available' | 'booked' | 'broken' | 'maintenance';
  position: 'aisle' | 'middle' | 'edge';
  preferredView: boolean;
}

interface Section {
  name: string;
  seats: Seat[];
}

interface Layout {
  type: 'straight' | 'curved' | 'c-shaped';
  hasBalcony: boolean;
  aislePositions: number[];
}

interface CurrentBookingsDialogProps {
  open: boolean;
  onClose: () => void;
  showtime: {
    _id: string;
    screenId: {
      _id: string;
      layout?: Layout;
    };
  };
}

export default function CurrentBookingsDialog({
  open,
  onClose,
  showtime
}: CurrentBookingsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [layout, setLayout] = useState<Layout | undefined>(showtime.screenId.layout);

  useEffect(() => {
    if (open && showtime) {
      fetchSeats();
    }
  }, [open, showtime]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/showtimes/${showtime._id}/${showtime.screenId._id}/seats`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch seats');
      }

      const data = await response.json();
      setSections(data.sections);
      setLayout(data.layout);
    } catch (error) {
      console.error('Error fetching seats:', error);
      setError('Failed to load seats. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId: string, seat: Seat) => {
    // In admin view, clicking a seat could show additional booking details
    console.log('Seat clicked:', seatId, seat);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>Current Bookings</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : (
          <Box sx={{ py: 2 }}>
            <SeatLayout
              sections={sections}
              layout={layout}
              onSeatClick={handleSeatClick}
              isAdminView={true}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
} 