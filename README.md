# Hauzzo API - Real Estate Platform

A Node.js/TypeScript API for a real estate platform using **Screaming Architecture** - where the folder structure immediately reveals the business domains.

## 🏗️ Architecture

This codebase uses **Screaming Architecture** where business domains are the primary organizational structure:

```
src/
├── authentication/     # User & broker login/auth
├── properties/        # Property listings & management
├── brokers/          # Broker profiles & management
├── users/            # User profiles & management
├── search/           # Property search functionality
├── shared/           # Common utilities & middleware
├── database/         # Database connection & schema
└── routes/           # Main route configuration
```

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## 🔧 Environment Variables

Create a `.env` file with:
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
IMAGEKIT_API_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_API_KEY=your-imagekit-private-key
IMAGEKIT_ENDPOINT_URL=your-imagekit-endpoint
PORT=8080
```

## 📚 API Endpoints

### Authentication
- `POST /auth/broker/signup` - Broker registration and login
- `POST /auth/broker/login` - Broker login
- `POST /auth/refresh` - Refresh access tokens
- `POST /auth/logout` - Logout (revoke refresh token)
- `POST /auth/logout-all` - Logout from all devices

### Properties
- `GET /properties/all` - List all properties
- `GET /properties/:id` - Get property by ID
- `POST /properties/create` - Create new property (with images)
- `PUT /properties/edit/:id` - Update property

### Brokers
- `GET /brokers/:id` - Get broker by ID
- `GET /brokers/email/:email` - Get broker by email
- `POST /brokers/new` - Create new broker
- `PUT /brokers/edit/:id` - Update broker

### Users
- `GET /users/:id` - Get user by ID

### Search
- `POST /search/tags` - Search properties by tags
- `POST /search/description` - Search properties by description

## 🏢 Business Domains

### Authentication
Handles user and broker authentication, registration, and JWT token management with refresh token rotation.

### Properties
Core property management - creation, editing, image uploads, listing management.

### Brokers
Broker profile management and property association.

### Users
User profile management and saved properties.

### Search
Property search functionality with tag and description filtering.

### Shared
Common utilities, middleware, types, and helpers used across domains.

## 🗄️ Database

PostgreSQL database with tables:
- `brokers` - Broker profiles
- `users` - User profiles  
- `properties` - Property listings
- `user_saved_properties` - User saved properties

## 📱 Features

- **Image Upload**: ImageKit integration for property photos
- **Authentication**: JWT-based auth for brokers
- **Search**: Tag and description-based property search
- **File Upload**: Multer middleware for image handling
- **CORS**: Cross-origin resource sharing enabled
- **Validation**: Email and password validation
- **Error Handling**: Standardized error responses

---

*Built with Bun, TypeScript, Express, and PostgreSQL*
