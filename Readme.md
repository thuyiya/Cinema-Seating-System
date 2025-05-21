
# Cinema Seating System - Setup Documentation

## Prerequisites

Before setting up the project, ensure you have the following installed on your system:

- Node.js (v16 or higher)
- npm (comes with Node.js)
- Docker
- Docker Compose
- PostgreSQL client (optional, for direct database access)

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd cinema-seating-system/backend
```

### 2. Install Dependencies

Navigate to `backend` and `web` folders seperately

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinemax
DB_USER=cinemax_user
DB_PASSWORD=cinemax_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# TMDB API (for movie data)
TMDB_API_KEY=your_tmdb_api_key
```

### 4. Database Setup

Start the PostgreSQL database using Docker:

```bash
npm run db:start
```

This will start a PostgreSQL container with the following defaults:

- Port: 5432
- Database: cinemax
- User: cinemax_user
- Password: cinemax_password

### 5. Database Migrations

Run database migrations to create the necessary tables:

```bash
npm run migrate:up
```

### 6. Seed Initial Data

Populate the database with initial movie data from TMDB:

```bash
npm run seed
```

### 7. Running the Application

#### Development Mode

```bash
npm run dev
```

This will start the server with nodemon for automatic reloading.

#### Production Build

```bash
npm run build
npm start
```

## Available Scripts

- `npm start`: Runs the production server
- `npm run build`: Compiles TypeScript to JavaScript
- `npm run dev`: Runs the development server with hot-reloading
- `npm run db:start`: Starts the PostgreSQL database container
- `npm run db:stop`: Stops the database container
- `npm run db:logs`: Shows database logs
- `npm run db:reset`: Restarts the database container
- `npm run migrate:up`: Runs all pending migrations
- `npm run migrate:down`: Rolls back all migrations
- `npm run migrate:create`: Creates a new migration file
- `npm run seed`: Seeds the database with initial data

## Project Structure

```
backend/
├── src/
│   ├── controllers/        # Route controllers
│   ├── db/                 # Database configuration and migrations
│   ├── middlewares/        # Express middlewares
│   ├── models/             # Sequelize models
│   ├── routes/             # Express routes
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── server.ts           # Main server file
│   └── types/              # TypeScript type definitions
├── .env                    # Environment variables
├── docker-compose.db.yml   # Database docker configuration
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## API Documentation

The API documentation is available via Swagger UI when the server is running:

- Development: http://localhost:3001/api-docs
- Production: http://<DOMAIN>.com/api-docs

## Troubleshooting

### Database Connection Issues

- Verify Docker is running:

```bash
docker ps
```

- Check database logs:

```bash
npm run db:logs
```

- Reset the database container:

```bash
npm run db:reset
```

### Migration Issues

If migrations fail, you can roll them back:

```bash
npm run migrate:down
```

Then run them again:

```bash
npm run migrate:up
```

### Seed Issues

If seeding fails with UUID errors:

Ensure the `uuid-ossp` extension is installed in PostgreSQL:

```bash
docker exec -it cinemax-db psql -U cinemax_user -d cinemax -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
```

Reset and reseed:

```bash
npm run migrate:down
npm run migrate:up
npm run seed
```

## Deployment

For production deployment:

- Build the application:

```bash
npm run build
```

- Start the server:

```bash
npm start
```

- Consider using a process manager like PM2 for production:

```bash
npm install -g pm2
pm2 start dist/server.js
```

## Environment Variables Reference

| Variable        | Description                         | Default             |
|-----------------|-------------------------------------|---------------------|
| DB_HOST         | Database host                       | localhost           |
| DB_PORT         | Database port                       | 5432                |
| DB_NAME         | Database name                       | cinemax             |
| DB_USER         | Database user                       | cinemax_user        |
| DB_PASSWORD     | Database password                   | cinemax_password    |
| JWT_SECRET      | Secret key for JWT tokens           | (required)          |
| JWT_EXPIRES_IN  | JWT token expiration time           | 1d                  |
| TMDB_API_KEY    | The Movie Database API key          | (required for seeding) |
| PORT            | Application port                    | 3001                |
| NODE_ENV        | Node environment                    | development         |


### For check your running docker
`docker ps | grep postgres`