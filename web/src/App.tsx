import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Movies from './pages/Movies';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Ticket from './pages/Ticket';
import NotFound from './pages/NotFound';
import './App.css'
import { AuthWrapper } from './routes/AuthWrapper';
import { AnimatedPage } from './utils/AnimatedPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/Dashboard';
import ManageHalls from './pages/admin/ManageHalls';
import ManageScreens from './pages/admin/ManageScreens';
import ManageShowtimes from './pages/admin/ManageShowtimes';
import ManageMovies from './pages/admin/ManageMovies';
import SelectMovie from './pages/booking/SelectMovie';
import SelectScreen from './pages/booking/SelectScreen';
import SelectSeats from './pages/booking/SelectSeats';
import Navbar from './components/Navbar';

// Import Roboto font
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#f48fb1',
      light: '#f8bbd0',
      dark: '#ec407a',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Navbar />
              <Box component="main" sx={{ flex: 1, p: 2 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<AnimatedPage><Movies /></AnimatedPage>} />
                  <Route path="/movies" element={<AnimatedPage><Movies /></AnimatedPage>} />
                  <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
                  <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
                  <Route path="/admin/login" element={<AnimatedPage><Login /></AnimatedPage>} />
                  
                  {/* Booking Flow - Allow both authenticated and guest users */}
                  <Route path="/booking" element={<AnimatedPage><Booking /></AnimatedPage>}>
                    <Route index element={<SelectMovie />} />
                    <Route path=":movieId" element={<SelectScreen />} />
                    <Route path=":movieId/screen/:screenId" element={<SelectSeats />} />
                  </Route>
                  <Route path="/payment" element={<AnimatedPage><Payment /></AnimatedPage>} />
                  <Route path="/ticket/:bookingId" element={<AnimatedPage><Ticket /></AnimatedPage>} />

                  {/* Admin Routes - Protected for admin users only */}
                  <Route path="/admin" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AnimatedPage>
                        <AdminDashboard />
                      </AnimatedPage>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/movies" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AnimatedPage>
                        <ManageMovies />
                      </AnimatedPage>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/halls" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AnimatedPage>
                        <ManageHalls />
                      </AnimatedPage>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/screens" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AnimatedPage>
                        <ManageScreens />
                      </AnimatedPage>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/showtimes" element={
                    <ProtectedRoute requireAdmin={true}>
                      <AnimatedPage>
                        <ManageShowtimes />
                      </AnimatedPage>
                    </ProtectedRoute>
                  } />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
