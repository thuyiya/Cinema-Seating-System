import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Divider,
} from '@mui/material';
import { BookingService } from '../services/bookingService';
import type { BookingResponse } from '../types/booking';

export default function Payment() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingResponse | null>(null);
  const [contactDetails, setContactDetails] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSeats = (seats: any[]) => {
    return seats.map(seat => `${seat.row}${seat.number}`).join(', ');
  };

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const details = await BookingService.getBookingDetails(bookingId!);
        setBookingDetails(details);
        
        // Set contact details from the booking
        if (details.userId) {
          setContactDetails({
            name: details.userId.name,
            email: details.userId.email,
            mobile: details.userId.phone || ''
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load booking details');
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await BookingService.processPayment(bookingId!, {
        cardDetails: {
          number: '4242424242424242', // Test card number
          expiry: '12/25',
          cvv: '123'
        }
      });

      // Navigate to booking details page on success
      navigate(`/booking/${bookingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !bookingDetails) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Booking not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Payment Details
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Booking Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary">Date</Typography>
              <Typography variant="body1">
                {bookingDetails.showtimeId.date ? formatDate(bookingDetails.showtimeId.date) : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary">Show Time</Typography>
              <Typography variant="body1">
                {bookingDetails.showtimeId.startTime} - {bookingDetails.showtimeId.endTime}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary">Seats</Typography>
              <Typography variant="body1">
                {formatSeats(bookingDetails.seats)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary">Seat Type</Typography>
              <Typography variant="body1">
                {bookingDetails.seats[0]?.type || 'REGULAR'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary">Booking Status</Typography>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {bookingDetails.status}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography color="text.secondary">Expires At</Typography>
              <Typography variant="body1">
                {bookingDetails.expiresAt ? new Date(bookingDetails.expiresAt).toLocaleTimeString() : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Contact Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Full Name"
                value={contactDetails.name}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Email"
                value={contactDetails.email}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mobile"
                value={contactDetails.mobile}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Payment Summary
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Typography variant="body1">Total Amount</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h5" color="primary">
                ${bookingDetails.totalAmount.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing Payment...' : `Pay $${bookingDetails.totalAmount.toFixed(2)}`}
        </Button>
      </Paper>
    </Container>
  );
}