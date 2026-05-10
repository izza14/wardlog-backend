# WardLog Backend

A comprehensive **Node.js/Express** backend API for hospital ward management. This application handles patient records, clinical documentation, staff rostering, task management, notifications, and AI-powered clinical insights.

## ✨ Features

- **Patient Management** — Create, read, update patient records with clinical history
- **Clinical Documentation** — E-rounds, lab orders, and detailed clinical notes
- **Staff Roster Management** — Shift scheduling and swap request handling
- **Task Management** — Ward tasks with priority and assignment tracking
- **Notifications System** — Real-time notification management
- **Admin Dashboard** — Administrative controls and settings
- **Authentication & Authorization** — JWT-based secure authentication
- **AI Integration** — Groq LLM integration for clinical insights
- **Notice Board** — Hospital-wide announcements and notices
- **Comprehensive Testing** — Jest unit tests with MongoDB test database

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5.x
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcrypt/bcryptjs for password hashing
- **AI:** Groq SDK for LLM capabilities
- **Testing:** Jest with Supertest
- **Development:** Nodemon for hot-reload

## 📁 Project Structure

```
wardlog-backend/
├── controllers/          # Route handlers for each feature
│   ├── adminController.js
│   ├── aiController.js
│   ├── authController.js
│   ├── clinicalController.js
│   ├── noticeController.js
│   ├── notificationController.js
│   ├── patientController.js
│   ├── rosterController.js
│   ├── staffController.js
│   ├── swapController.js
│   ├── taskController.js
│   ├── userController.js
│   └── wardDashboardController.js
├── models/              # MongoDB schemas
│   ├── ClinicalNote.js
│   ├── ERound.js
│   ├── LabOrder.js
│   ├── Notice.js
│   ├── Notification.js
│   ├── Patient.js
│   ├── Roster.js
│   ├── Settings.js
│   ├── Staff.js
│   ├── SwapRequest.js
│   ├── Task.js
│   └── User.js
├── routes/              # API endpoint definitions
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── clinicalRoutes.js
│   ├── noticeRoutes.js
│   ├── notificationRoutes.js
│   ├── patientRoutes.js
│   ├── rosterRoutes.js
│   ├── staffRoutes.js
│   ├── swapRoutes.js
│   ├── taskRoutes.js
│   ├── userRoutes.js
│   └── wardRoutes.js
├── middleware/          # Custom middleware
│   └── auth.js          # JWT authentication middleware
├── tests/               # Unit tests
│   ├── auth.test.js
│   └── patient.test.js
├── postman/             # Postman collection exports
├── server.js            # Express app entry point
├── seed.js              # Database seed script
├── seedNotifications.js # Notification seed script
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or cloud)
- Groq API key (for AI features)

### 1. Clone and Install Dependencies

```bash
cd wardlog-backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
MONGO_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/wardlog?retryWrites=true&w=majority
MONGO_TEST_URI=mongodb://localhost:27017/wardlog_test

# Authentication
JWT_SECRET=your_super_secret_key_for_testing
PORT=5000

# AI Integration
GROQ_API_KEY=your_groq_api_key_here

# Optional: Google Gemini (currently commented out)
# GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the Server

**Development (with hot-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

Server will run on `http://localhost:5000` by default.

### 4. Seed Database (Optional)

Populate the database with sample data:

```bash
node seed.js
node seedNotifications.js
```

## 📜 Available Scripts

| Command       | Description                                    |
| ------------- | ---------------------------------------------- |
| `npm start`   | Run the server in production mode              |
| `npm run dev` | Run the server with Nodemon (development mode) |
| `npm test`    | Run Jest tests with 10s timeout                |

## 📡 API Endpoints Overview

### Authentication

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login user
- `POST /api/auth/logout` — Logout user

### Patients

- `GET /api/patients` — List all patients
- `POST /api/patients` — Create a new patient
- `GET /api/patients/:id` — Get patient details
- `PUT /api/patients/:id` — Update patient
- `DELETE /api/patients/:id` — Delete patient

### Clinical Documentation

- `GET /api/clinical/notes` — Get clinical notes
- `POST /api/clinical/notes` — Create clinical note
- `GET /api/clinical/erounds` — Get E-rounds
- `POST /api/clinical/erounds` — Create E-round
- `GET /api/clinical/labs` — Get lab orders
- `POST /api/clinical/labs` — Create lab order

### Staff & Roster

- `GET /api/staff` — List all staff
- `GET /api/roster` — Get roster schedule
- `POST /api/roster` — Create roster entry
- `GET /api/swaps` — Get swap requests
- `POST /api/swaps` — Request a shift swap

### Tasks

- `GET /api/tasks` — List all tasks
- `POST /api/tasks` — Create a task
- `PUT /api/tasks/:id` — Update task
- `DELETE /api/tasks/:id` — Delete task

### Notifications

- `GET /api/notifications` — Get user notifications
- `POST /api/notifications` — Create notification
- `PUT /api/notifications/:id/read` — Mark as read

### Admin

- `GET /api/admin/settings` — Get system settings
- `PUT /api/admin/settings` — Update settings
- `GET /api/admin/dashboard` — Admin dashboard data

### Ward Dashboard

- `GET /api/ward/dashboard` — Ward overview data

### Notices

- `GET /api/notices` — Get all notices
- `POST /api/notices` — Create notice
- `PUT /api/notices/:id` — Update notice
- `DELETE /api/notices/:id` — Delete notice

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:

1. User logs in with credentials
2. Server returns a JWT token
3. Include token in `Authorization: Bearer <token>` header for protected routes
4. Middleware verifies token before processing requests

Protected routes require valid JWT in the request header.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests include:

- Authentication flows (login, registration)
- Patient CRUD operations
- Database connectivity

The test environment uses a separate MongoDB test database (`MONGO_TEST_URI`).

## 🌐 CORS Configuration

The backend is configured to accept requests from:

- `http://localhost:5173` (local frontend development)
- `https://wardlog-frontend.vercel.app` (production frontend)
- All Vercel preview URLs for the project

## 📚 API Documentation

For detailed API documentation, import the Postman collection from the `postman/` directory into Postman.

### Postman Setup

1. Open Postman
2. Go to **File** → **Import**
3. Select the collection file from `postman/` folder
4. Set the `BASE_URL` variable to `http://localhost:5000` or your deployed backend URL
5. Import the `workspace.globals.yaml` for global variables

## 🔧 Development Workflow

### Adding a New Feature

1. **Create a model** in `models/` directory
2. **Create a controller** in `controllers/` with business logic
3. **Create routes** in `routes/` directory
4. **Import routes** in `server.js`
5. **Write tests** in `tests/` directory
6. **Test locally** with `npm run dev`

### Database Models

All models use Mongoose with the following pattern:

```javascript
const schema = new mongoose.Schema({
  // fields here
});

module.exports = mongoose.model("ModelName", schema);
```

## 🚀 Deployment

### Render (Current Deployment)

The backend is deployed on Render at: `https://wardlog-backend.onrender.com`

**Deployment checklist:**

- Set environment variables on Render dashboard
- Push changes to main branch (auto-deploys)
- Monitor logs in Render dashboard
- Test endpoints with updated API URLs

### Local Deployment Check

```bash
npm run dev
# Test endpoints on http://localhost:5000
```

## 🐛 Troubleshooting

| Issue                    | Solution                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| MongoDB connection error | Check `MONGO_URI` in `.env` and ensure IP whitelist includes your IP     |
| CORS errors              | Verify origin is in allowed list in `server.js`                          |
| JWT token invalid        | Ensure `JWT_SECRET` matches between token generation and verification    |
| Tests failing            | Ensure `MONGO_TEST_URI` points to a MongoDB instance and `NODE_ENV=test` |

## 📝 Environment Variables Reference

| Variable         | Purpose                       | Example                          |
| ---------------- | ----------------------------- | -------------------------------- |
| `MONGO_URI`      | Production MongoDB connection | `mongodb+srv://...`              |
| `MONGO_TEST_URI` | Test database connection      | `mongodb://localhost:27017/test` |
| `JWT_SECRET`     | Secret key for JWT signing    | Any secure random string         |
| `PORT`           | Server port                   | `5000`                           |
| `GROQ_API_KEY`   | Groq API key for AI features  | From Groq console                |
| `NODE_ENV`       | Environment type              | `development` or `test`          |

## 📄 License

This project is for educational/internal hospital management use.

## 🤝 Contributing

When contributing:

1. Follow the existing code structure
2. Add tests for new features
3. Update this README with new endpoints
4. Test locally before pushing
5. Ensure CORS configuration is maintained

## 📞 Support

For issues or questions, refer to the project documentation or contact the development team.
