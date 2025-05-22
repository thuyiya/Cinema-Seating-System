import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Movies.css';
import type { Movie } from '../types/movie';

const NoResults = () => (
  <div className="no-results">
    <svg 
      className="no-results-icon" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9 9l6 6" />
      <path d="M15 9l-6 6" />
    </svg>
    <p>No movies found</p>
    <p className="no-results-subtitle">Try adjusting your search</p>
  </div>
);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const Movies = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState<{
    nowShowing: Movie[];
    comingSoon: Movie[];
  }>({ nowShowing: [], comingSoon: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/movies`);
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

  const filteredMovies = {
    nowShowing: movies.nowShowing.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    comingSoon: movies.comingSoon.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  };

  if (loading) {
    return (
      <div className="loading-container">
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
        <div className="error">Error: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <main className="main-content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <section className="movie-section">
          <h2 className="section-title">Now Showing</h2>
          <div className="horizontal-scroll">
            <div className="movie-row">
              {filteredMovies.nowShowing.length > 0 ? (
                filteredMovies.nowShowing.map(movie => (
                  <div
                    key={movie._id}
                    onClick={() => navigate(`/booking/${movie._id}`)}
                    className="movie-card"
                  >
                    <img 
                      src={movie.posterPath} 
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
                ))
              ) : (
                <NoResults />
              )}
            </div>
          </div>
        </section>

        <section className="movie-section">
          <h2 className="section-title">Coming Soon</h2>
          <div className="horizontal-scroll">
            <div className="movie-row">
              {filteredMovies.comingSoon.length > 0 ? (
                filteredMovies.comingSoon.map(movie => (
                  <div
                    key={movie._id}
                    className="movie-card coming-soon"
                  >
                    <img 
                      src={movie.posterPath} 
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
                ))
              ) : (
                <NoResults />
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
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