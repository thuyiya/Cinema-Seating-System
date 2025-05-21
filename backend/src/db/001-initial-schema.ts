import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('Users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: 'customer',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Movies table
  await queryInterface.createTable('Movies', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    duration: {
      type: DataTypes.INTEGER,
      comment: 'Duration in minutes',
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
    },
    posterUrl: {
      type: DataTypes.STRING(255),
    },
    genres: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Screenings table
  await queryInterface.createTable('Screenings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    movieId: {
      type: DataTypes.UUID,
      references: { model: 'Movies', key: 'id' },
    },
    screenNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endsAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Seats table
  await queryInterface.createTable('Seats', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    screeningId: {
      type: DataTypes.UUID,
      references: { model: 'Screenings', key: 'id' },
    },
    row: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'available',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Bookings table
  await queryInterface.createTable('Bookings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: { model: 'Users', key: 'id' },
    },
    screeningId: {
      type: DataTypes.UUID,
      references: { model: 'Screenings', key: 'id' },
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // BookingSeats table
  await queryInterface.createTable('BookingSeats', {
    bookingId: {
      type: DataTypes.UUID,
      references: { model: 'Bookings', key: 'id' },
      primaryKey: true,
    },
    seatId: {
      type: DataTypes.UUID,
      references: { model: 'Seats', key: 'id' },
      primaryKey: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Payments table
  await queryInterface.createTable('Payments', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.UUID,
      references: { model: 'Bookings', key: 'id' },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
    },
    method: {
      type: DataTypes.STRING(50),
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: 'pending',
    },
    transactionId: {
      type: DataTypes.STRING(255),
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('Payments');
  await queryInterface.dropTable('BookingSeats');
  await queryInterface.dropTable('Bookings');
  await queryInterface.dropTable('Seats');
  await queryInterface.dropTable('Screenings');
  await queryInterface.dropTable('Movies');
  await queryInterface.dropTable('Users');
}