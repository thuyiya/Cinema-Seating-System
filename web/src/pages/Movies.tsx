import { useNavigate } from 'react-router-dom';

const Movies = () => {
  const navigate = useNavigate();
  const movies = [
    { id: 1, title: "Avengers", poster: "/avengers.jpg" },
    { id: 2, title: "Inception", poster: "/inception.jpg" }
  ];

  return (
    <div className="movie-grid">
      {movies.map(movie => (
        <div 
          key={movie.id}
          onClick={() => navigate(`/booking/${movie.id}`)}
          className="movie-card"
        >
          <img src={movie.poster} alt={movie.title} />
          <h3>{movie.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default Movies;