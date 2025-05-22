import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token for non-payment endpoints
api.interceptors.request.use((config) => {
  // Skip authentication for payment endpoints
  if (config.url?.includes('/payments/') || config.url?.includes('/bookings/') && config.method === 'post') {
    return config;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Only handle unauthorized for non-payment endpoints
          if (!error.config.url?.includes('/payments/') && 
              !(error.config.url?.includes('/bookings/') && error.config.method === 'post')) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          break;
        case 410:
          // Handle expired booking
          if (error.response.data.code === 'BOOKING_EXPIRED') {
            throw new Error('Booking has expired');
          }
          break;
        default:
          throw new Error(error.response.data.message || 'An error occurred');
      }
    }
    return Promise.reject(error);
  }
);

export default api; 