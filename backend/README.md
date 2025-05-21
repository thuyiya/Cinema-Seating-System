# Cinema Booking System - Backend

A Node.js backend service for a cinema booking system with role-based authentication.

## Prerequisites

- Node.js (v16 or higher)
- Docker and Docker Compose
- npm or yarn

## Tech Stack

- TypeScript
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Docker

## Project Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd cinema-booking-system/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
DB_USER=cinemax_user
DB_PASSWORD=cinemax_password
DB_NAME=cinemax
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your-secret-key-here
ADMIN_SECRET_KEY=your-admin-secret-key-here
```

## Database Setup

1. Start the PostgreSQL database container:
```bash
npm run db:start
```

2. Run database migrations:
```bash
npm run migrate
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- POST `/auth/register` - Register a new user
- POST `/auth/login` - Login user
- POST `/auth/admin/register` - Register admin (requires admin secret key)

### Movies (Protected Routes)
- GET `/movies` - Get all movies
- GET `/movies/:id` - Get movie by ID
- POST `/movies` - Create movie (Admin only)
- PUT `/movies/:id` - Update movie (Admin only)
- DELETE `/movies/:id` - Delete movie (Admin only)

### Screenings (Protected Routes)
- GET `/screenings` - Get all screenings
- GET `/screenings/:id` - Get screening by ID
- POST `/screenings` - Create screening (Admin only)
- PUT `/screenings/:id` - Update screening (Admin only)
- DELETE `/screenings/:id` - Delete screening (Admin only)

## Development Guide

### Database Migrations

1. Create a new migration:
```bash
npm run migrate:create -- --name your-migration-name
```

2. The migration file will be created in `src/db/migrations`. Edit it following this template:
```typescript
import type { Migration } from '../types/migration';
import { DataTypes } from 'sequelize';

const migration: Migration = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('YourTable', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // Add your columns here
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  async down({ context: queryInterface }) {
    await queryInterface.dropTable('YourTable');
  }
};

export default migration;
```

3. Run the migration:
```bash
npm run migrate
```

### Adding a New Model

1. Create a new model file in `src/models`:
```typescript
import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../db/config';

// Define attributes interface
export interface YourModelAttributes {
  id: string;
  // Add your attributes here
  createdAt: Date;
  updatedAt: Date;
}

// Define creation attributes interface
interface YourModelCreationAttributes extends Optional<YourModelAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Define the model class
class YourModel extends Model<YourModelAttributes, YourModelCreationAttributes> implements YourModelAttributes {
  public id!: string;
  // Implement your attributes here
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
YourModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Initialize your attributes here
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'YourModel',
  }
);

export { YourModel };
```

2. Add the model to `src/models/index.ts`:
```typescript
import { YourModel } from './YourModel';

export function initializeModels(sequelize: Sequelize) {
  return {
    // ... existing models
    YourModel,
  };
}

export { /* ... existing models */, YourModel };
```

### Database Management Commands

- Start database: `npm run db:start`
- Stop database: `npm run db:stop`
- Reset database: `npm run db:reset`
- View database logs: `npm run db:logs`
- Run migrations: `npm run migrate`
- Create migration: `npm run migrate:create -- --name your-migration-name`

## Testing

```bash
npm test
```

## Troubleshooting

1. If the database connection fails:
   - Check if Docker is running
   - Ensure the database container is up (`npm run db:logs`)
   - Verify `.env` configuration matches Docker settings

2. If migrations fail:
   - Check database logs (`npm run db:logs`)
   - Reset the database (`npm run db:reset`)
   - Run migrations again (`npm run migrate`)

## License

UWL