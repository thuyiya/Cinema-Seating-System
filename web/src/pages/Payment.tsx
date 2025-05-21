import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { BookingService } from '../services/bookingService';
import type { BookingResponse } from '../types/booking';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    mobile: sessionStorage.getItem('guestMobile') || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get booking details from location state
  const bookingDetails = location.state?.bookingDetails || {
    movieTitle: 'Sample Movie',
    screenName: 'Screen 1',
    seats: ['A1', 'A2'],
    totalAmount: 20.00,
    showtime: '7:00 PM',
    screeningId: '',
  };

  const validateGuestDetails = () => {
    if (!guestDetails.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!guestDetails.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Valid email is required');
      return false;
    }
    if (!guestDetails.mobile.match(/^[0-9]{10}$/)) {
      setError('Valid 10-digit mobile number is required');
      return false;
    }
    return true;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate guest details if user is not logged in
    if (!user && !validateGuestDetails()) {
      setLoading(false);
      return;
    }

    try {
      // Create booking first
      const bookingResponse = await BookingService.createBooking({
        screeningId: bookingDetails.screeningId,
        seats: bookingDetails.seats,
        customerDetails: user ? undefined : guestDetails,
        groupSize: bookingDetails.seats.length,
      });

      // Process payment
      const paymentResponse = await BookingService.processPayment(bookingResponse.bookingId, {
        amount: bookingDetails.totalAmount,
        currency: 'USD',
      });

      // Navigate to ticket page on success
      navigate(`/ticket/${paymentResponse.bookingId}`, {
        state: { bookingDetails: paymentResponse },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
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
            <Grid item xs={6}>
              <Typography color="text.secondary">Movie</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{bookingDetails.movieTitle}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color="text.secondary">Screen</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{bookingDetails.screenName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color="text.secondary">Seats</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{bookingDetails.seats.join(', ')}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography color="text.secondary">Showtime</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{bookingDetails.showtime}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box component="form" onSubmit={handlePayment}>
          {!user && (
            <>
              <Typography variant="h6" gutterBottom>
                Contact Details
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Full Name"
                value={guestDetails.name}
                onChange={(e) => setGuestDetails(prev => ({ ...prev, name: e.target.value }))}
                error={!!error && !guestDetails.name}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                type="email"
                value={guestDetails.email}
                onChange={(e) => setGuestDetails(prev => ({ ...prev, email: e.target.value }))}
                error={!!error && !guestDetails.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Mobile Number"
                value={guestDetails.mobile}
                onChange={(e) => setGuestDetails(prev => ({ ...prev, mobile: e.target.value }))}
                error={!!error && !guestDetails.mobile.match(/^[0-9]{10}$/)}
                helperText="10-digit mobile number"
                sx={{ mb: 3 }}
              />
              <Divider sx={{ my: 3 }} />
            </>
          )}

          <Typography variant="h6" align="right" gutterBottom>
            Total Amount: ${bookingDetails.totalAmount.toFixed(2)}
          </Typography>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Processing Payment...' : `Pay $${bookingDetails.totalAmount.toFixed(2)}`}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}