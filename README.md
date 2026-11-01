# Smart Parking System

A Node.js + Express Smart Parking System with PostgreSQL, Socket.io, and Joi validation.

## Architecture

MVC + Service pattern:
- `src/controllers/`: Request handlers
- `src/routes/`: API route definitions
- `src/services/`: Business logic & database operations
- `src/models/`: Database schema definitions
- `src/middlewares/`: Validation & error handling
- `src/config/`: Database configuration
- `src/utils/`: Joi validation schemas

## API Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/slots` - Get parking slot availability
- `POST /api/v1/tickets/check-in` - Vehicle check-in
- `POST /api/v1/tickets/check-out` - Vehicle check-out with fee calculation
- `POST /api/v1/bookings` - 15-minute slot reservation

## Scripts

- `npm start`: Start the server from `app.js`
- `npm run dev`: Start the server from `app.js` with nodemon