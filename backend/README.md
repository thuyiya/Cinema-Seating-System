# Cinema Booking System Backend

A Node.js backend service for the Cinema Booking System using Express and TMDB API.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- TMDB API Key (Get it from [TMDB](https://www.themoviedb.org/settings/api))

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Environment Setup
Create a `.env` file in the root directory with:
```
TMDB_API_KEY=your_tmdb_api_key_here
PORT=3001
```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build the TypeScript project

## API Endpoints

### Health Check
- `GET /api/health`
  - Returns server status and timestamp

### Movies (TMDB)
- `GET /api/tmdb`
  - Returns now showing and coming soon movies
  - Data is fetched from TMDB API

## Tech Stack

- TypeScript
- Express.js
- Axios (for API calls)
- Morgan (for request logging)
- CORS
- dotenv (for environment variables)

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── routes/         # API routes
└── server.ts       # Main application file
```