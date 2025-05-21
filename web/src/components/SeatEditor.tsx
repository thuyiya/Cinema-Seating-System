import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from '@mui/material';
import type { Seat } from '../types/movie';

// Create a type specifically for editing seats
type EditableSeat = Omit<Seat, 'status'> & {
  status: 'available' | 'broken' | 'maintenance';
};

interface SeatEditorProps {
  open: boolean;
  seat: Seat | null;
  onClose: () => void;
  onSave: (updatedSeat: {
    type: 'REGULAR' | 'VIP' | 'ACCESSIBLE';
    status: 'available' | 'broken' | 'maintenance';
    preferredView: boolean;
  }) => void;
}

const SeatEditor: React.FC<SeatEditorProps> = ({
  open,
  seat,
  onClose,
  onSave,
}) => {
  const [editedSeat, setEditedSeat] = React.useState<EditableSeat | null>(null);

  React.useEffect(() => {
    if (seat) {
      // Convert the incoming seat to an editable seat
      const editableSeat: EditableSeat = {
        ...seat,
        status: (seat.status === 'booked' || !seat.status) ? 'available' : seat.status
      };
      setEditedSeat(editableSeat);
    }
  }, [seat]);

  if (!editedSeat) return null;

  const handleChange = (field: keyof typeof editedSeat, value: any) => {
    setEditedSeat(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleSave = () => {
    if (editedSeat) {
      onSave({
        type: editedSeat.type,
        status: editedSeat.status,
        preferredView: editedSeat.preferredView
      });
    }
    onClose();
  };

  const rowLetter = String.fromCharCode(64 + parseInt(editedSeat.row));

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Edit Seat {rowLetter}{editedSeat.number}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300, mt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            You can modify the seat type and status. Seat position and number cannot be changed after initial layout creation.
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={editedSeat.type}
              label="Type"
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <MenuItem value="REGULAR">Regular</MenuItem>
              <MenuItem value="VIP">VIP</MenuItem>
              <MenuItem value="ACCESSIBLE">Accessible</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={editedSeat.status}
              label="Status"
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="broken">Broken</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={editedSeat.preferredView}
                onChange={(e) => handleChange('preferredView', e.target.checked)}
              />
            }
            label="Preferred View"
          />

          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="textSecondary">
              Position: {editedSeat.position.charAt(0).toUpperCase() + editedSeat.position.slice(1)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SeatEditor; 