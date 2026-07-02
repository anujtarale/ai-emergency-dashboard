# AI Emergency Assistant Dashboard Backend

Production-ready Node.js + Express.js + TypeScript + MongoDB backend API.

## Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **JWT** authentication
- **bcrypt** for password hashing
- **Socket.io** for real-time communication
- **Nodemailer**
- **Multer** & **Cloudinary**
- **Helmet** for security headers
- **CORS**
- **Rate limiting**
- **Winston** for logging

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- MongoDB running locally or a cloud instance
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (already provided):
```env
NODE_ENV=development
PORT=5000
API_VERSION=v1
MONGODB_URI=mongodb://localhost:27017/ai-emergency-assistant
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## API Documentation
Swagger UI is available at `http://localhost:5000/api-docs`

## Docker

To run with Docker and Docker Compose:
```bash
docker-compose up -d --build
```

## Available Scripts
- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm run build`: Build TypeScript to JavaScript
- `npm run lint`: Lint the code
