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
  Chip,
} from '@mui/material';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

interface Movie {
  _id: string;
  title: string;
  duration: number;  // Duration in minutes
}

interface Screen {
  _id: string;
  number: number;
  name: string;
}

interface Price {
  REGULAR: number;
  VIP: number;
  ACCESSIBLE: number;
}

interface AvailableSeats {
  standard: number;
  vip: number;
  accessible: number;
}

interface Showtime {
  _id: string;
  movieId: Movie;
  screenId: Screen;
  date: string;
  startTime: string;
  endTime: string;
  price: Price;
  availableSeats: AvailableSeats;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  movieId: string;
  screenId: string;
  startsAt: Date;
  endsAt: Date;
  price: {
    REGULAR: number;
    VIP: number;
    ACCESSIBLE: number;
  };
}

export default function ManageShowtimes() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [formData, setFormData] = useState<FormData>({
    movieId: '',
    screenId: '',
    startsAt: new Date(),
    endsAt: new Date(Date.now() + (2 * 60 * 60 * 1000)),
    price: {
      REGULAR: 10,
      VIP: 15,
      ACCESSIBLE: 8
    }
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    Promise.all([fetchShowtimes(), fetchMovies(), fetchScreens()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchShowtimes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/showtimes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch showtimes');
      }
      const data = await response.json();
      setShowtimes(data);
    } catch (error) {
      setError('Failed to load showtimes. Please try again later.');
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
        _id: screen._id,
        number: screen.number,
        name: screen.name,
      })) : [];
      setScreens(formattedScreens);
    } catch (error) {
      console.error('Error fetching screens:', error);
      setError('Failed to load screens. Please try again later.');
    }
  };

  const handleOpenDialog = (showtime?: Showtime) => {
    if (showtime) {
      setEditingShowtime(showtime);
      setFormData({
        movieId: showtime.movieId._id,
        screenId: showtime.screenId._id,
        startsAt: new Date(showtime.date),
        endsAt: new Date(showtime.endTime),
        price: {
          REGULAR: showtime.price.REGULAR,
          VIP: showtime.price.VIP,
          ACCESSIBLE: showtime.price.ACCESSIBLE
        }
      });
    } else {
      setEditingShowtime(null);
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // 2 hours later
      setFormData({
        movieId: '',
        screenId: '',
        startsAt: now,
        endsAt: twoHoursLater,
        price: {
          REGULAR: 10,
          VIP: 15,
          ACCESSIBLE: 8
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingShowtime(null);
    setFormData({
      movieId: '',
      screenId: '',
      startsAt: new Date(),
      endsAt: new Date(Date.now() + (2 * 60 * 60 * 1000)),
      price: {
        REGULAR: 10,
        VIP: 15,
        ACCESSIBLE: 8
      }
    });
  };

  const calculateEndDateTime = (startDateTime: Date, durationMinutes: number): Date => {
    return new Date(startDateTime.getTime() + durationMinutes * 60000);
  };

  const handleStartTimeChange = (newValue: Date | null) => {
    if (!newValue) return;

    const selectedMovie = movies.find(m => m._id === formData.movieId);
    if (!selectedMovie) {
      setFormData(prev => ({
        ...prev,
        startsAt: newValue
      }));
      return;
    }

    const endDateTime = calculateEndDateTime(newValue, selectedMovie.duration);
    console.log('End date time:', endDateTime);
    setFormData(prev => ({
      ...prev,
      startsAt: newValue,
      endsAt: endDateTime
    }));
  };

  const handleMovieChange = (e: any) => {
    const movieId = e.target.value;
    const selectedMovie = movies.find(m => m._id === movieId);
    
    setFormData(prev => {
      const newData = { ...prev, movieId };
      
      if (selectedMovie && prev.startsAt) {
        newData.endsAt = calculateEndDateTime(prev.startsAt, selectedMovie.duration);
      }
      
      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.movieId || !formData.screenId || !formData.startsAt) {
        throw new Error('Please fill in all required fields');
      }

      // Ensure we have valid Date objects
      const startDate = formData.startsAt instanceof Date ? formData.startsAt : new Date(formData.startsAt);
      const endDate = formData.endsAt instanceof Date ? formData.endsAt : new Date(formData.endsAt);

      // Validate dates
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date');
      }
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end date');
      }

      // Validate that end date is after start date
      if (endDate <= startDate) {
        throw new Error('End time must be after start time');
      }

      const url = editingShowtime
        ? `${API_BASE_URL}/api/showtimes/${editingShowtime._id}`
        : `${API_BASE_URL}/api/showtimes`;
      
      // Format date and time as required by backend
      const formatTimeOnly = (date: Date) => format(date, 'HH:mm');
      const formatDateOnly = (date: Date) => format(date, 'yyyy-MM-dd');

      const response = await fetch(url, {
        method: editingShowtime ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          movieId: formData.movieId,
          screenId: formData.screenId,
          date: formatDateOnly(startDate),
          startTime: formatTimeOnly(startDate),
          endTime: formatTimeOnly(endDate),
          price: formData.price
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save showtime');
      }

      handleCloseDialog();
      fetchShowtimes();
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

      fetchShowtimes();
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
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Prices</TableCell>
                <TableCell>Available Seats</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {showtimes.map((showtime) => (
                <TableRow key={showtime._id}>
                  <TableCell>{showtime.movieId.title}</TableCell>
                  <TableCell>
                    Screen {showtime.screenId.number} - {showtime.screenId.name}
                  </TableCell>
                  <TableCell>
                    {format(new Date(showtime.date), 'PP')}
                  </TableCell>
                  <TableCell>
                    {showtime.startTime} - {showtime.endTime}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div">
                      Regular: ${showtime.price.REGULAR}
                    </Typography>
                    <Typography variant="body2" component="div">
                      VIP: ${showtime.price.VIP}
                    </Typography>
                    <Typography variant="body2" component="div">
                      Accessible: ${showtime.price.ACCESSIBLE}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div">
                      Standard: {showtime.availableSeats.standard}
                    </Typography>
                    <Typography variant="body2" component="div">
                      VIP: {showtime.availableSeats.vip}
                    </Typography>
                    <Typography variant="body2" component="div">
                      Accessible: {showtime.availableSeats.accessible}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={showtime.isActive ? "Active" : "Inactive"}
                      color={showtime.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(showtime)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(showtime._id)} color="error">
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
            {editingShowtime ? 'Edit Showtime' : 'Add New Showtime'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Movie</InputLabel>
                  <Select
                    value={formData.movieId}
                    onChange={handleMovieChange}
                    label="Movie"
                  >
                    {movies.map((movie) => (
                      <MenuItem key={movie._id} value={movie._id}>
                        {movie.title} ({movie.duration} mins)
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
                      <MenuItem key={screen._id} value={screen._id}>
                        Screen {screen.number} - {screen.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <MobileDateTimePicker
                  label="Start Time"
                  value={formData.startsAt}
                  onChange={handleStartTimeChange}
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12}>
                <MobileDateTimePicker
                  label="End Time (Auto-calculated)"
                  value={formData.endsAt}
                  disabled
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Ticket Prices
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Regular Price"
                  type="number"
                  value={formData.price.REGULAR}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    price: { ...prev.price, REGULAR: Number(e.target.value) }
                  }))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="VIP Price"
                  type="number"
                  value={formData.price.VIP}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    price: { ...prev.price, VIP: Number(e.target.value) }
                  }))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Accessible Price"
                  type="number"
                  value={formData.price.ACCESSIBLE}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    price: { ...prev.price, ACCESSIBLE: Number(e.target.value) }
                  }))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingShowtime ? 'Save Changes' : 'Add Showtime'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
} 