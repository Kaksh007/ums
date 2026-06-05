# Robro User Management System

Full-stack assignment implementation using Angular for the frontend and Node.js for the backend, with MongoDB Atlas for data storage and Cloudinary for captured image storage.

## Overview

This project provides:

- User authentication with JWT-based login
- Role-based access control for Admin, Supervisor, and Worker
- User management for Admin users
- Camera-based image capture after login
- Secure image upload to Cloudinary
- MongoDB-backed storage for users, roles, and image metadata
- Vercel-ready deployment using serverless API functions

## Tech Stack

- Frontend: Angular
- Backend: Node.js
- Local backend runtime: Express
- Deployed backend runtime: Vercel serverless functions
- Database: MongoDB Atlas
- Image storage: Cloudinary
- Authentication: JWT + bcrypt

## Role Access

- `Admin`: manage users + see all images
- `Supervisor`: view users + see all images
- `Worker`: capture images + see only own images

## Project Structure

- `src/`: Angular frontend
- `api/`: Vercel serverless backend endpoints
- `api/_lib/`: shared backend helpers for database, auth, and HTTP handling
- `server.js`: local Express wrapper that reuses the same API handlers for development
- `dev.js`: starts the local backend and Angular frontend together

## Authentication and Permissions

- A default Admin account is seeded on first startup
- Passwords are stored as bcrypt hashes
- JWT tokens are issued after successful login
- Role checks are enforced on the backend, not only in the UI

Default seeded Admin credentials:

```text
Email: admin@example.com
Password: Admin@123
```

These values can be changed through environment variables.

## Environment Variables

Create a local environment file using the values below:

```env
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=replace-with-a-long-random-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

## Running the Project Locally

1. Install dependencies.

```bash
npm install
```

2. Create `.env.local` in the project root and add the required environment variables.

3. Start the full local application.

```bash
npm start
```

4. Open the frontend in your browser:

```text
http://127.0.0.1:4200/login
```

Local runtime details:

- Angular frontend runs on `http://127.0.0.1:4200`
- Local backend API runs on `http://127.0.0.1:3000`
- Frontend `/api` requests are proxied to the local backend

## Available Scripts

```bash
npm start
npm run build
npx vercel dev
```

## API Summary

- `POST /api/auth/login`: authenticate user and return JWT
- `GET /api/users`: list users for Admin and Supervisor
- `POST /api/users`: create Supervisor or Worker account for Admin
- `DELETE /api/users/:id`: remove a non-admin user for Admin
- `GET /api/images`: list all images for Admin and Supervisor
- `POST /api/images`: upload a captured image for authenticated users
- `GET /api/images/mine`: list current user images

## Deployment on Vercel

This project is set up for a single Vercel deployment:

- Angular is built as the frontend
- Files in `api/` are deployed as serverless backend functions
- MongoDB Atlas is used as the hosted database
- Cloudinary stores uploaded images

Deployment steps:

1. Push the repository to GitHub, GitLab, or Bitbucket
2. Import the repository into Vercel
3. Add all environment variables in Vercel Project Settings
4. Deploy from the repository root

Vercel configuration:

- Build command: `node ./node_modules/@angular/cli/bin/ng.js build`
- Output directory: `dist/client/browser`
- API routes: `api/*`

## Security Notes

- Passwords are never stored in plain text
- JWT tokens expire after 8 hours
- Image files are not stored on local server disk in production
- Admin accounts cannot be removed through the delete-user endpoint

## Development Notes

- The deployed backend is serverless on Vercel
- The local backend uses Express only as a development wrapper around the same API handlers
- This keeps local development simple while preserving the deployed architecture

## Submission Notes

This implementation covers the assignment requirements for:

- authentication
- user management
- role-based access control
- image capture
- backend image storage
- local run instructions
- Vercel-ready deployment
<!--  -->