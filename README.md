# 🍽️ Immersive 3D Menu Platform

> A full-stack mobile-first platform that enables restaurants to capture food items using only a mobile phone camera and allows customers to view those items in **360°, AR, or mobile VR** by scanning a QR code.

![Platform Banner](https://via.placeholder.com/1200x400/1a1a2e/ffffff?text=Immersive+3D+Menu+Platform)

## ✨ Features

### For Restaurants (Admin)
- 📸 Capture dishes using mobile camera (30-60 images for 3D reconstruction)
- 🍽️ Manage menu items, categories, and prices
- 📊 Track analytics (views, AR interactions)
- 🏷️ Generate QR codes for each table
- 🎨 Customize restaurant branding

### For Customers (Mobile Web)
- 🔍 Browse menu by scanning QR code
- 🔄 View dishes in 360° rotation
- 📱 AR mode - Place dishes on your table using camera
- 🥽 VR mode - Gyro-based immersive viewing
- 🔎 Search and filter dishes (veg, category, etc.)
- 📵 No app installation required (PWA)

## 🏗️ Project Structure

```
immersive-3d-menu/
├── backend/              # Node.js/Express REST API
│   ├── src/
│   │   ├── config/       # Database & upload config
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Helpers
│   │   ├── seed.js       # Database seeding
│   │   └── server.js     # Entry point
│   └── uploads/          # Uploaded files
│
├── customer-web/         # Next.js PWA for customers
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API client, utilities
│   │   ├── types/        # TypeScript types
│   │   └── hooks/        # Custom hooks
│   └── public/           # Static assets
│
├── admin-app/            # React Native mobile app (future)
│
└── shared/               # Shared utilities (future)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- npm or yarn

### 1️⃣ Clone & Install

```bash
# Navigate to project directory
cd immersive-3d-menu

# Install backend dependencies
cd backend
npm install

# Install customer web dependencies
cd ../customer-web
npm install
```

### 2️⃣ Configure Environment

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/immersive-menu
JWT_SECRET=your-super-secret-key-here
FRONTEND_URL=http://localhost:3000
```

**Customer Web** (`customer-web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3️⃣ Seed Database (Demo Data)

```bash
cd backend
npm run seed
```

This creates:
- Demo user account: `demo@restaurant.com` / `demo123456`
- Demo restaurant with menu items
- Tables with QR codes

### 4️⃣ Start Development Servers

In separate terminals:

```bash
# Terminal 1: Backend API (port 5000)
cd backend
npm run dev

# Terminal 2: Customer Web (port 3000)
cd customer-web
npm run dev
```

### 5️⃣ Access the Application

- **Customer Menu**: http://localhost:3000
- **API Health Check**: http://localhost:5000/api/health
- **Demo Menu**: http://localhost:3000/menu/{restaurant-id}

## 📱 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express, MongoDB, Mongoose |
| **Customer Web** | Next.js 14, TypeScript, Tailwind CSS |
| **3D/AR** | `<model-viewer>`, WebXR, WebAR |
| **Auth** | JWT, bcrypt |
| **File Upload** | Multer |
| **QR Codes** | qrcode library |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Restaurants (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants/:id` | Get restaurant |
| GET | `/api/restaurants/:id/menu` | Get full menu |

### Dishes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dishes/:id` | Get dish details |
| POST | `/api/dishes/:id/ar-view` | Track AR view |
| POST | `/api/dishes/:id/images` | Upload images (protected) |
| POST | `/api/dishes/:id/model` | Upload 3D model (protected) |

## 🎨 Key Components

### ModelViewer
The heart of the 3D experience - uses Google's `<model-viewer>` for:
- 360° rotation with touch/mouse controls
- AR mode with WebXR
- Auto-rotation
- Zoom controls

### DishCard
Beautiful menu item cards with:
- 3D badge indicator
- Veg/Non-veg markers
- Spice level indicators
- Featured/Popular badges
- Hover animations

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Helmet security headers
- Rate limiting (recommended for production)
- Input validation with express-validator

## 📊 Performance Optimizations

- Lazy loading of 3D models
- Image optimization
- CDN-ready static assets
- Compression middleware
- PWA with offline support

## 🛣️ Roadmap

### MVP (Current)
- [x] Backend API with auth
- [x] Menu management
- [x] QR code generation
- [x] Customer PWA with 360° viewer
- [x] AR mode support
- [ ] 3D model processing pipeline

### Phase 2
- [ ] Admin mobile app (React Native)
- [ ] AI-based 3D model generation
- [ ] Multi-language support
- [ ] Analytics dashboard

### Phase 3
- [ ] Ordering integration
- [ ] Payment processing
- [ ] Delivery integration
- [ ] Voice-based dish explanation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Made with ❤️ for the future of dining
</p>
