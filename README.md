# Pastebin-Lite

A simple pastebin service built with Next.js, TypeScript, and MongoDB Atlas for persistence.

## Project Description

Pastebin-Lite allows users to:
- Create text pastes with optional TTL (time-to-live) and view limits
- Receive shareable URLs for their pastes
- View pastes via the shareable URL
- Automatically expire pastes when TTL expires or view limit is exceeded

## Features

- **Time-based expiry**: Pastes can be set to expire after a certain number of seconds
- **View limit**: Pastes can be limited to a maximum number of views
- **Serverless-ready**: Built for Vercel deployment with MongoDB Atlas
- **Test mode**: Supports deterministic testing via `TEST_MODE` environment variable

## Persistence Layer

This project uses **MongoDB Atlas** for persistence. MongoDB Atlas provides:
- Serverless-compatible storage
- Managed MongoDB database
- Automatic scaling
- No manual database migrations required
- Free tier available

The data model stores pastes in a `pastes` collection with the following schema:
- `id`: Unique identifier for the paste (string)
- `content`: The paste content (string)
- `created_at`: Timestamp when paste was created (number)
- `expires_at`: Timestamp when paste expires (number | null)
- `max_views`: Maximum number of views allowed (number | null)
- `views_used`: Current number of views (number)

## Local Run Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- MongoDB Atlas account (free tier available)

### Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MongoDB Atlas:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Create a database user (username and password)
   - Whitelist your IP address (or use `0.0.0.0/0` for development)
   - Get your connection string from "Connect" → "Connect your application"
   - The connection string format: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your MongoDB Atlas connection string:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
     MONGODB_DB=pastebin
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### MongoDB Atlas Setup Details

1. **Create a Cluster:**
   - Sign up/login to MongoDB Atlas
   - Click "Build a Database"
   - Choose the free M0 tier
   - Select a cloud provider and region
   - Click "Create"

2. **Create Database User:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

3. **Whitelist IP Address:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - Or add your specific IP address
   - Click "Confirm"

4. **Get Connection String:**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with `pastebin` (or your preferred database name)

### Testing

The project supports deterministic testing via the `TEST_MODE` environment variable:

1. Set `TEST_MODE=1` in your `.env.local`
2. Send requests with `x-test-now-ms` header to control the "current time" for expiry logic
3. This allows for predictable testing of TTL expiration

## API Endpoints

### GET /api/healthz
Health check endpoint. Returns `{ "ok": true }` if the persistence layer is reachable.

### POST /api/pastes
Create a new paste.

**Request body:**
```json
{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}
```

**Response:**
```json
{
  "id": "string",
  "url": "https://<deployment-domain>/p/<id>"
}
```

### GET /api/pastes/:id
Fetch paste data (increments view count).

**Response:**
```json
{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "ISO string or null"
}
```

### GET /p/:id
View paste as HTML page.

## Deployment

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI` (your MongoDB Atlas connection string)
   - `MONGODB_DB` (optional, defaults to 'pastebin')
4. Deploy!

The app will automatically build and deploy on Vercel. Make sure to whitelist Vercel's IP addresses in MongoDB Atlas, or use `0.0.0.0/0` for serverless deployments.

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── healthz/
│   │   │   └── route.ts          # Health check endpoint
│   │   └── pastes/
│   │       ├── route.ts          # POST /api/pastes
│   │       └── [id]/
│   │           └── route.ts      # GET /api/pastes/:id
│   ├── p/
│   │   └── [id]/
│   │       ├── page.tsx          # GET /p/:id (HTML view)
│   │       └── not-found.tsx     # 404 page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/
│   ├── kv.ts                     # Re-exports from mongodb.ts (backward compatibility)
│   ├── mongodb.ts                # MongoDB persistence layer
│   └── utils.ts                  # Utility functions
├── .env.example                  # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Notes

- Pastes are automatically cleaned up when they expire or exceed view limits
- Content is HTML-escaped to prevent XSS attacks
- The project uses serverless-safe storage (MongoDB Atlas)
- All API responses are JSON (except HTML view page)
- MongoDB connection is cached for serverless environments to improve performance
