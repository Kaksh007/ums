# Robro User Management System

Angular + Vercel serverless implementation of the full-stack assignment.

## Features

- JWT login with bcrypt password hashing.
- Seeded default Admin user.
- Admin user creation, role assignment, and account removal.
- Role-based access control for Admin, Supervisor, and Worker.
- Browser camera capture after login.
- Cloudinary image upload with MongoDB Atlas metadata storage.
- Single Vercel project deployment from the repo root.

## Roles

- `Admin`: create Supervisor/Worker accounts, remove non-admin users, view all image records.
- `Supervisor`: view users and all captured images, without user mutation permissions.
- `Worker`: capture images and view only their own uploads.

## Local Setup

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example`.

   ```bash
   cp .env.example .env.local
   ```

3. Fill in these values.

   ```bash
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=replace-with-a-long-random-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=Admin@123
   ```

4. Start the local app. This runs the Express API on `http://127.0.0.1:3000` and the Angular UI on `http://127.0.0.1:4200`.

   ```bash
   npm start
   ```

5. Open `http://127.0.0.1:4200/login` and sign in with:

   ```text
   admin@example.com
   Admin@123
   ```

`npm start` now runs both local servers together. The Angular app proxies `/api` requests to the local Express API on port `3000`.

If you use `vercel dev` for deployment testing, it is separate from the normal local workflow. For day-to-day development, `npm start` is the correct command.

## Vercel Deployment

1. Push this repo to GitHub, GitLab, or Bitbucket.
2. Import the repo as a new Vercel project.
3. Add the environment variables from `.env.example` in Vercel Project Settings.
4. Deploy from the repo root.

Vercel uses:

- Build command: `npm run vercel-build`
- Output directory: `dist/client/browser`
- API functions: files under `api/`

## MongoDB Atlas Notes

- Create an Atlas cluster and database user.
- Add the Vercel outbound IP policy you prefer, or allow access from anywhere for assignment/demo usage.
- Use the Atlas connection string as `MONGODB_URI`.

## Cloudinary Notes

- Create a Cloudinary account.
- Copy cloud name, API key, and API secret into the environment variables.
- Uploaded captures are stored in the `robro-user-captures` folder.

## Security Decisions

- Passwords are never stored directly; bcrypt hashes are persisted.
- JWTs expire after 8 hours.
- RBAC is enforced in serverless API functions.
- Image bytes are not stored on Vercel disk, keeping the app compatible with serverless deployment.
- Admin accounts cannot be deleted from the UI/API delete endpoint.

## Useful Commands

```bash
npm run build
npm start
npx vercel dev
```
