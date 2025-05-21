#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "PostgreSQL started"

# Run database migrations
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f /src/db/db-init.sql

# Start the application
node dist/server.js