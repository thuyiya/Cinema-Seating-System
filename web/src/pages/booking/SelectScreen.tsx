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

interface Screening {
  id: string;
  screenNumber: number;
  startsAt: string;
  endsAt: string;
  movie: {
    title: string;
  };
}

export default function SelectScreen() {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { movieId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScreenings = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/movies/${movieId}/screenings`);
        if (!response.ok) {
          throw new Error('Failed to fetch screenings');
        }
        const data = await response.json();
        setScreenings(data);
      } catch (error) {
        setError('Failed to load screenings. Please try again later.');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScreenings();
  }, [movieId]);

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

  // Group screenings by screen number
  const screeningsByScreen = screenings.reduce((acc, screening) => {
    const screen = acc.find(s => s.screenNumber === screening.screenNumber);
    if (screen) {
      screen.times.push(screening);
    } else {
      acc.push({
        screenNumber: screening.screenNumber,
        times: [screening]
      });
    }
    return acc;
  }, [] as { screenNumber: number; times: Screening[] }[]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Select Screen & Time
      </Typography>
      {screenings[0]?.movie && (
        <Typography variant="h5" gutterBottom color="primary">
          {screenings[0].movie.title}
        </Typography>
      )}
      <Divider sx={{ my: 3 }} />
      
      {screeningsByScreen.map(({ screenNumber, times }) => (
        <Card key={screenNumber} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Screen {screenNumber}
            </Typography>
            <Grid container spacing={2}>
              {times.map((screening) => (
                <Grid item key={screening.id}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/booking/${movieId}/screen/${screening.id}`)}
                  >
                    {format(new Date(screening.startsAt), 'h:mm a')}
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