import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import type { Showtime, Seat } from '../../types/movie';
import SeatLayout from '../../components/SeatLayout';
import GuestInfoDialog from '../../components/GuestInfoDialog';
import type { GuestInfo } from '../../components/GuestInfoDialog';
import { useAuth } from '../../context/AuthContext';
import { BookingService } from '../../services/bookingService';

interface Section {
  name: string;
  seats: Seat[];
}

export default function SelectSeats() {
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const { movieId, showtimesId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchShowtimeAndSeats = async () => {
    if (!showtimesId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/showtimes/${showtimesId}`);
      if (!response.ok) throw new Error('Failed to fetch showtime');
      
      const showtime = await response.json();
      setShowtime(showtime);

      // Get the seating information
      const seatsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/showtimes/${showtimesId}/${showtime.screenId._id}/seats`);
      if (!seatsResponse.ok) throw new Error('Failed to fetch seats');
      
      const seatingData = await seatsResponse.json();
      setSections(seatingData.sections);
    } catch (error) {
      setError('Failed to load seating information. Please try again later.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showtimesId) {
      fetchShowtimeAndSeats();
    }
  }, [showtimesId]);

  // Show guest dialog when page loads for non-logged-in users
  useEffect(() => {
    if (!loading && !user && !guestInfo) {
      setIsGuestDialogOpen(true);
    }
  }, [loading, user, guestInfo]);

  const handleSeatClick = (seatId: string, seat: Seat) => {
    if (!user && !guestInfo) {
      setIsGuestDialogOpen(true);
      return;
    }
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  const calculateTotalPrice = () => {
    if (!showtime) return 0;
    return selectedSeats.reduce((total, seatId) => {
      const seat = sections.flatMap(s => s.seats).find(s => s.id === seatId);
      if (!seat) return total;
      const seatType = seat.type.toUpperCase() as keyof typeof showtime.price;
      return total + showtime.price[seatType];
    }, 0);
  };

  const handleGuestSubmit = async (guestInfo: GuestInfo) => {
    setGuestInfo(guestInfo);
    setIsGuestDialogOpen(false);
  };

  const createTemporaryBooking = async () => {
    if (!showtime) return;
    if (!user && !guestInfo) {
      setIsGuestDialogOpen(true);
      return;
    }
    
    setBookingInProgress(true);
    setError(null);

    try {
      // Convert selected seat IDs to the format expected by the backend
      const formattedSeats = selectedSeats.map(seatId => {
        const seat = sections.flatMap(s => s.seats).find(s => s.id === seatId);
        if (!seat) {
          throw new Error(`Seat ${seatId} not found`);
        }
        
        // Parse row letter and seat number from the seat ID
        // Assuming seat ID format is like "A1", "B2", etc.
        const row = seat.row;
        const number = seat.number;

        return {
          seatId: seatId,
          row: row,
          number: number,
          type: seat.type,
          price: showtime.price[seat.type.toUpperCase() as keyof typeof showtime.price]
        };
      });

      const bookingResponse = await BookingService.createBooking({
        showtimeId: showtimesId!,
        seats: formattedSeats,
        guestInfo: guestInfo || undefined,
        groupSize: selectedSeats.length,
        totalAmount: calculateTotalPrice(),
      });

      // Navigate to payment with booking details
      navigate(`/payment/${bookingResponse.bookingId}`, {
        state: {
          movieId,
          showtimesId,
          movieTitle: showtime.movieId.title,
          screenName: `Screen ${showtime.screenId.number} - ${showtime.screenId.name}`,
          showtime: `${showtime.date} ${showtime.startTime}`,
          seats: selectedSeats,
          totalAmount: calculateTotalPrice(),
          bookingId: bookingResponse.bookingId,
          guestInfo
        }
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes('SEAT_CONFLICT')) {
        setError('Sorry, some of your selected seats have just been booked. Please choose different seats.');
        // Refresh the showtime data to get updated seat availability
        fetchShowtimeAndSeats();
      } else {
        console.error('Booking error:', err);
        setError('Failed to create booking. Please try again.');
      }
      setBookingInProgress(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!showtime || selectedSeats.length === 0) return;
    if (!user && !guestInfo) {
      setIsGuestDialogOpen(true);
      return;
    }
    await createTemporaryBooking();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !showtime) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error" align="center">
          {error || 'Showtime not found'}
        </Typography>
        {error?.includes('seats have just been booked') && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setError(null)}
            sx={{ mt: 2 }}
          >
            Select Different Seats
          </Button>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Select Seats
        </Typography>
        <Typography variant="h5" color="primary" gutterBottom>
          {showtime.movieId.title}
        </Typography>
        <Typography variant="subtitle1">
          Screen {showtime.screenId.number} - {showtime.screenId.name}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {showtime.date} {showtime.startTime} - {showtime.endTime}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom align="center">
          Screen
        </Typography>
        <Divider 
          sx={{ 
            mb: 4,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #ffffff, transparent)',
            boxShadow: '0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff',
            animation: 'glow 1.5s ease-in-out infinite alternate',
            '@keyframes glow': {
              from: {
                boxShadow: '0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 15px #ffffff'
              },
              to: {
                boxShadow: '0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff'
              }
            }
          }} 
        />

        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SeatLayout
            sections={sections}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
            layout={{
              type: showtime?.screenId?.layout?.type || 'straight',
              hasBalcony: showtime?.screenId?.layout?.hasBalcony || false,
              aislePositions: showtime?.screenId?.layout?.aislePositions || [5, 10]
            }}
            isAdminView={false}
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Price List:
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="outlined" disabled>
                Regular (${showtime?.price?.REGULAR || 0})
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                disabled 
                sx={{ 
                  backgroundColor: 'secondary.light',
                  color: 'black',
                  '&.Mui-disabled': {
                    color: 'black'
                  }
                }}
              >
                VIP (${showtime?.price?.VIP || 0})
              </Button>
            </Grid>
            <Grid item>
              <Button 
                variant="outlined" 
                disabled 
                sx={{ 
                  backgroundColor: 'info.light',
                  color: 'black',
                  '&.Mui-disabled': {
                    color: 'black'
                  }
                }}
              >
                Accessible (${showtime?.price?.ACCESSIBLE || 0})
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Selected Seats: {selectedSeats.length}
          </Typography>
          <Typography variant="h6">
            Total: ${calculateTotalPrice()}
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={selectedSeats.length === 0 || bookingInProgress}
          onClick={handleProceedToPayment}
          sx={{ mt: 2 }}
        >
          {bookingInProgress ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </Paper>

      <GuestInfoDialog
        open={isGuestDialogOpen}
        onClose={() => setIsGuestDialogOpen(false)}
        onSubmit={handleGuestSubmit}
      />
    </Container>
  );
} 