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

interface Seat {
  id: string;
  row: string;
  number: number;
  isBooked: boolean;
}

interface ScreeningDetails {
  id: string;
  screenNumber: number;
  startsAt: string;
  movie: {
    title: string;
  };
  seats: Seat[];
}

export default function SelectSeats() {
  const [screening, setScreening] = useState<ScreeningDetails | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { movieId, screenId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScreeningDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/screens/${screenId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch screening details');
        }
        const data = await response.json();
        setScreening(data);
      } catch (error) {
        setError('Failed to load screening details. Please try again later.');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScreeningDetails();
  }, [screenId]);

  const handleSeatClick = (seatId: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  const handleProceedToPayment = () => {
    navigate('/payment', {
      state: {
        movieId,
        screeningId: screenId,
        seats: selectedSeats,
        amount: selectedSeats.length * 10 // $10 per seat
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

  if (error || !screening) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error" align="center">
          {error || 'Screening not found'}
        </Typography>
      </Container>
    );
  }

  // Group seats by row
  const seatsByRow = screening.seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Select Seats
      </Typography>
      <Typography variant="h5" gutterBottom color="primary">
        {screening.movie.title}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Screen {screening.screenNumber}
      </Typography>
      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 4 }}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 2, 
            backgroundColor: 'background.paper',
            textAlign: 'center',
            mb: 4
          }}
        >
          <Typography variant="h6" gutterBottom>
            Screen
          </Typography>
        </Paper>

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
                        onClick={() => handleSeatClick(seat.id)}
                        sx={{
                          minWidth: '40px',
                          height: '40px',
                          p: 0,
                          backgroundColor: seat.isBooked ? 'grey.300' : undefined
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

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Selected Seats: {selectedSeats.length}
          </Typography>
          <Typography variant="h6">
            Total: ${selectedSeats.length * 10}
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
      </Box>
    </Container>
  );
} 