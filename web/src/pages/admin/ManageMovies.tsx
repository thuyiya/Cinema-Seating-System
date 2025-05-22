import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  IconButton,
  Alert,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { format } from 'date-fns';

interface Movie {
  id: string;
  title: string;
  overview: string;
  poster: string;
  releaseDate: string;
  rating: number;
  duration: number;
  type: 'now_showing' | 'coming_soon';
}

interface DatabaseMovie extends Omit<Movie, 'poster'> {
  _id: string;
  tmdbId: string;
  posterPath: string;
  screeningDates: ScreeningDate[];
}

interface ScreeningDate {
  startDate: Date;
  endDate: Date;
}

interface MovieWithScreenings extends Movie {
  screeningDates: ScreeningDate[];
}

export default function ManageMovies() {
  const [allMovies, setAllMovies] = useState<{ nowShowing: Movie[], comingSoon: Movie[] }>({
    nowShowing: [],
    comingSoon: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [databaseMovies, setDatabaseMovies] = useState<DatabaseMovie[]>([]);
  const [selectedTab, setSelectedTab] = useState<'now_showing' | 'coming_soon' | 'in_cinema'>('now_showing');
  const [selectedMovie, setSelectedMovie] = useState<MovieWithScreenings | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
    fetchDatabaseMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/tmdb`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      setAllMovies(data);
    } catch (error) {
      setError('Failed to load movies. Please try again later.');
      console.error('Error fetching movies:', error);
    }
  };

  const fetchDatabaseMovies = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch database movies');
      const data = await response.json();
      setDatabaseMovies([...data.nowShowing, ...data.comingSoon]);
    } catch (error) {
      setError('Failed to load database movies. Please try again later.');
      console.error('Error fetching database movies:', error);
    }
  };

  const isMovieInDatabase = (movieId: string) => {
    return databaseMovies.some(movie => movie.tmdbId === movieId);
  };

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie({
      ...movie,
      screeningDates: [{ startDate: new Date(), endDate: new Date() }]
    });
    setIsDialogOpen(true);
  };

  const handleAddScreeningDate = () => {
    if (selectedMovie) {
      setSelectedMovie({
        ...selectedMovie,
        screeningDates: [
          ...selectedMovie.screeningDates,
          { startDate: new Date(), endDate: new Date() }
        ]
      });
    }
  };

  const handleRemoveScreeningDate = (index: number) => {
    if (selectedMovie) {
      const newDates = [...selectedMovie.screeningDates];
      newDates.splice(index, 1);
      setSelectedMovie({
        ...selectedMovie,
        screeningDates: newDates
      });
    }
  };

  const handleDateChange = (index: number, type: 'startDate' | 'endDate', date: Date | null) => {
    if (selectedMovie && date) {
      const newDates = [...selectedMovie.screeningDates];
      newDates[index] = {
        ...newDates[index],
        [type]: date
      };
      setSelectedMovie({
        ...selectedMovie,
        screeningDates: newDates
      });
    }
  };

  const handleAddMovie = async () => {
    if (!selectedMovie) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tmdbId: selectedMovie.id,
          title: selectedMovie.title,
          overview: selectedMovie.overview,
          posterUrl: selectedMovie.poster, 
          posterPath: selectedMovie.poster, 
          releaseDate: selectedMovie.releaseDate,
          rating: selectedMovie.rating,
          duration: selectedMovie.duration,
          type: selectedTab,
          screeningDates: selectedMovie.screeningDates.map(date => ({
            startDate: date.startDate.toISOString(),
            endDate: date.endDate.toISOString()
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add movie');
      }

      setIsDialogOpen(false);
      setSelectedMovie(null);
      fetchMovies();
      fetchDatabaseMovies();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add movie. Please try again.');
      console.error('Error adding movie:', error);
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }

      fetchDatabaseMovies();
      setError(null);
    } catch (error) {
      setError('Failed to delete movie. Please try again.');
      console.error('Error deleting movie:', error);
    }
  };

  const renderMovieCard = (movie: Movie | DatabaseMovie, isInDatabase: boolean = false) => {
    const posterUrl = (movie as DatabaseMovie).posterPath  
      ? (movie as DatabaseMovie).posterPath 
      : (movie as Movie).poster;

    return (
      <Card 
        sx={{ 
          width: '100%',
          height: '500px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardMedia
          component="img"
          height="300"
          image={posterUrl}
          alt={movie.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" noWrap>
            {movie.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            Release: {format(new Date(movie.releaseDate), 'dd MMM yyyy')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rating: {movie.rating.toFixed(1)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Duration: {movie.duration} Muniets
          </Typography>
          {isInDatabase && (
            <Box mt={1}>
              <Chip 
                label={movie.type === 'now_showing' ? 'Now Showing' : 'Coming Soon'} 
                color={movie.type === 'now_showing' ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          )}
        </CardContent>
        <CardActions sx={{ padding: 2, pt: 0 }}>
          {isInDatabase ? (
            <Button 
              size="small" 
              variant="outlined"
              color="error"
              onClick={() => handleDeleteMovie(movie.id)}
              fullWidth
            >
              Remove from Cinema
            </Button>
          ) : (
            !isMovieInDatabase(movie.id) && (
              <Button 
                size="small" 
                variant="contained"
                onClick={() => handleMovieSelect(movie as Movie)}
                fullWidth
              >
                Add to Cinema
              </Button>
            )
          )}
        </CardActions>
      </Card>
    );
  };

  const filteredMovies = {
    nowShowing: allMovies.nowShowing.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    comingSoon: allMovies.comingSoon.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  };

  const filteredDatabaseMovies = databaseMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size='small'
          sx={{ 
            maxWidth: 500,
            mb: 2,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'gray',
              '&:hover': {
                '& > fieldset': {
                  borderColor: 'primary.main',
                },
              },
            },
          }}
        />

        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="Now Showing" value="now_showing" />
          <Tab label="Coming Soon" value="coming_soon" />
          <Tab label="In Cinema" value="in_cinema" />
        </Tabs>
      </Box>

      <Grid container spacing={2} sx={{ px: 0 }}>
        {selectedTab === 'now_showing' && 
          filteredMovies.nowShowing.map((movie) => (
            <Grid item xs={12} sm={1} md={1} lg={1} key={movie.id} sx={{ p: 1 }}>
              {renderMovieCard(movie, isMovieInDatabase(movie.id))}
            </Grid>
          ))}
        {selectedTab === 'coming_soon' && 
          filteredMovies.comingSoon.map((movie) => (
            <Grid item xs={12} sm={1} md={1} lg={1} key={movie.id} sx={{ p: 1 }}>
              {renderMovieCard(movie, isMovieInDatabase(movie.id))}
            </Grid>
          ))}
        {selectedTab === 'in_cinema' && 
          filteredDatabaseMovies.map((movie) => (
            <Grid item xs={12} sm={1} md={1} lg={1} key={movie.id} sx={{ p: 1 }}>
              {renderMovieCard(movie, true)}
            </Grid>
          ))}
      </Grid>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add Movie Screenings
        </DialogTitle>
        <DialogContent>
          {selectedMovie && (
            <Box sx={{ mt: 2 }}>
              <img src={selectedMovie.poster} alt={selectedMovie.title} width={'100%'} height={150} style={{ objectFit: 'cover' }} />
              <Typography variant="h6" gutterBottom>
                {selectedMovie.title}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Screening Dates
              </Typography>

              {selectedMovie.screeningDates.map((date, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 2, 
                    alignItems: 'center' 
                  }}
                >
                  <DatePicker
                    label="Start Date"
                    value={date.startDate}
                    onChange={(newDate) => handleDateChange(index, 'startDate', newDate)}
                    sx={{ flex: 1 }}
                  />
                  <DatePicker
                    label="End Date"
                    value={date.endDate}
                    onChange={(newDate) => handleDateChange(index, 'endDate', newDate)}
                    sx={{ flex: 1 }}
                  />
                  <IconButton 
                    onClick={() => handleRemoveScreeningDate(index)}
                    disabled={selectedMovie.screeningDates.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={handleAddScreeningDate}
                sx={{ mt: 1 }}
              >
                Add Another Screening Period
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddMovie} 
            variant="contained"
            color="primary"
          >
            Add Movie
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 