# 🏢 HireNest Elite — Enterprise Job Portal

A production-ready, full-stack Job Portal SaaS platform built with the **MERN Stack**. Features intelligent skill matching, OTP email verification, real-time notifications via WebSocket, role-based dashboards (Candidate / Recruiter / Admin), and analytics-rich interfaces.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)

---

## ✨ Key Features

### Authentication & Security
- **OTP Email Verification** — 6-digit codes via Nodemailer with auto-expiry
- **JWT Token Rotation** — Access (15m) + Refresh (7d) tokens with httpOnly cookies
- **Role-Based Access Control** — Candidate, Recruiter, Admin with protected routes
- **Rate Limiting** — Separate limiters for auth and OTP endpoints
- **Helmet & CORS** — Security headers and cross-origin protection

### Candidate Features
- Browse and search jobs with advanced filters (type, mode, salary, experience, skills)
- Apply to jobs with optional cover letters
- View application status tracking (applied → shortlisted → interview → hired/rejected)
- Save/bookmark jobs for later
- Profile editor with resume upload, skills management, and profile strength indicator
- Real-time notifications for application updates

### Recruiter Features
- Post jobs with skill requirements, salary ranges, and deadlines
- Manage job listings (activate/deactivate/delete)
- View applicants with **AI-powered skill match scores**
- Update application statuses (shortlist, interview, hire, reject)
- Download candidate resumes
- Analytics dashboard with hiring funnels, monthly trends, and per-job breakdowns
- Company profile management with avatar upload

### Admin Features
- Platform overview with user/job/application statistics
- User management table with search, role/status filters
- Approve or block recruiter accounts
- Platform-wide analytics (user growth, application trends, top skills, most applied roles)

### Technical Highlights
- **Smart Skill Matching Engine** — Calculates compatibility scores between candidates and job requirements
- **Real-Time Notifications** — Socket.IO for instant updates across all connected clients
- **Dark Mode** — Full dark mode support via Tailwind CSS class strategy
- **Responsive Design** — Mobile-first with dedicated sidebar navigation on desktop
- **Chart.js Dashboards** — Doughnut, Line, and Bar charts for analytics
- **Form Validation** — React Hook Form + Zod schemas
- **Animations** — Framer Motion page transitions and micro-interactions

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Redux Toolkit, React Router 6, Tailwind CSS 3 |
| **Backend** | Node.js, Express 4, Mongoose 8, Socket.IO 4 |
| **Database** | MongoDB Atlas |
| **Auth** | JWT (access + refresh), bcryptjs, OTP via Nodemailer |
| **UI** | Framer Motion, Chart.js, React Icons (HiOutline), react-hot-toast |
| **Forms** | React Hook Form, Zod, @hookform/resolvers |
| **File Upload** | Multer (PDF resumes, image avatars) |
| **Security** | Helmet, CORS, express-rate-limit, cookie-parser |

---

## 📁 Project Structure

```
Job-Portal/
├── backend/
│   ├── config/          # DB, email, socket configuration
│   ├── controllers/     # Route handlers (auth, job, application, admin, notification)
│   ├── middlewares/      # Auth guard, error handler, file upload, validation
│   ├── models/           # Mongoose schemas (User, Job, Application, Notification)
│   ├── routes/           # Express route definitions
│   ├── services/         # Email service, skill matching engine
│   ├── sockets/          # Socket.IO event handlers
│   ├── utils/            # API response helpers, AppError, token utilities
│   ├── seed.js           # Database seeder with demo data
│   └── server.js         # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── app/          # Redux store configuration
│   │   ├── components/   # Reusable UI (Navbar, Footer, JobCard, JobFilters, etc.)
│   │   ├── features/     # Redux slices & API layers (auth, jobs, applications, admin, notifications)
│   │   ├── hooks/        # Custom hooks (useDebounce, useSocket, useTheme)
│   │   ├── layouts/      # Page layouts (Auth, Main, Dashboard)
│   │   ├── pages/        # Route pages organized by role
│   │   │   ├── auth/     # Login, Register, VerifyOtp
│   │   │   ├── candidate/# Dashboard, Applications, Profile, SavedJobs
│   │   │   ├── recruiter/# Dashboard, PostJob, Jobs, Applicants, Analytics, Profile
│   │   │   ├── admin/    # Dashboard, Users, Analytics
│   │   │   └── jobs/     # Jobs listing, JobDetail
│   │   ├── utils/        # API client, constants, helpers
│   │   ├── App.jsx       # Router & route definitions
│   │   └── main.jsx      # Entry point
│   └── index.html
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- **SMTP Email** — Gmail App Password or any SMTP provider (for OTP emails)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Job-Portal.git
cd Job-Portal
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Fill in the required values:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hirenest-elite

JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=HireNest Elite
SMTP_FROM_EMAIL=noreply@hirenest.com

UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

> **Gmail Users:** Generate an [App Password](https://myaccount.google.com/apppasswords) (requires 2FA enabled). Use it as `SMTP_PASS`.

### 3. Seed the Database

```bash
npm run seed
```

This creates demo users, jobs, applications, and notifications for testing.

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 5. Run Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🔑 Demo Credentials

After running `npm run seed`, use these accounts to explore all features:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@hirenest.com` | `Admin@1234` |
| **Recruiter** | `recruiter@hirenest.com` | `Recruiter@1234` |
| **Candidate** | `candidate@hirenest.com` | `Candidate@1234` |

> **Note:** Seeded accounts have `isVerified: true` so OTP verification is skipped on login.

---

## 📡 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | No |
| POST | `/verify-otp` | Verify email OTP | No |
| POST | `/resend-otp` | Resend OTP code | No |
| POST | `/login` | Login | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | Logout | No |
| GET | `/me` | Get current user | Yes |
| PUT | `/profile` | Update profile | Yes |
| PUT | `/resume` | Upload resume | Yes |
| PUT | `/avatar` | Upload avatar | Yes |

### Jobs — `/api/jobs`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/` | Search/list jobs | No | — |
| GET | `/saved` | Get saved jobs | Yes | Candidate |
| GET | `/recruiter` | Get recruiter's jobs | Yes | Recruiter |
| GET | `/:id` | Get job by ID | No | — |
| POST | `/` | Create job | Yes | Recruiter (approved) |
| PUT | `/:id` | Update job | Yes | Recruiter, Admin |
| DELETE | `/:id` | Delete job | Yes | Recruiter, Admin |
| POST | `/:id/save` | Toggle save job | Yes | Candidate |

### Applications — `/api/applications`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/:jobId` | Apply to job | Yes | Candidate |
| GET | `/my` | My applications | Yes | Candidate |
| GET | `/stats` | Application stats | Yes | Candidate |
| GET | `/job/:jobId` | Job applicants | Yes | Recruiter, Admin |
| GET | `/analytics` | Recruiter analytics | Yes | Recruiter |
| PUT | `/:id/status` | Update status | Yes | Recruiter, Admin |
| GET | `/:id/resume` | Download resume | Yes | Recruiter, Admin |

### Admin — `/api/admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| PUT | `/users/:id/approve` | Approve recruiter |
| PUT | `/users/:id/block` | Toggle block user |
| GET | `/stats` | Platform stats |
| GET | `/analytics` | Platform analytics |

### Notifications — `/api/notifications`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get notifications |
| GET | `/unread-count` | Unread count |
| PUT | `/read-all` | Mark all read |
| PUT | `/:id/read` | Mark one read |
| DELETE | `/:id` | Delete notification |

---

## 🌐 Deployment

### Live Website

[Open HireNest Elite](https://hire-nest-job-portal-chi.vercel.app)

### Frontend — Vercel

1. Push your code to GitHub
2. Connect the repo on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Set **Build Command** to `npm run build`
5. Set **Output Directory** to `dist`
6. Add environment variables:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-backend.onrender.com`

### Backend — Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Set **Root Directory** to `backend`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `npm start`
5. Add all `.env` variables from the backend setup
6. Set `CLIENT_URL` to your Vercel frontend URL

---

## 📜 Scripts

### Backend

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start with nodemon (hot-reload) |
| Production | `npm start` | Start with node |
| Seed Data | `npm run seed` | Populate database with demo data |

### Frontend

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start Vite dev server |
| Build | `npm run build` | Production build |
| Preview | `npm run preview` | Preview production build locally |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
