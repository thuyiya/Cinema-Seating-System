import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

interface Movie {
  id: string;
  title: string;
  duration: number;
}

interface Screen {
  id: string;
  number: number;
  name?: string;
  hall?: {
    name: string;
  };
  sections: any[];
  totalCapacity: number;
}

interface Screening {
  id: string;
  movieId: string;
  screenId: string;
  startsAt: string;
  endsAt: string;
  movie: Movie;
  screen: Screen;
}

export default function ManageShowtimes() {
  const [showtimes, setShowtimes] = useState<Screening[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingScreening, setEditingScreening] = useState<Screening | null>(null);
  const [formData, setFormData] = useState({
    movieId: '',
    screenId: '',
    startsAt: new Date(),
    endsAt: new Date()
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    Promise.all([fetchScreenings(), fetchMovies(), fetchScreens()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchScreenings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/showtimes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch screenings');
      }
      const data = await response.json();
      setShowtimes(data);
    } catch (error) {
      setError('Failed to load screenings. Please try again later.');
      console.error('Error:', error);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/movies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch movies');
      }
      const data = await response.json();
      setMovies(data.nowShowing || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies. Please try again later.');
    }
  };

  const fetchScreens = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/screens`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch screens');
      }
      const data = await response.json();
      const formattedScreens = Array.isArray(data) ? data.map((screen: any) => ({
        id: screen._id,
        number: screen.number,
        name: screen.name,
        sections: screen.sections,
        totalCapacity: screen.totalCapacity
      })) : [];
      console.log('Fetched screens:', formattedScreens);
      setScreens(formattedScreens);
    } catch (error) {
      console.error('Error fetching screens:', error);
      setError('Failed to load screens. Please try again later.');
    }
  };

  const handleOpenDialog = (screening?: Screening) => {
    if (screening) {
      setEditingScreening(screening);
      setFormData({
        movieId: screening.movieId,
        screenId: screening.screenId,
        startsAt: new Date(screening.startsAt),
        endsAt: new Date(screening.endsAt)
      });
    } else {
      setEditingScreening(null);
      setFormData({
        movieId: '',
        screenId: '',
        startsAt: new Date(),
        endsAt: new Date()
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingScreening(null);
    setFormData({
      movieId: '',
      screenId: '',
      startsAt: new Date(),
      endsAt: new Date()
    });
  };

  const calculateEndTime = (movieId: string, startTime: Date): Date => {
    const movie = movies.find((m) => m.id === movieId);
    if (!movie) {
      return new Date(startTime.getTime() + 120 * 60000);
    }
    return new Date(startTime.getTime() + movie.duration * 60000);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return format(date, 'PPpp');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.movieId || !formData.screenId || !formData.startsAt) {
        throw new Error('Please fill in all required fields');
      }

      const startDate = new Date(formData.startsAt);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date selected');
      }

      const url = editingScreening
        ? `${API_BASE_URL}/api/showtimes/${editingScreening.id}`
        : `${API_BASE_URL}/api/showtimes`;

      const endsAt = calculateEndTime(formData.movieId, startDate);
      
      const response = await fetch(url, {
        method: editingScreening ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          movieId: formData.movieId,
          screenId: formData.screenId,
          startsAt: startDate.toISOString(),
          endsAt: endsAt.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save showtime');
      }

      handleCloseDialog();
      fetchScreenings();
    } catch (error) {
      console.error('Error saving showtime:', error);
      setError(error instanceof Error ? error.message : 'Failed to save showtime. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this showtime?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/showtimes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete showtime');
      }

      fetchScreenings();
    } catch (error) {
      console.error('Error deleting showtime:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete showtime. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Manage Showtimes
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            Add New Showtime
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Movie</TableCell>
                <TableCell>Screen</TableCell>
                <TableCell>Hall</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {showtimes.map((showtime) => (
                <TableRow key={showtime.id}>
                  <TableCell>{showtime.movie?.title || 'N/A'}</TableCell>
                  <TableCell>Screen {showtime.screen?.number || 'N/A'}</TableCell>
                  <TableCell>{showtime.screen?.name || 'N/A'}</TableCell>
                  <TableCell>{formatDate(showtime.startsAt)}</TableCell>
                  <TableCell>{formatDate(showtime.endsAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(showtime)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(showtime.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingScreening ? 'Edit Showtime' : 'Add New Showtime'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Movie</InputLabel>
                  <Select
                    value={formData.movieId}
                    onChange={(e) => setFormData(prev => ({ ...prev, movieId: e.target.value }))}
                    label="Movie"
                  >
                    {movies.map((movie) => (
                      <MenuItem key={movie.id} value={movie.id}>
                        {movie.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Screen</InputLabel>
                  <Select
                    value={formData.screenId}
                    onChange={(e) => setFormData(prev => ({ ...prev, screenId: e.target.value }))}
                    label="Screen"
                  >
                    {screens.map((screen) => (
                      <MenuItem key={screen.id} value={screen.id}>
                        Screen {screen.number} - {screen.name || 'N/A'} ({screen.totalCapacity} seats)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <MobileDateTimePicker
                  label="Start Time"
                  value={formData.startsAt}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData(prev => ({
                        ...prev,
                        startsAt: newValue
                      }));
                    }
                  }}
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12}>
                <MobileDateTimePicker
                  label="End Time"
                  value={formData.endsAt}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData(prev => ({
                        ...prev,
                        endsAt: newValue
                      }));
                    }
                  }}
                  sx={{ width: '100%' }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingScreening ? 'Save Changes' : 'Add Showtime'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
} 