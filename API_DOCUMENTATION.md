# Hauzzo API Documentation

## Base URL
```
http://localhost:8080
```

## Authentication
Most endpoints require JWT token authentication. Include the access token in the `Authorization` header:
```
Authorization: Bearer <access_token>
```

### Token Management
- **Access tokens** expire after 15 minutes for security
- **Refresh tokens** expire after 7 days
- Use the `/auth/refresh` endpoint to get new tokens before access token expires
- Store refresh tokens securely (they're stored in database for revocation)
- Access tokens contain user info and expire quickly
- Refresh tokens are used only for token renewal

### Handling Token Expiration
When you receive a `401` error with `"expired": true` in the error response:
1. Call `/auth/refresh` with your refresh token
2. Update your stored access token
3. Retry the original request with the new access token
4. If refresh fails, redirect user to login

## Standard Response Format

### Success Response
```json
{
  "status": "Success",
  "message": "Request description",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "status": "Error",
  "message": "Error description",
  "error": { /* error details */ }
}
```

## Data Models

### Property
```typescript
{
  id: string
  title: string
  description: string
  price: number
  tags: string[]
  bedrooms: number
  bathrooms: number
  parking: number
  location: {
    zip: string
    city: string
    state: string
    street: string
    address: string
    neighborhood: string
    addressNumber: string
  }
  type: 'house' | 'apartment'
  transaction: 'rent' | 'sale'
  images: string[]
  active: boolean
  broker_id: string
}
```

### Broker
```typescript
{
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string (hashed)
  role: 'broker'
}
```

### User
```typescript
{
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string (hashed)
  role: 'user'
}
```

---

## Authentication Endpoints

### POST /auth/broker/signup
Create a new broker account and automatically log in.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string (optional)",
  "password": "string"
}
```

**Password Requirements:**
- At least 8 characters
- One uppercase letter
- One lowercase letter
- One number
- One special character

**Response (201):**
```json
{
  "status": "Success",
  "message": "Broker created and logged in successfully",
  "data": {
    "broker": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "123-456-7890",
      "role": "broker"
    },
    "accessToken": "jwt_access_token_string",
    "refreshToken": "jwt_refresh_token_string"
  }
}
```

**Error Responses:**
- `400`: Missing required fields, invalid email format, weak password, or broker already exists

### POST /auth/broker/login
Login a broker and get JWT tokens.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "status": "Success",
  "message": "Login successful",
  "data": {
    "broker": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "role": "broker"
    },
    "accessToken": "jwt_access_token_string",
    "refreshToken": "jwt_refresh_token_string"
  }
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials

### POST /auth/refresh
Refresh expired access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token_string"
}
```

**Response (200):**
```json
{
  "status": "Success",
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "new_jwt_access_token_string",
    "refreshToken": "new_jwt_refresh_token_string"
  }
}
```

**Error Responses:**
- `400`: Missing refresh token
- `401`: Invalid or expired refresh token
- `404`: Broker not found

### POST /auth/logout
Logout and revoke refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token_string"
}
```

**Response (200):**
```json
{
  "status": "Success",
  "message": "Logged out successfully",
  "data": {}
}
```

**Error Responses:**
- `400`: Missing refresh token
- `500`: Logout failed

### POST /auth/logout-all
Logout from all devices (requires authentication).

**Authentication:** Required (JWT access token)

**Response (200):**
```json
{
  "status": "Success",
  "message": "Logged out from all devices successfully",
  "data": {}
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Logout failed

---

## Properties Endpoints

### GET /properties/all
Get all properties with optional limit.

**Query Parameters:**
- `limit` (optional): number - Maximum number of properties to return

**Example:** `GET /properties/all?limit=10`

**Response (200):**
```json
{
  "status": "Success",
  "message": "Properties found",
  "data": [
    {
      "id": "uuid",
      "title": "Beautiful House",
      "description": "A lovely family home",
      "price": 350000,
      "tags": ["pool", "garden", "garage"],
      "bedrooms": 3,
      "bathrooms": 2,
      "parking": 2,
      "location": {
        "zip": "12345",
        "city": "Miami",
        "state": "FL",
        "street": "Main St",
        "address": "123 Main St",
        "neighborhood": "Downtown",
        "addressNumber": "123"
      },
      "type": "house",
      "transaction": "sale",
      "images": ["url1", "url2"],
      "active": true,
      "broker_id": "uuid"
    }
  ]
}
```

### GET /properties/:id
Get a specific property by ID.

**Path Parameters:**
- `id`: string - Property UUID

**Response (200):**
```json
{
  "status": "Success",
  "message": "Property found",
  "data": {
    "id": "uuid",
    "title": "Beautiful House",
    // ... full property object
  }
}
```

**Error Responses:**
- `404`: Property not found
- `400`: Invalid property ID

### POST /properties/create
Create a new property with optional images.

**Authentication:** Required (JWT token)
**Content-Type:** `multipart/form-data`

**Form Data:**
```
title: string
description: string
price: number
tags: string[] (JSON array)
bedrooms: number
bathrooms: number
parking: number
location: object (JSON object with zip, city, state, street, address, neighborhood, addressNumber)
type: 'house' | 'apartment'
transaction: 'rent' | 'sale'
images: File[] (optional, max 10 images, max 5MB each)
```

**Example Request:**
```bash
curl -X POST http://localhost:8080/properties/create \
  -H "Authorization: Bearer <jwt_token>" \
  -F "title=Beautiful House" \
  -F "description=A lovely family home" \
  -F "price=350000" \
  -F "tags=[\"pool\",\"garden\",\"garage\"]" \
  -F "bedrooms=3" \
  -F "bathrooms=2" \
  -F "parking=2" \
  -F "location={\"zip\":\"12345\",\"city\":\"Miami\",\"state\":\"FL\",\"street\":\"Main St\",\"address\":\"123 Main St\",\"neighborhood\":\"Downtown\",\"addressNumber\":\"123\"}" \
  -F "type=house" \
  -F "transaction=sale" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

**Response (201):**
```json
{
  "status": "Success",
  "message": "Property created",
  "data": {
    "id": "uuid",
    "title": "Beautiful House",
    "images": ["optimized_image_url1", "optimized_image_url2"],
    // ... full property object
  }
}
```

**Error Responses:**
- `400`: Missing required fields, invalid data, or image upload failed
- `401`: Unauthorized (invalid or missing token)

### PUT /properties/edit/:id
Update an existing property.

**Authentication:** Required (JWT token)
**Path Parameters:**
- `id`: string - Property UUID

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "price": "number (optional)",
  "tags": "string[] (optional)",
  "location": "object (optional)"
}
```

**Response (200):**
```json
{
  "status": "Success",
  "message": "Property edited",
  "data": {
    // ... updated property object
  }
}
```

**Error Responses:**
- `400`: Invalid property ID or update data
- `401`: Unauthorized
- `404`: Property not found

---

## Brokers Endpoints

### POST /brokers/new
Create a new broker account.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string (optional)",
  "password": "string"
}
```

**Password Requirements:**
- At least 8 characters
- One uppercase letter
- One lowercase letter
- One number
- One special character

**Response (201):**
```json
{
  "status": "Success",
  "message": "Broker created",
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "role": "broker"
  }
}
```

**Error Responses:**
- `400`: Missing required fields, invalid email format, weak password, or broker already exists

### GET /brokers/:id
Get broker by ID.

**Path Parameters:**
- `id`: string - Broker UUID

**Response (200):**
```json
{
  "status": "Success",
  "message": "Broker found",
  "data": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "role": "broker"
  }
}
```

**Error Responses:**
- `400`: Invalid broker ID
- `404`: Broker not found

### GET /brokers/email/:email
Get broker by email address.

**Path Parameters:**
- `email`: string - Broker email address

**Response (200):**
```json
{
  "status": "Success",
  "message": "Broker found",
  "data": {
    // ... broker object
  }
}
```

**Error Responses:**
- `400`: Invalid email
- `404`: Broker not found

### PUT /brokers/edit/:id
Update broker information.

**Path Parameters:**
- `id`: string - Broker UUID

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "password": "string (optional)"
}
```

**Response (200):**
```json
{
  "status": "Success",
  "message": "Broker updated",
  "data": {
    // ... updated broker object
  }
}
```

**Error Responses:**
- `400`: Invalid broker ID, empty body, or invalid data format
- `404`: Broker not found

---

## Users Endpoints

### GET /users/:id
Get user by ID.

**Path Parameters:**
- `id`: string - User UUID

**Response (200):**
```json
{
  "status": "Success",
  "message": "User found",
  "data": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "123-456-7890",
    "role": "user"
  }
}
```

**Error Responses:**
- `400`: Invalid user ID
- `404`: User not found

---

## Search Endpoints

### POST /search/tags
Search properties by tags.

**Request Body:**
```json
{
  "query": ["pool", "garden", "garage"]
}
```

**Response (200):**
```json
{
  "status": "Success",
  "message": "Search results",
  "data": [
    {
      // ... property objects matching the tags
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid query format
- `404`: No results found
- `500`: Database query failed

### POST /search/description
Search properties by description text.

**Request Body:**
```json
{
  "query": "beautiful house with pool"
}
```

**Response (200):**
```json
{
  "status": "Success",
  "message": "Search results",
  "data": [
    {
      // ... property objects matching the description
    }
  ]
}
```

**Error Responses:**
- `400`: Invalid query format
- `404`: No results found
- `500`: Database query failed

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request - Invalid input data |
| 401  | Unauthorized - Invalid or missing token |
| 404  | Not Found - Resource doesn't exist |
| 500  | Internal Server Error - Database or server error |

## Image Upload Details

### Supported Formats
- JPEG, PNG, WebP
- Maximum file size: 5MB per image
- Maximum images per property: 10

### Image Processing
Images are automatically optimized:
- Resized to 1200px width (height auto-adjusts)
- Converted to WebP format
- 80% quality compression
- 16:9 aspect ratio maintained
- Hosted on ImageKit CDN

### Example Image URL
```
https://ik.imagekit.io/your-endpoint/properties/image-name.webp?tr=w-1200,f-webp,q-80,ar-16-9,c-at_max
``` 