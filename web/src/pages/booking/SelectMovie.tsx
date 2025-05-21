import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Box,
  CircularProgress
} from '@mui/material';

interface Movie {
  id: string;
  title: string;
  posterPath: string;
  duration: number;
  rating: number;
}

export default function SelectMovie() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/movies');
        const data = await response.json();
        setMovies(data.nowShowing || []);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Select a Movie
      </Typography>
      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea onClick={() => navigate(`/booking/${movie.id}`)}>
                <CardMedia
                  component="img"
                  height="300"
                  image={movie.posterPath}
                  alt={movie.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div" noWrap>
                    {movie.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {movie.duration} mins
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rating: {movie.rating}/10
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 