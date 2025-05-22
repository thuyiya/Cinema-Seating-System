import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  CircularProgress,
  Divider,
} from '@mui/material';
import { format } from 'date-fns';
import type { Showtime } from '../../types/movie';

export default function SelectScreen() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { movieId } = useParams();
  const navigate = useNavigate();

  const fetchShowtimes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/showtimes?movieId=${movieId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch showtimes');
      }
      const data = await response.json();
      setShowtimes(data);
    } catch (error) {
      setError('Failed to load showtimes. Please try again later.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowtimes();
  }, []);

  const handleShowtimeSelect = (showtime: Showtime) => {
    navigate(`/booking/${movieId}/${showtime._id}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  // Group showtimes by date
  const showtimesByDate = showtimes.reduce((acc, showtime) => {
    const date = format(new Date(showtime.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(showtime);
    return acc;
  }, {} as { [key: string]: Showtime[] });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Select Showtime
      </Typography>
      {showtimes[0]?.movieId && (
        <Typography variant="h5" gutterBottom color="primary">
          {showtimes[0].movieId.title}
        </Typography>
      )}
      <Divider sx={{ my: 3 }} />
      
      {Object.entries(showtimesByDate).map(([date, dateShowtimes]) => (
        <Card key={date} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </Typography>
            <Grid container spacing={2}>
              {dateShowtimes.map((showtime) => (
                <Grid item key={showtime._id} xs={12} sm={6} md={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleShowtimeSelect(showtime)}
                    sx={{ textAlign: 'left', display: 'block' }}
                  >
                    <Typography variant="subtitle1">
                      {showtime.startTime} - {showtime.endTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Screen {showtime.screenId.number} - {showtime.screenId.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Standard: ${showtime.price.REGULAR} | VIP: ${showtime.price.VIP}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Available seats: {
                        Object.values(showtime.availableSeats).reduce((a, b) => a + b, 0)
                      }
                    </Typography>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
} 