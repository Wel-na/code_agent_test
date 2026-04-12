# Todo App 

A full-stack todo application built with React, Vite, and Node.js. The project is structured as npm workspaces with a `client` frontend and `server` backend.

## Features

- React + Vite frontend with explicit loading and error states
- Node.js + Express API with validation, structured errors, and hardened middleware defaults
- File-backed persistence with atomic writes
- Docker packaging for deployment

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template if needed:

   ```bash
   copy .env.example .env
   ```

3. Start the app in development:

   ```bash
   npm run dev
   ```

Frontend: `http://localhost:5173`

Backend: `http://localhost:3001`

## Scripts

- `npm run dev`: run client and server in development
- `npm run build`: build the frontend and validate the server package
- `npm run start`: run the production server

## API

- `GET /api/health`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`

## Deployment

```bash
docker build -t todoapp .
docker run -p 3001:3001 todoapp
```
