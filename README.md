# Workbench

A web-based project and issue tracking application inspired by Jira. 
Built for EECS 4314 — Group 3.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS  
**Backend:** Java, Spring Boot, Maven  
**Database:** PostgreSQL  

## Project Structure
Workbench/

├── backend/workbench/   # Spring Boot REST API

└── (frontend files)     # React + Vite SPA

## Running Locally

### Frontend (React + Vite)

1. Navigate to the project root folder
2. Run:
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

### Backend

1. Create a PostgreSQL database called `workbench`
2. Navigate to `backend/workbench/`
3. If your PostgreSQL username isn't `postgre` and password isn't `password`, set the environment variables `DB_USERNAME=yourusername`, `DB_PASSWORD=yourpassword`
4. Run:
```bash
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`
