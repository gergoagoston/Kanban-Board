# Ticket Tracker 3000

A simple real-time task management application with boards, tasks, chat, and planning poker.

## Built with

- React and TypeScript
- Node.js, Express, and TypeScript
- MongoDB
- Socket.IO
- Redis and RabbitMQ

## Setup

You need Node.js, npm, MongoDB, and Docker Desktop installed.

Install the dependencies:

```powershell
npm install
Push-Location frontend; npm install; Pop-Location
Push-Location backend; npm install; Pop-Location
```

Create the backend environment file:

```powershell
Copy-Item backend/.env.example backend/.env
```

Update `backend/.env` with your local MongoDB connection and a secret key.

Start Redis and RabbitMQ:

```powershell
docker compose up -d
```

Start the backend:

```powershell
Push-Location backend
npm run dev
Pop-Location
```

Start the frontend in another terminal:

```powershell
Push-Location frontend
npm run dev
Pop-Location
```

The backend runs on port `8081` by default. The frontend uses `VITE_BASE_URL` for the backend URL.

## Note

Do not commit `.env` files or any real credentials.
