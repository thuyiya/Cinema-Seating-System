import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { AnimatedPage } from './utils/AnimatedPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AdminDashboard from './pages/admin/Dashboard';
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
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <CssBaseline />
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Movies />} />
                  <Route path="/auth/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/auth/register" element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } />
                  <Route path="/admin/login" element={
                    <PublicRoute redirectTo="/admin">
                      <Login />
                    </PublicRoute>
                  } />

                  {/* Booking Routes - No login required */}
                  <Route path="/booking" element={
                    <AnimatedPage>
                      <SelectMovie />
                    </AnimatedPage>
                  } />
                  <Route path="/booking/:movieId" element={
                    <AnimatedPage>
                      <SelectScreen />
                    </AnimatedPage>
                  } />
                  <Route path="/booking/:movieId/:screeningId" element={
                    <AnimatedPage>
                      <SelectSeats />
                    </AnimatedPage>
                  } />
                  <Route path="/payment/:bookingId" element={
                    <AnimatedPage>
                      <Payment />
                    </AnimatedPage>
                  } />
                  <Route path="/ticket/:bookingId" element={
                    <AnimatedPage>
                      <Ticket />
                    </AnimatedPage>
                  } />

                  {/* Admin Routes */}
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
