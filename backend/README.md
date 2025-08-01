# Hospital Management System - Backend API

A comprehensive Node.js/Express backend API for the Hospital Management System.

## Features

- **Room Management**: CRUD operations for hospital rooms with status tracking
- **Reservation System**: Book rooms with conflict detection and availability checking
- **Stock Management**: Inventory tracking with low stock alerts and analytics
- **Maintenance Management**: Task scheduling and status tracking
- **Scenario Management**: Predefined medical scenarios and equipment requirements
- **User Management**: User roles and permissions
- **Dashboard Analytics**: Comprehensive statistics and reporting
- **Real-time Validation**: Input validation and error handling
- **Security**: Rate limiting, CORS, and security headers

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging
- **UUID** - Unique ID generation

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check API status

### Rooms
- `GET /api/rooms` - Get all rooms (with filters)
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room
- `PATCH /api/rooms/:id/status` - Update room status

### Reservations
- `GET /api/reservations` - Get all reservations (with filters)
- `GET /api/reservations/:id` - Get reservation by ID
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Delete reservation
- `PATCH /api/reservations/:id/status` - Update reservation status
- `GET /api/reservations/room/:roomId/availability` - Check room availability

### Stock Management
- `GET /api/stock` - Get all stock items (with filters)
- `GET /api/stock/:id` - Get stock item by ID
- `POST /api/stock` - Create new stock item
- `PUT /api/stock/:id` - Update stock item
- `DELETE /api/stock/:id` - Delete stock item
- `PATCH /api/stock/:id/restock` - Restock item
- `PATCH /api/stock/:id/use` - Use stock item
- `GET /api/stock/alerts/low-stock` - Get low stock alerts
- `GET /api/stock/analytics/summary` - Get stock analytics

### Maintenance
- `GET /api/maintenance` - Get all maintenance tasks (with filters)
- `GET /api/maintenance/:id` - Get maintenance task by ID
- `POST /api/maintenance` - Create new maintenance task
- `PUT /api/maintenance/:id` - Update maintenance task
- `DELETE /api/maintenance/:id` - Delete maintenance task
- `PATCH /api/maintenance/:id/status` - Update task status
- `GET /api/maintenance/overdue/tasks` - Get overdue tasks

### Scenarios
- `GET /api/scenarios` - Get all scenarios (with filters)
- `GET /api/scenarios/:id` - Get scenario by ID
- `POST /api/scenarios` - Create new scenario
- `PUT /api/scenarios/:id` - Update scenario
- `DELETE /api/scenarios/:id` - Delete scenario

### Users
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Dashboard
- `GET /api/dashboard/stats` - Get comprehensive statistics
- `GET /api/dashboard/rooms/status` - Get room status overview
- `GET /api/dashboard/reservations/timeline` - Get reservation timeline
- `GET /api/dashboard/maintenance/overview` - Get maintenance overview
- `GET /api/dashboard/stock/overview` - Get stock overview

## Query Parameters

### Common Filters
- `search` - Search by name/description
- `status` - Filter by status
- `type` - Filter by type
- `category` - Filter by category

### Room Filters
- `floor` - Filter by floor number
- `type` - Filter by room type (consultation, surgery, emergency, etc.)

### Reservation Filters
- `roomId` - Filter by room ID
- `userId` - Filter by user ID
- `date` - Filter by date

### Stock Filters
- `category` - Filter by category (medical, equipment, supplies, medication)

### Maintenance Filters
- `roomId` - Filter by room ID
- `priority` - Filter by priority (low, medium, high, critical)
- `assignedTo` - Filter by assigned person

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully",
  "total": 10
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message",
  "details": [...]
}
```

## Data Models

### Room
```json
{
  "id": "string",
  "name": "string",
  "type": "consultation|surgery|emergency|meeting|imaging",
  "capacity": "number",
  "equipment": ["string"],
  "status": "available|occupied|maintenance|reserved",
  "floor": "number",
  "lastMaintenance": "date",
  "nextMaintenance": "date"
}
```

### Reservation
```json
{
  "id": "string",
  "roomId": "string",
  "userId": "string",
  "userName": "string",
  "startTime": "datetime",
  "endTime": "datetime",
  "scenario": "string",
  "status": "confirmed|pending|cancelled|completed",
  "notes": "string"
}
```

### Stock Item
```json
{
  "id": "string",
  "name": "string",
  "category": "medical|equipment|supplies|medication",
  "currentStock": "number",
  "minStock": "number",
  "maxStock": "number",
  "unit": "string",
  "lastRestocked": "date",
  "roomIds": ["string"]
}
```

### Maintenance Task
```json
{
  "id": "string",
  "roomId": "string",
  "title": "string",
  "description": "string",
  "type": "preventive|corrective|emergency",
  "status": "scheduled|in-progress|completed|overdue",
  "scheduledDate": "date",
  "assignedTo": "string",
  "priority": "low|medium|high|critical"
}
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request** - Validation errors
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource conflicts (e.g., time conflicts for reservations)
- **500 Internal Server Error** - Server errors

## Security Features

- **Rate Limiting** - Prevents abuse with configurable limits
- **CORS** - Configurable cross-origin requests
- **Helmet** - Security headers
- **Input Validation** - Comprehensive validation for all inputs
- **Error Sanitization** - Safe error messages in production

## Development

### Running Tests
```bash
npm test
```

### Production Build
```bash
npm start
```

### Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `RATE_LIMIT_WINDOW_MS` - Rate limiting window
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window

## Integration with Frontend

The backend is designed to work seamlessly with the Next.js frontend. Update your frontend API calls to use the backend endpoints:

```javascript
// Example: Fetching rooms
const response = await fetch('http://localhost:5000/api/rooms');
const data = await response.json();
```

## Contributing

1. Follow the existing code structure
2. Add proper validation for new endpoints
3. Include error handling
4. Update documentation for new features
5. Test thoroughly before submitting

## License

MIT License 