# Workbench

A web-based project and issue tracking application inspired by Jira.
Built for EECS 4314 — Group 3.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS  
**Backend:** Java, Spring Boot, Maven  
**Database:** PostgreSQL

## Project Structure

Workbench/

├── backend/workbench/ # Spring Boot REST API

└── (frontend files) # React + Vite SPA

## Running Locally

### Frontend (React + Vite)

1. Navigate to the project root folder
2. Run:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

### Backend

1. Navigate to `backend/workbench/`
2. Run:

```bash

# Start Redis
docker run -d --name workbench-redis -p 6379:6379 redis:7-alpine

# Run the app
mvn spring-boot:run
```

The database is live on Supabase cloud. No local PostgreSQL needed

### Login credentials

Email: `user@gmail.com`

Password: `hello123`
