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
} from '@mui/material';
import type { Showtime, Seat } from '../../types/movie';
import SeatLayout from '../../components/SeatLayout';

interface Section {
  name: string;
  seats: Seat[];
}

export default function SelectSeats() {
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { movieId, showtimesId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowtimeAndSeats = async () => {
      try {
        setLoading(true);
        // Fetch showtime details
        const showtimeResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/showtimes/${showtimesId}`);
        if (!showtimeResponse.ok) {
          throw new Error('Failed to fetch showtime details');
        }
        const showtimeData = await showtimeResponse.json();
        setShowtime(showtimeData);

        // Fetch seats for the showtime
        const seatsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/showtimes/${showtimesId}/${showtimeData.screenId._id}/seats`);
        if (!seatsResponse.ok) {
          throw new Error('Failed to fetch seats');
        }
        const seatsData = await seatsResponse.json();
        
        // Transform seats data to match the required format
        const transformedSections = seatsData.map((section: any) => ({
          name: section.name,
          seats: section.seats.map((seat: any) => ({
            id: `${seat.row}-${seat.number}`,
            row: seat.row.toString(),
            number: seat.number,
            type: seat.type || 'REGULAR', // Default to REGULAR if not specified
            isBooked: seat.status === 'booked',
            position: seat.position || 'middle', // Default to middle if not specified
            preferredView: seat.preferredView || false,
            status: seat.status || 'available'
          }))
        }));
        
        setSections(transformedSections);
        setShowtime(showtimeData);
        setLoading(false);
      } catch (error) {
        setError('Failed to load seating information. Please try again later.');
        console.error('Error:', error);
        setLoading(false);
      }
    };

    if (showtimesId) {
      fetchShowtimeAndSeats();
    }
  }, [showtimesId]);

  const handleSeatClick = (seatId: string, seat: Seat) => {
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

  const handleProceedToPayment = () => {
    if (!showtime) return;

    navigate('/payment', {
      state: {
        movieId,
        showtimesId,
        movieTitle: showtime.movieId.title,
        screenName: `Screen ${showtime.screenId.number} - ${showtime.screenId.name}`,
        showtime: `${showtime.date} ${showtime.startTime}`,
        seats: selectedSeats,
        totalAmount: calculateTotalPrice()
      }
    });
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
        <Divider sx={{ mb: 4 }} />

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
                  '& .MuiButton-label': { color: '#000000' },
                  color: '#000000'
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
                  '& .MuiButton-label': { color: '#000000' },
                  color: '#000000'
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
          disabled={selectedSeats.length === 0}
          onClick={handleProceedToPayment}
          sx={{ mt: 2 }}
        >
          Proceed to Payment
        </Button>
      </Paper>
    </Container>
  );
} 