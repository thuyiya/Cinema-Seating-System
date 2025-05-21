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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Hall {
  id: string;
  name: string;
  capacity: number;
  screens: number;
}

export default function ManageHalls() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    screens: '',
  });

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/halls');
      if (!response.ok) {
        throw new Error('Failed to fetch halls');
      }
      const data = await response.json();
      setHalls(data);
    } catch (error) {
      setError('Failed to load halls. Please try again later.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (hall?: Hall) => {
    if (hall) {
      setEditingHall(hall);
      setFormData({
        name: hall.name,
        capacity: hall.capacity.toString(),
        screens: hall.screens.toString(),
      });
    } else {
      setEditingHall(null);
      setFormData({
        name: '',
        capacity: '',
        screens: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingHall(null);
    setFormData({
      name: '',
      capacity: '',
      screens: '',
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingHall
        ? `http://localhost:3001/api/halls/${editingHall.id}`
        : 'http://localhost:3001/api/halls';
      
      const response = await fetch(url, {
        method: editingHall ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          capacity: parseInt(formData.capacity),
          screens: parseInt(formData.screens),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save hall');
      }

      handleCloseDialog();
      fetchHalls();
    } catch (error) {
      console.error('Error saving hall:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hall?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/halls/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete hall');
      }

      fetchHalls();
    } catch (error) {
      console.error('Error deleting hall:', error);
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
          Manage Halls
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Hall
        </Button>
      </Box>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Capacity</TableCell>
                <TableCell align="right">Screens</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {halls.map((hall) => (
                <TableRow key={hall.id}>
                  <TableCell>{hall.name}</TableCell>
                  <TableCell align="right">{hall.capacity}</TableCell>
                  <TableCell align="right">{hall.screens}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(hall)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(hall.id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingHall ? 'Edit Hall' : 'Add New Hall'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Hall Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Capacity"
            type="number"
            fullWidth
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Number of Screens"
            type="number"
            fullWidth
            value={formData.screens}
            onChange={(e) => setFormData({ ...formData, screens: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingHall ? 'Save Changes' : 'Add Hall'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 