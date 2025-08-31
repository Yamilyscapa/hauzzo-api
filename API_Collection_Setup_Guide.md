# Hauzzo API Collection Setup Guide

## 📋 What's Included

The `Hauzzo_API_Collection.json` file contains a complete Postman/Insomnia collection with:

- **🔐 Authentication** - Signup, Login, Token Refresh, Logout
- **🏢 Brokers** - Create, Read, Update broker accounts
- **🏠 Properties** - Create, Read, Update properties with image uploads
- **👥 Users** - User management endpoints
- **🔍 Search** - Advanced search with filters, tag search, description search

## 🚀 How to Import

### Postman

1. Open Postman
2. Click "Import" in the top left
3. Choose "Upload Files"
4. Select `Hauzzo_API_Collection.json`
5. Click "Import"

### Insomnia

1. Open Insomnia
2. Click "Create" → "Import From" → "File"
3. Select `Hauzzo_API_Collection.json`
4. Click "Scan"
5. Click "Import"

## ⚙️ Environment Setup

The collection uses these variables that you can customize:

| Variable       | Default Value           | Description                     |
| -------------- | ----------------------- | ------------------------------- |
| `baseUrl`      | `http://localhost:8080` | Your API server URL             |
| `accessToken`  | (empty)                 | JWT access token (auto-filled)  |
| `refreshToken` | (empty)                 | JWT refresh token (auto-filled) |
| `brokerId`     | (empty)                 | Broker UUID for testing         |
| `propertyId`   | (empty)                 | Property UUID for testing       |
| `userId`       | (empty)                 | User UUID for testing           |

### Setting Up Environment Variables

**In Postman:**

1. Click the gear icon (⚙️) in the top right
2. Click "Add" to create a new environment
3. Name it "Hauzzo API"
4. Add the variables listed above
5. Select the environment from the dropdown

**In Insomnia:**

1. Click "No Environment" dropdown → "Manage Environments"
2. Click the "+" to create a new environment
3. Name it "Hauzzo API"
4. Add the variables in JSON format:

```json
{
  "baseUrl": "http://localhost:8080",
  "accessToken": "",
  "refreshToken": "",
  "brokerId": "",
  "propertyId": "",
  "userId": ""
}
```

## 📝 Usage Workflow

### 1. Authentication Flow

1. **Start with "Broker Signup"** to create a new account
   - The response will contain `accessToken` and `refreshToken`
   - Copy these to your environment variables
2. **Or use "Broker Login"** if you have existing credentials
3. **Use "Refresh Token"** when your access token expires (every 15 minutes)

### 2. Testing Properties

1. **Login first** to get authentication tokens
2. **Create Property** - Use form-data for image uploads
3. **Get All Properties** - View all properties with optional limit
4. **Get Property by ID** - Use a specific property UUID
5. **Update Property** - Modify existing properties

### 3. Search Testing

1. **Advanced Search** - Use multiple filters and keywords
2. **Basic Search** - Simple keyword search
3. **Search by Tags** - Find properties with specific tags
4. **Search by Description** - Text-based description search

## 🔑 Authentication Notes

- **Access tokens** expire after 15 minutes
- **Refresh tokens** expire after 7 days
- The collection includes automatic token extraction (Postman only)
- For protected endpoints, ensure `accessToken` is set in your environment

## 📁 File Upload Testing

For property creation with images:

1. Use the "Create Property" request
2. In the form-data body, select files for the "images" field
3. You can upload up to 10 images (max 5MB each)
4. Supported formats: JPEG, PNG, WebP

## 🧪 Example Test Scenarios

### Complete Property Management Flow

1. Signup/Login → Get tokens
2. Create Property → Get property ID
3. Get All Properties → Verify creation
4. Update Property → Modify details
5. Search for Property → Test search functionality

### Search Testing Examples

- Search: `"cholula alberca"` with filters
- Search: `"casa centro"` basic search
- Tags: `["pool", "garden", "garage"]`
- Description: `"beautiful house with pool"`

## 🛠️ Customization

### Change Base URL

Update the `baseUrl` variable if your API runs on a different host/port:

- Local development: `http://localhost:8080`
- Staging: `https://api-staging.hauzzo.com`
- Production: `https://api.hauzzo.com`

### Add Custom Headers

You can add custom headers to any request:

- Click on the request
- Go to "Headers" tab
- Add key-value pairs as needed

## 📚 Additional Resources

- Full API documentation: `API_DOCUMENTATION.md`
- Error codes and responses are documented in each request
- All requests include detailed descriptions and examples

## 🐛 Troubleshooting

**Common Issues:**

- **401 Unauthorized**: Check that `accessToken` is set and valid
- **400 Bad Request**: Verify request body format and required fields
- **404 Not Found**: Check that UUIDs exist and are correct
- **Token Expired**: Use the "Refresh Token" endpoint

**Tips:**

- Always test authentication endpoints first
- Copy response tokens to environment variables
- Use the collection variables (`{{baseUrl}}`, `{{accessToken}}`, etc.)
- Check the "Console" tab for detailed request/response logs
