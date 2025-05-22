import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert
} from '@mui/material';

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

interface GuestInfoDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (guestInfo: GuestInfo) => void;
}

export default function GuestInfoDialog({ open, onClose, onSubmit }: GuestInfoDialogProps) {
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!guestInfo.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!guestInfo.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Valid email is required');
      return false;
    }
    console.log(guestInfo.phone);
    if (!guestInfo.phone.match(/^[0-9]{10}$/)) {
        setError('Valid 10-digit mobile number is required');
        return false;
      }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(guestInfo);
      setGuestInfo({ name: '', email: '', phone: '' });
      setError(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enter Guest Information</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            label="Full Name"
            fullWidth
            required
            value={guestInfo.name}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
            error={!!error && !guestInfo.name}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={guestInfo.email}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
            error={!!error && !guestInfo.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)}
          />
          <TextField
            label="Mobile Number"
            fullWidth
            required
            value={guestInfo.phone}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
            error={!!error && !guestInfo.phone.match(/^[0-9]{10}$/)}
            helperText="10-digit mobile number"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
} 