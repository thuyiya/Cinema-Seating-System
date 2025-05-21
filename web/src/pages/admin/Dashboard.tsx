import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
} from '@mui/material';
import TheatersIcon from '@mui/icons-material/Theaters';
import ScreenshotMonitorIcon from '@mui/icons-material/ScreenshotMonitor';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MovieIcon from '@mui/icons-material/Movie';

const adminFeatures = [
  {
    title: 'Manage Movies',
    description: 'Add or remove movies from TMDB',
    icon: MovieIcon,
    path: '/admin/movies',
  },
  {
    title: 'Manage Halls',
    description: 'Add, edit, or remove cinema halls',
    icon: TheatersIcon,
    path: '/admin/halls',
  },
  {
    title: 'Manage Screens',
    description: 'Configure screens and seating layouts',
    icon: ScreenshotMonitorIcon,
    path: '/admin/screens',
  },
  {
    title: 'Manage Showtimes',
    description: 'Schedule movie screenings and showtimes',
    icon: AccessTimeIcon,
    path: '/admin/showtimes',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        {adminFeatures.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <Card>
              <CardActionArea onClick={() => navigate(feature.path)}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: 'primary.main',
                        borderRadius: '50%',
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <feature.icon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 