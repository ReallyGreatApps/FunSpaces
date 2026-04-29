# FunSpaces 🎉

FunSpaces is a beginner-friendly full-stack mini social app.

## Tech stack
- Frontend: React
- Backend: Node.js + Express
- Database: JSON file storage (`server/posts.json`)

## Features
- Simple username login (no password)
- Dashboard feed with newest posts first
- Create posts with text and emojis
- Like system with duplicate-like prevention per user
- Timestamp on each post
- Bright, playful, mobile-friendly UI
- Basic error handling

## Project structure
- `client/` → React frontend
- `server/` → Express backend

## Run locally

### 1) Start backend
```bash
cd server
npm install
npm start
```
Backend runs on `http://localhost:4000`.

### 2) Start frontend
```bash
cd client
npm install
npm start
```
Frontend runs on `http://localhost:3000`.

## API endpoints
- `GET /posts` → return all posts (newest first)
- `POST /posts` → create post with `{ username, content }`
- `POST /like/:id` → like a post with `{ username }`

