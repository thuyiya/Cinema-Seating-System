import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Movies.css';

interface Movie {
  id: number;
  title: string;
  poster: string;
  releaseDate: string;
  rating: number;
  type: 'now_showing' | 'coming_soon';
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Movies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<{
    nowShowing: Movie[];
    comingSoon: Movie[];
  }>({ nowShowing: [], comingSoon: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/movies`);
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }
        const data = await response.json();
        setMovies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <NavBar />
        <div className="movie-row-skeleton">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="movie-card-skeleton">
              <div className="skeleton-poster" />
              <div className="skeleton-text" />
              <div className="skeleton-text-sm" />
            </div>
          ))}
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <NavBar />
        <div className="error">Error: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <NavBar />
      
      <main className="main-content">
        <section className="movie-section">
          <h2 className="section-title">Now Showing</h2>
          <div className="horizontal-scroll">
            <div className="movie-row">
              {movies.nowShowing.map(movie => (
                <div
                  key={movie.id}
                  onClick={() => navigate(`/booking/${movie.id}`)}
                  className="movie-card"
                >
                  <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
                    }}
                  />
                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <div className="rating-badge">{movie.rating.toFixed(1)}</div>
                    <p>{new Date(movie.releaseDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="movie-section">
          <h2 className="section-title">Coming Soon</h2>
          <div className="horizontal-scroll">
            <div className="movie-row">
              {movies.comingSoon.map(movie => (
                <div
                  key={movie.id}
                  className="movie-card coming-soon"
                >
                  <img 
                    src={movie.poster} 
                    alt={movie.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
                    }}
                  />
                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <div className="coming-soon-badge">Coming Soon</div>
                    <p>{new Date(movie.releaseDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const NavBar = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="logo" onClick={() => navigate('/')}>CineMax</h1>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>Home</button>
          <button onClick={() => navigate('/booking')}>Book Tickets</button>
          <button onClick={() => navigate('/about')}>About</button>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>CineMax</h3>
          <p>Your premium movie experience</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <a href="/booking">Book Tickets</a>
          <a href="/about">About</a>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>info@cinemax.com</p>
          <p>+1 (555) 123-4567</p>
        </div>
      </div>
      <div className="copyright">
        © {new Date().getFullYear()} CineMax. All rights reserved.
      </div>
    </footer>
  );
};

export default Movies;