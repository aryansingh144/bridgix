# Bridgix — Alumni-Student Networking Platform

Bridgix is a full-stack web application that connects alumni and students for mentorship, placement assistance, and career guidance.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Redux Toolkit
- **Backend**: Express.js, MongoDB (local), Mongoose
- **Charts**: Chart.js (react-chartjs-2)
- **HTTP Client**: Axios

## Project Structure

```
bridgix/
├── backend/          Express.js API server
│   ├── models/       Mongoose models
│   ├── routes/       API route handlers
│   ├── server.js     Main server entry
│   └── seed.js       Database seed script
└── frontend/         Next.js 14 application
    ├── app/          Pages (App Router)
    ├── components/   Reusable components
    └── store/        Redux store and slices
```

## Prerequisites

- Node.js >= 18
- MongoDB running locally on port 27017

## Setup & Run

### 1. Install All Dependencies

```bash
npm run install:all
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

Backend (`backend/.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bridgix
```

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start MongoDB

Make sure MongoDB is running:
```bash
mongod
```
Or with Homebrew:
```bash
brew services start mongodb-community
```

### 4. Seed the Database

```bash
cd backend && npm run seed
```

This creates:
- 8 users (4 students, 4 alumni) with realistic profiles
- 10 posts
- 6 discussion topics with replies
- 20 messages between users
- 3 events
- 1 college
- Connection requests

### 5. Start the Servers

**Backend** (Terminal 1):
```bash
npm run dev:backend
# Runs on http://localhost:5000
```

**Frontend** (Terminal 2):
```bash
npm run dev:frontend
# Runs on http://localhost:3000
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, events, values, testimonials |
| `/signup` | User registration |
| `/login` | User login |
| `/register-college` | College registration |
| `/college-login` | College admin login |
| `/home` | Main feed with posts (Student/Alumni view) |
| `/profile/[id]` | User profile (Student or Alumni view) |
| `/chat` | Real-time messaging interface |
| `/discussion` | Discussion forum with topics |
| `/leaderboard` | Points-based leaderboard |
| `/events/[id]` | Event detail and registration |
| `/college-dashboard` | College admin dashboard with charts |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| GET | `/api/posts` | Get all posts |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/:id/like` | Toggle like |
| GET | `/api/discussions` | Get all discussions |
| POST | `/api/discussions` | Create discussion |
| GET | `/api/discussions/:id` | Get discussion |
| POST | `/api/discussions/:id/reply` | Add reply |
| GET | `/api/messages/:userId` | Get conversations |
| POST | `/api/messages` | Send message |
| GET | `/api/events` | Get all events |
| GET | `/api/events/:id` | Get event detail |
| GET | `/api/leaderboard` | Get leaderboard |
| GET | `/api/connections/:userId` | Get connections |
| POST | `/api/connections` | Send connection request |

## Role Switcher

The app includes a sticky **Role Switcher** at the top of all app pages. Click any role tab to switch the view:
- **Student** — See student-focused UI with skill needs, academic support
- **Alumni** — See alumni-focused UI with services, work experience
- **College** — See college admin dashboard

This is for demo purposes — no real authentication required.

## Color Scheme

| Token | Value |
|-------|-------|
| Primary Teal | `#2BC0B4` |
| Secondary Teal | `#1a9e93` |
| Accent Orange | `#FF8C42` |
| Background | `#f8fafb` |
| Card | `#ffffff` |
| Text | `#1a1a2e` |

## Seed Data Users

| Name | Role | Points |
|------|------|--------|
| Aryan Singh | Student (IIT Delhi) | 105 |
| Adarsh | Student (IIT Kanpur) | 86 |
| Mohit Singh | Alumni (Google) | 72 |
| Shivansh Sharma | Alumni (Razorpay) | 61 |
| Dhruv Baliyan | Student (NSIT Delhi) | 55 |
| Rajat Kumar | Student (Univ. Rajasthan) | 44 |
| Paresh Talwa | Alumni (Flipkart) | 38 |
| Ritwik Jadeja | Alumni (TechBridge) | 29 |
