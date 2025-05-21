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
} from '@mui/material';

interface Seat {
  row: number;
  number: number;
  type: 'standard' | 'vip' | 'accessible';
  status: 'available' | 'broken' | 'maintenance';
  position: 'aisle' | 'middle' | 'edge';
  preferredView: boolean;
}

interface SeatEditorProps {
  open: boolean;
  seat: Seat | null;
  onClose: () => void;
  onSave: (updatedSeat: Seat) => void;
}

const SeatEditor: React.FC<SeatEditorProps> = ({
  open,
  seat,
  onClose,
  onSave,
}) => {
  const [editedSeat, setEditedSeat] = React.useState<Seat | null>(null);

  React.useEffect(() => {
    setEditedSeat(seat);
  }, [seat]);

  if (!editedSeat) return null;

  const handleChange = (field: keyof Seat, value: any) => {
    setEditedSeat(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleSave = () => {
    if (editedSeat) {
      onSave(editedSeat);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Edit Seat - Row {editedSeat.row}, Seat {editedSeat.number}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={editedSeat.type}
              label="Type"
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <MenuItem value="standard">Standard</MenuItem>
              <MenuItem value="vip">VIP</MenuItem>
              <MenuItem value="accessible">Accessible</MenuItem>
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

          <FormControl fullWidth>
            <InputLabel>Position</InputLabel>
            <Select
              value={editedSeat.position}
              label="Position"
              onChange={(e) => handleChange('position', e.target.value)}
            >
              <MenuItem value="aisle">Aisle</MenuItem>
              <MenuItem value="middle">Middle</MenuItem>
              <MenuItem value="edge">Edge</MenuItem>
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