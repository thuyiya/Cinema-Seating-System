# Cinema Backend System

## Setup Instructions

### Prerequisites
- Node.js 18+
- Docker
- PostgreSQL client (optional)

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install

Create .env file:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=cinemax_user
DB_PASSWORD=cinemax_password
DB_NAME=cinemax
PORT=3001
JWT_SECRET=your_jwt_secret
```

Database Setup

Start DB
`npm run db:start`

IF something wrong run
# Rollback all migrations
`npm run migrate:down`

# Run migrations fresh
`npm run migrate:up`

# Now run the seed
`npm run seed`
