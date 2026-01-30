# Immersive 3D Menu - Backend API

## Overview
Backend API server for the Immersive 3D Menu Platform. This API handles:
- User authentication (JWT-based with OTP support)
- Restaurant management
- Dish management with 3D model and image uploads
- Category management
- Table management with QR code generation

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer
- **Security**: Helmet, CORS, rate limiting

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas connection)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your MongoDB connection string

# Start development server
npm run dev
```

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/immersive-menu |
| JWT_SECRET | Secret for JWT signing | (required) |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/password | Change password |

### Restaurants
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/restaurants | Create restaurant |
| GET | /api/restaurants/me | Get my restaurant |
| GET | /api/restaurants/:id | Get restaurant by ID (public) |
| GET | /api/restaurants/:id/menu | Get restaurant menu (public) |
| PUT | /api/restaurants/:id | Update restaurant |
| DELETE | /api/restaurants/:id | Delete restaurant |

### Dishes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/dishes | Create dish |
| GET | /api/dishes | Get all dishes |
| GET | /api/dishes/:id | Get dish by ID (public) |
| PUT | /api/dishes/:id | Update dish |
| DELETE | /api/dishes/:id | Delete dish |
| POST | /api/dishes/:id/images | Upload dish images |
| POST | /api/dishes/:id/model | Upload 3D model |
| POST | /api/dishes/:id/ar-view | Track AR view (public) |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/categories | Create category |
| GET | /api/categories | Get all categories |
| GET | /api/categories/:id | Get category by ID |
| PUT | /api/categories/:id | Update category |
| DELETE | /api/categories/:id | Delete category |
| PUT | /api/categories/reorder | Reorder categories |

### Tables
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/tables | Create table |
| POST | /api/tables/bulk | Bulk create tables |
| GET | /api/tables | Get all tables |
| GET | /api/tables/:id | Get table by ID |
| PUT | /api/tables/:id | Update table |
| DELETE | /api/tables/:id | Delete table |
| POST | /api/tables/:id/regenerate-qr | Regenerate QR code |

## Project Structure
```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── server.js       # Entry point
├── uploads/            # Uploaded files
├── .env                # Environment variables
└── package.json
```

## License
ISC
