import { Container, Typography, Box, Paper, Stepper, Step, StepLabel } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';

const steps = ['Select Movie', 'Choose Screen', 'Select Seats', 'Payment'];

export default function Booking() {
  const location = useLocation();
  const currentStep = () => {
    const path = location.pathname;
    if (path === '/booking') return 0;
    if (path.includes('/screen/')) return 2;
    if (path.includes('/payment')) return 3;
    if (path.includes('/booking/')) return 1;
    return 0;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Book Your Tickets
        </Typography>
        <Box sx={{ width: '100%', mb: 4 }}>
          <Stepper activeStep={currentStep()} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Paper>
      <Outlet />
    </Container>
  );
}