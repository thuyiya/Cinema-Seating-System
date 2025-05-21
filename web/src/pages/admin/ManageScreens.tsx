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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventSeatIcon from '@mui/icons-material/EventSeat';

interface Screen {
  id: string;
  number: number;
  hallId: string;
  hall: {
    name: string;
  };
  rows: number;
  seatsPerRow: number;
  totalCapacity: number;
}

interface Hall {
  id: string;
  name: string;
}

export default function ManageScreens() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    hallId: '',
    rows: '',
    seatsPerRow: '',
  });

  useEffect(() => {
    Promise.all([fetchScreens(), fetchHalls()]).finally(() => setLoading(false));
  }, []);

  const fetchScreens = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/screens');
      if (!response.ok) {
        throw new Error('Failed to fetch screens');
      }
      const data = await response.json();
      setScreens(data);
    } catch (error) {
      setError('Failed to load screens. Please try again later.');
      console.error('Error:', error);
    }
  };

  const fetchHalls = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/halls');
      if (!response.ok) {
        throw new Error('Failed to fetch halls');
      }
      const data = await response.json();
      setHalls(data);
    } catch (error) {
      console.error('Error fetching halls:', error);
    }
  };

  const handleOpenDialog = (screen?: Screen) => {
    if (screen) {
      setEditingScreen(screen);
      setFormData({
        number: screen.number.toString(),
        hallId: screen.hallId,
        rows: screen.rows.toString(),
        seatsPerRow: screen.seatsPerRow.toString(),
      });
    } else {
      setEditingScreen(null);
      setFormData({
        number: '',
        hallId: '',
        rows: '',
        seatsPerRow: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingScreen(null);
    setFormData({
      number: '',
      hallId: '',
      rows: '',
      seatsPerRow: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingScreen
        ? `http://localhost:3001/api/screens/${editingScreen.id}`
        : 'http://localhost:3001/api/screens';
      
      const response = await fetch(url, {
        method: editingScreen ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: parseInt(formData.number),
          hallId: formData.hallId,
          rows: parseInt(formData.rows),
          seatsPerRow: parseInt(formData.seatsPerRow),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save screen');
      }

      handleCloseDialog();
      fetchScreens();
    } catch (error) {
      console.error('Error saving screen:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this screen?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/screens/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete screen');
      }

      fetchScreens();
    } catch (error) {
      console.error('Error deleting screen:', error);
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
          Manage Screens
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Screen
        </Button>
      </Box>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Screen Number</TableCell>
                <TableCell>Hall</TableCell>
                <TableCell align="right">Rows</TableCell>
                <TableCell align="right">Seats per Row</TableCell>
                <TableCell align="right">Total Capacity</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {screens.map((screen) => (
                <TableRow key={screen.id}>
                  <TableCell>{screen.number}</TableCell>
                  <TableCell>{screen.hall.name}</TableCell>
                  <TableCell align="right">{screen.rows}</TableCell>
                  <TableCell align="right">{screen.seatsPerRow}</TableCell>
                  <TableCell align="right">{screen.totalCapacity}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(screen)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(screen.id)}
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
          {editingScreen ? 'Edit Screen' : 'Add New Screen'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                autoFocus
                label="Screen Number"
                type="number"
                fullWidth
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Hall</InputLabel>
                <Select
                  value={formData.hallId}
                  label="Hall"
                  onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                >
                  {halls.map((hall) => (
                    <MenuItem key={hall.id} value={hall.id}>
                      {hall.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Number of Rows"
                type="number"
                fullWidth
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Seats per Row"
                type="number"
                fullWidth
                value={formData.seatsPerRow}
                onChange={(e) => setFormData({ ...formData, seatsPerRow: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingScreen ? 'Save Changes' : 'Add Screen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 