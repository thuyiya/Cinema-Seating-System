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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
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
  hall: {
    name: string;
  };
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
  const [screenings, setScreenings] = useState<Screening[]>([]);
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
  });

  useEffect(() => {
    Promise.all([fetchScreenings(), fetchMovies(), fetchScreens()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchScreenings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/screenings');
      if (!response.ok) {
        throw new Error('Failed to fetch screenings');
      }
      const data = await response.json();
      setScreenings(data);
    } catch (error) {
      setError('Failed to load screenings. Please try again later.');
      console.error('Error:', error);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/movies');
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      setMovies(data.nowShowing || []);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchScreens = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/screens');
      if (!response.ok) {
        throw new Error('Failed to fetch screens');
      }
      const data = await response.json();
      setScreens(data);
    } catch (error) {
      console.error('Error fetching screens:', error);
    }
  };

  const handleOpenDialog = (screening?: Screening) => {
    if (screening) {
      setEditingScreening(screening);
      setFormData({
        movieId: screening.movieId,
        screenId: screening.screenId,
        startsAt: new Date(screening.startsAt),
      });
    } else {
      setEditingScreening(null);
      setFormData({
        movieId: '',
        screenId: '',
        startsAt: new Date(),
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
    });
  };

  const calculateEndTime = (movieId: string, startTime: Date) => {
    const movie = movies.find((m) => m.id === movieId);
    if (!movie) return new Date(startTime);
    return new Date(startTime.getTime() + movie.duration * 60000);
  };

  const handleSubmit = async () => {
    try {
      const url = editingScreening
        ? `http://localhost:3001/api/screenings/${editingScreening.id}`
        : 'http://localhost:3001/api/screenings';

      const endsAt = calculateEndTime(formData.movieId, formData.startsAt);
      
      const response = await fetch(url, {
        method: editingScreening ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: formData.movieId,
          screenId: formData.screenId,
          startsAt: formData.startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save screening');
      }

      handleCloseDialog();
      fetchScreenings();
    } catch (error) {
      console.error('Error saving screening:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this screening?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/screenings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete screening');
      }

      fetchScreenings();
    } catch (error) {
      console.error('Error deleting screening:', error);
      // You might want to show an error message to the user here
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

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
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
              {screenings.map((screening) => (
                <TableRow key={screening.id}>
                  <TableCell>{screening.movie.title}</TableCell>
                  <TableCell>Screen {screening.screen.number}</TableCell>
                  <TableCell>{screening.screen.hall.name}</TableCell>
                  <TableCell>
                    {format(new Date(screening.startsAt), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(screening.endsAt), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(screening)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(screening.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingScreening ? 'Edit Showtime' : 'Add New Showtime'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Movie</InputLabel>
                <Select
                  value={formData.movieId}
                  label="Movie"
                  onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
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
                  label="Screen"
                  onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                >
                  {screens.map((screen) => (
                    <MenuItem key={screen.id} value={screen.id}>
                      Screen {screen.number} - {screen.hall.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Time"
                  value={formData.startsAt}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData({ ...formData, startsAt: newValue });
                    }
                  }}
                  sx={{ width: '100%' }}
                />
              </LocalizationProvider>
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
  );
} 