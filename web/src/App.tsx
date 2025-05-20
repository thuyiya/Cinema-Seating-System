import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Movies from './pages/Movies';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Ticket from './pages/Ticket';
import NotFound from './pages/NotFound';
import './App.css'
import { AuthWrapper } from './routes/AuthWrapper';
import { AnimatedPage } from './utils/AnimatedPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AnimatedPage>
      <Movies />
    </AnimatedPage>,
    errorElement: <NotFound />
  },
  {
    path: "/booking/:movieId",
    element: <Booking />,
  },
  {
    path: "/ticket/:bookingId",
    element: <Ticket />,
  },
  {
    path: "/payment",
    element: <AuthWrapper>
      <Payment />
    </AuthWrapper>,
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
