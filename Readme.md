# Cinema Seating System

A modern cinema booking system with real-time movie data from TMDB API and MongoDB database.

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- MongoDB (local or MongoDB Atlas)

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cinema-seating-system
```

### 2. Install Dependencies

Navigate to `backend` and `web` folders separately and install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../web
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory with:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string
```

### 4. Running the Application

#### Backend Development Mode
```bash
cd backend
npm run dev
```

#### Frontend Development Mode
```bash
cd web
npm run dev
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── models/        # MongoDB models
│   │   └── server.ts      # Main server file
│   ├── .env              # Environment variables
│   └── package.json      # Backend dependencies
│
└── web/                  # Frontend application
```

## API Endpoints

### Movies
- `GET /api/health` - Health check endpoint
- `GET /api/tmdb` - Fetch movies from TMDB API

## Environment Variables Reference

| Variable        | Description           | Default     |
|----------------|-----------------------|-------------|
| PORT           | Server port           | 3001        |
| TMDB_API_KEY   | TMDB API key         | (required)  |
| MONGODB_URI    | MongoDB connection URL| (required)  |
| NODE_ENV       | Environment          | development |