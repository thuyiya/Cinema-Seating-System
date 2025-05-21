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

export default function SelectSeats() {
  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { movieId, showtimeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowtimeAndSeats = async () => {
      try {
        // Fetch showtime details
        const showtimeResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/showtimes/${showtimeId}`);
        if (!showtimeResponse.ok) {
          throw new Error('Failed to fetch showtime details');
        }
        const showtimeData = await showtimeResponse.json();
        setShowtime(showtimeData);

        // Fetch seats for the showtime
        const seatsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/showtimes/${showtimeId}/seats`);
        if (!seatsResponse.ok) {
          throw new Error('Failed to fetch seats');
        }
        const seatsData = await seatsResponse.json();
        setSeats(seatsData);
      } catch (error) {
        setError('Failed to load seating information. Please try again later.');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (showtimeId) {
      fetchShowtimeAndSeats();
    }
  }, [showtimeId]);

  const handleSeatClick = (seatId: string, seatType: string) => {
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
      const seat = seats.find(s => s.id === seatId);
      if (!seat) return total;
      return total + showtime.price[seat.type];
    }, 0);
  };

  const handleProceedToPayment = () => {
    if (!showtime) return;

    navigate('/payment', {
      state: {
        movieId,
        showtimeId,
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

  // Group seats by row
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as { [key: string]: Seat[] });

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

        <Box sx={{ mb: 4 }}>
          {Object.entries(seatsByRow).map(([row, seats]) => (
            <Grid container spacing={1} key={row} justifyContent="center" sx={{ mb: 1 }}>
              <Grid item xs={1}>
                <Typography align="center">{row}</Typography>
              </Grid>
              <Grid item xs={11}>
                <Grid container spacing={1} justifyContent="flex-start">
                  {seats.map((seat) => (
                    <Grid item key={seat.id}>
                      <Button
                        variant={selectedSeats.includes(seat.id) ? "contained" : "outlined"}
                        disabled={seat.isBooked}
                        onClick={() => handleSeatClick(seat.id, seat.type)}
                        sx={{
                          minWidth: '40px',
                          height: '40px',
                          p: 0,
                          backgroundColor: seat.isBooked ? 'grey.300' : 
                            seat.type === 'vip' ? 'secondary.light' :
                            seat.type === 'accessible' ? 'info.light' : undefined
                        }}
                      >
                        {seat.number}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Seat Types:
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button variant="outlined" disabled>Standard (${showtime.price.standard})</Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" disabled sx={{ backgroundColor: 'secondary.light' }}>
                VIP (${showtime.price.vip})
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" disabled sx={{ backgroundColor: 'info.light' }}>
                Accessible (${showtime.price.accessible})
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