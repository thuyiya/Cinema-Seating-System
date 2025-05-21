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
  IconButton,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScreenForm from '../../components/ScreenForm';
import type { IScreenFormData } from '../../components/ScreenForm';

interface Screen {
  _id: string;
  number: number;
  name: string;
  sections: {
    name: string;
    rows: number;
    seatsPerRow: number;
    startRow: number;
    rowLabels: string[];
    seatLabels: string[];
    seats: {
      row: number;
      number: number;
      type: 'standard' | 'vip' | 'accessible';
      status: 'available' | 'broken' | 'maintenance';
      position: 'aisle' | 'middle' | 'edge';
      preferredView: boolean;
    }[];
  }[];
  totalCapacity: number;
  layout: {
    type: 'straight' | 'curved' | 'c-shaped';
    hasBalcony: boolean;
    aislePositions: number[];
  };
  seatingRules: {
    allowSplitGroups: boolean;
    maxGroupSize: number;
    allowSinglesBetweenGroups: boolean;
    preferredStartingRows: number[];
    vipRowsRange: {
      start: number;
      end: number;
    };
    accessibleSeatsLocations: {
      row: number;
      seatStart: number;
      seatEnd: number;
    }[];
  };
}

const defaultFormData: IScreenFormData = {
  number: '',
  name: '',
  sections: [{
    name: 'Main',
    rows: '10',
    seatsPerRow: '15',
    startRow: 1,
    rowLabels: Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i)),
    seatLabels: Array.from({ length: 15 }, (_, i) => (i + 1).toString()),
    seats: []
  }],
  layout: {
    type: 'straight' as const,
    hasBalcony: false,
    aislePositions: [5, 10]
  },
  seatingRules: {
    allowSplitGroups: false,
    maxGroupSize: 7,
    allowSinglesBetweenGroups: false,
    preferredStartingRows: [3, 4, 5],
    vipRowsRange: {
      start: 1,
      end: 2
    },
    accessibleSeatsLocations: [{
      row: 1,
      seatStart: 1,
      seatEnd: 4
    }]
  }
};

export default function ManageScreens() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingScreen, setEditingScreen] = useState<Screen | null>(null);
  const [formData, setFormData] = useState<IScreenFormData>(defaultFormData);

  useEffect(() => {
    fetchScreens();
  }, []);

  const fetchScreens = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/screens`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch screens');
      }
      const data = await response.json();
      setScreens(data);
    } catch (error) {
      setError('Failed to load screens. Please try again later.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (screen?: Screen) => {
    if (screen) {
      setEditingScreen(screen);
      setFormData({
        number: screen.number.toString(),
        name: screen.name,
        sections: screen.sections.map(section => ({
          name: section.name,
          rows: section.rows.toString(),
          seatsPerRow: section.seatsPerRow.toString(),
          startRow: section.startRow,
          rowLabels: section.rowLabels,
          seatLabels: section.seatLabels,
          seats: section.seats
        })),
        layout: screen.layout,
        seatingRules: screen.seatingRules
      });
    } else {
      setEditingScreen(null);
      setFormData(defaultFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingScreen(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = async () => {
    try {
      // Calculate total capacity from all sections
      const totalCapacity = formData.sections.reduce((total, section) => {
        return total + (parseInt(section.rows) * parseInt(section.seatsPerRow));
      }, 0);

      const screenData = {
        number: parseInt(formData.number),
        name: formData.name,
        sections: formData.sections.map(section => ({
          ...section,
          rows: parseInt(section.rows),
          seatsPerRow: parseInt(section.seatsPerRow)
        })),
        layout: formData.layout,
        seatingRules: formData.seatingRules,
        totalCapacity
      };

      const url = editingScreen
        ? `${import.meta.env.VITE_API_BASE_URL}/api/screens/${editingScreen._id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/screens`;
      
      const response = await fetch(url, {
        method: editingScreen ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(screenData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save screen');
      }

      handleCloseDialog();
      fetchScreens();
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save screen');
      console.error('Error saving screen:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this screen?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/screens/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete screen');
      }

      fetchScreens();
      setError(null);
    } catch (error) {
      setError('Failed to delete screen. Please try again.');
      console.error('Error deleting screen:', error);
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Screen Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Layout Type</TableCell>
              <TableCell>Sections</TableCell>
              <TableCell align="right">Total Capacity</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {screens.map((screen) => (
              <TableRow key={screen._id}>
                <TableCell>{screen.number}</TableCell>
                <TableCell>{screen.name}</TableCell>
                <TableCell>{screen.layout.type}</TableCell>
                <TableCell>{screen.sections.length}</TableCell>
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
                    onClick={() => handleDelete(screen._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingScreen ? 'Edit Screen' : 'Add New Screen'}
        </DialogTitle>
        <DialogContent>
          <ScreenForm
            formData={formData}
            onChange={setFormData}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingScreen ? 'Save Changes' : 'Create Screen'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 