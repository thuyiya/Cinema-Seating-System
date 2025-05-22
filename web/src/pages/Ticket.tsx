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
  Avatar,
} from '@mui/material';
import { BookingService } from '../services/bookingService';
import type { BookingResponse } from '../types/booking';

interface TicketResponse {
  success: boolean;
  ticket: {
    ticketNumber: string;
    movieDetails: {
      title: string;
      posterUrl: string;
      duration: number;
    };
    showtime: {
      date: string;
      startTime: string;
      endTime: string;
      screen: string;
    };
    seats: Array<{
      row: string;
      number: number;
      type: string;
    }>;
    totalAmount: number;
    customerDetails: {
      name: string;
      email: string;
      phone: string;
    };
    status: string;
    qrCode: string;
    payment: {
      transactionId: string;
      status: string;
    };
  };
}

export default function Ticket() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketResponse['ticket'] | null>(null);

  const fetchTicket = async () => {
    try {
      if (bookingId) {
        const response = await BookingService.getTicketDetails(bookingId);
        setTicket(response.ticket);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, []);

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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

        <Grid container spacing={3}>
          {/* Movie Details */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar
                src={ticket.movieDetails.posterUrl}
                alt={ticket.movieDetails.title}
                variant="rounded"
                sx={{ width: 80, height: 120 }}
              />
              <Box>
                <Typography variant="h6" gutterBottom>
                  {ticket.movieDetails.title}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.7)">
                  Duration: {formatDuration(ticket.movieDetails.duration)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Showtime Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Showtime Details
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Date</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{formatDate(ticket.showtime.date)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Time</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.showtime.startTime} - {ticket.showtime.endTime}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Screen</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.showtime.screen}</Typography>
          </Grid>

          {/* Seat Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Seat Details
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              {ticket.seats.map(seat => `${seat.row}${seat.number} (${seat.type})`).join(', ')}
            </Typography>
          </Grid>

          {/* Customer Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Customer Details
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Name</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.customerDetails.name}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Email</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.customerDetails.email}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Mobile</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.customerDetails.phone}</Typography>
          </Grid>

          {/* Payment Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Transaction ID</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{ticket.payment.transactionId}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography color="rgba(255,255,255,0.7)">Amount</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>${ticket.totalAmount.toFixed(2)}</Typography>
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