import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { BookingService } from '../services/bookingService';
import type { BookingResponse } from '../types/booking';

export default function Ticket() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<BookingResponse | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        // Try to get ticket from location state first
        if (location.state?.bookingDetails) {
          setTicket(location.state.bookingDetails);
          setLoading(false);
          return;
        }

        // If not in state, fetch from API
        if (bookingId) {
          const ticketData = await BookingService.getBookingDetails(bookingId);
          setTicket(ticketData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [bookingId, location.state]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !ticket) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Ticket not found'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 4,
          background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
          color: 'white',
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Booking Confirmed!
          </Typography>
          <Typography variant="subtitle1">
            Ticket #{ticket.ticketNumber}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Movie Details
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Movie</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.movieTitle}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Screen</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.screenName}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Date & Time</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.showtime}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Seats</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.seats.join(', ')}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Box my={2}>
              <Typography variant="h6" gutterBottom>
                Customer Details
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Name</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.customerDetails.name}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Mobile</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.customerDetails.mobile}</Typography>
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Return to Home
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => window.print()}
          >
            Print Ticket
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}