import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
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
import SelectMovie from './pages/booking/SelectMovie';
import SelectScreen from './pages/booking/SelectScreen';
import SelectSeats from './pages/booking/SelectSeats';

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
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AnimatedPage><Movies /></AnimatedPage>} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/register" element={<Register />} />
            
            {/* Booking Flow */}
            <Route path="/booking" element={<SelectMovie />} />
            <Route path="/booking/:movieId" element={<SelectScreen />} />
            <Route path="/booking/:movieId/screen/:screenId" element={<SelectSeats />} />
            <Route path="/payment" element={<AuthWrapper><Payment /></AuthWrapper>} />
            <Route path="/ticket/:bookingId" element={<Ticket />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/halls" element={<ProtectedRoute><ManageHalls /></ProtectedRoute>} />
            <Route path="/admin/screens" element={<ProtectedRoute><ManageScreens /></ProtectedRoute>} />
            <Route path="/admin/showtimes" element={<ProtectedRoute><ManageShowtimes /></ProtectedRoute>} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
