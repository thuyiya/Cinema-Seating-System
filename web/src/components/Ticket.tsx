import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { BookingService } from '../services/bookingService';

type TicketDetails = NonNullable<Awaited<ReturnType<typeof BookingService.getTicketDetails>>>['ticket'];

export default function Ticket() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TicketDetails | null>(null);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await BookingService.getTicketDetails(bookingId!);
        setTicket(response.ticket);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ticket details');
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchTicketDetails();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !ticket) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Ticket not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Movie Ticket</Typography>
          <Typography variant="h6" color="primary">#{ticket.ticketNumber}</Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Movie Details */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>{ticket.movieDetails.title}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="text.secondary">Date</Typography>
                <Typography>{new Date(ticket.showtime.date).toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">Time</Typography>
                <Typography>{ticket.showtime.startTime} - {ticket.showtime.endTime}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">Screen</Typography>
                <Typography>{ticket.showtime.screen}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="text.secondary">Duration</Typography>
                <Typography>{ticket.movieDetails.duration} mins</Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* QR Code */}
          <Grid item xs={12} md={4}>
            <Box display="flex" justifyContent="center">
              <QRCodeSVG value={ticket.qrCode} size={150} />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Seat Details */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Seat Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography>
                {ticket.seats.map(seat => `${seat.row}${seat.number} (${seat.type})`).join(', ')}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Customer Details */}
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>Customer Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography color="text.secondary">Name</Typography>
              <Typography>{ticket.customerDetails.name}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography color="text.secondary">Email</Typography>
              <Typography>{ticket.customerDetails.email}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography color="text.secondary">Phone</Typography>
              <Typography>{ticket.customerDetails.phone}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Payment Details */}
        <Box>
          <Typography variant="h6" gutterBottom>Payment Details</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <Typography color="text.secondary">Transaction ID</Typography>
              <Typography>{ticket.payment.transactionId}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="h5" color="primary">
                ${ticket.totalAmount.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
} 