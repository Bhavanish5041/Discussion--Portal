# Discussion Portal - Complete Project Documentation

## 📋 Project Overview
A full-stack Q&A discussion portal with user authentication, question posting, answers, and voting system.

---

## 🔌 API Endpoints

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: Set via `VITE_API_BASE_URL` environment variable

### Authentication Endpoints (`/api/auth`)

#### 1. POST `/api/auth/signup`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
- **Response**: 
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
  ```

#### 2. POST `/api/auth/login`
- **Description**: Login existing user
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: 
  ```json
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
  ```

### Questions Endpoints (`/api/questions`)

#### 3. GET `/api/questions`
- **Description**: Get all questions (sorted by newest first)
- **Response**: Array of question objects
  ```json
  [
    {
      "id": "question_id",
      "title": "Question title",
      "content": "Question content",
      "category": "Web Development",
      "votes": 5,
      "userVote": 1,
      "answers": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

#### 4. GET `/api/questions/:id`
- **Description**: Get a single question with all answers
- **Response**: Single question object with answers array

#### 5. POST `/api/questions`
- **Description**: Create a new question
- **Request Body**:
  ```json
  {
    "title": "How to use React?",
    "content": "I'm new to React...",
    "category": "Web Development"
  }
  ```
- **Response**: Created question object

#### 6. PATCH `/api/questions/:id/vote`
- **Description**: Vote on a question (upvote/downvote/remove)
- **Request Body**:
  ```json
  {
    "vote": 1  // 1 = upvote, -1 = downvote, 0 = remove vote
  }
  ```
- **Response**: Updated question object

#### 7. POST `/api/questions/:id/answers`
- **Description**: Add an answer to a question
- **Request Body**:
  ```json
  {
    "content": "Here's my answer..."
  }
  ```
- **Response**: Updated question object with new answer

#### 8. PATCH `/api/questions/:id/answers/:answerId/vote`
- **Description**: Vote on an answer
- **Request Body**:
  ```json
  {
    "vote": 1  // 1 = upvote, -1 = downvote, 0 = remove vote
  }
  ```
- **Response**: Updated question object with updated answer votes

### Health Check

#### 9. GET `/api/health`
- **Description**: Check if server is running
- **Response**: 
  ```json
  {
    "message": "Server is running"
  }
  ```

---

## 🛠️ Technologies & Libraries Used

### Frontend

#### Core Framework
- **React** (v19.2.0) - UI library
- **React DOM** (v19.2.0) - React rendering
- **Vite** (v7.2.2) - Build tool and dev server

#### Routing
- **React Router DOM** (v7.9.5) - Client-side routing

#### Styling
- **Tailwind CSS** (v4.1.17) - Utility-first CSS framework
- **Tailwind Merge** (v3.4.0) - Merge Tailwind classes
- **@tailwindcss/vite** (v4.1.17) - Vite plugin for Tailwind

#### 3D Graphics & Animations
- **Three.js** (v0.181.1) - 3D graphics library
- **@react-three/fiber** (v9.4.0) - React renderer for Three.js
- **@react-three/drei** (v10.7.6) - Useful helpers for react-three-fiber
- **Motion** (v12.23.24) - Animation library

#### Utilities
- **clsx** (v2.1.1) - Conditional className utility

### Backend

#### Server Framework
- **Express** (v4.21.1) - Web application framework for Node.js

#### Database
- **Mongoose** (v8.8.4) - MongoDB object modeling tool
- **MongoDB** - NoSQL database (local or Atlas)

#### Authentication & Security
- **jsonwebtoken** (v9.0.2) - JWT token generation and verification
- **bcryptjs** (v2.4.3) - Password hashing

#### Middleware & Utilities
- **CORS** (v2.8.5) - Cross-Origin Resource Sharing
- **dotenv** (v16.4.5) - Environment variable management

### Development Tools

#### Linting & Code Quality
- **ESLint** (v9.39.1) - JavaScript linter
- **@eslint/js** (v9.39.1) - ESLint JavaScript configuration
- **eslint-plugin-react-hooks** (v5.2.0) - React Hooks linting rules
- **eslint-plugin-react-refresh** (v0.4.24) - React Fast Refresh linting

#### TypeScript Types (for better IDE support)
- **@types/react** (v19.2.2) - TypeScript definitions for React
- **@types/react-dom** (v19.2.2) - TypeScript definitions for React DOM

#### Build Tools
- **@vitejs/plugin-react** (v5.1.0) - Vite plugin for React
- **globals** (v16.5.0) - Global variables for ESLint

---

## 📁 Project Structure

```
my-first-react-app/
├── server/                    # Backend code
│   ├── config/
│   │   └── db.js             # MongoDB connection configuration
│   ├── models/
│   │   ├── User.js           # User schema/model
│   │   └── Question.js       # Question & Answer schema/model
│   ├── routes/
│   │   ├── auth.js           # Authentication routes (signup/login)
│   │   └── questions.js      # Question & Answer routes
│   └── server.js             # Express server setup
│
├── src/                       # Frontend code
│   ├── assets/               # Static assets
│   ├── lib/                  # Utility functions
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # React entry point
│   ├── index.css             # Global styles
│   │
│   ├── beams.jsx             # 3D animated background component
│   ├── beams.css             # Beams styling
│   │
│   ├── SignUpForm.jsx        # User registration form
│   ├── SignUpForm.css        # Signup form styling
│   │
│   ├── LoginForm.jsx         # User login form
│   ├── LoginForm.css         # Login form styling
│   │
│   ├── HomePage.jsx          # Questions list page
│   ├── HomePage.css          # Home page styling
│   │
│   ├── NewQuestion.jsx       # Create question form
│   ├── NewQuestion.css       # New question form styling
│   │
│   ├── AnswerPage.jsx        # Question detail & answers page
│   └── AnswerPage.css        # Answer page styling
│
├── public/                    # Public static files
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
├── eslint.config.js          # ESLint configuration
└── .env                      # Environment variables (not in git)
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed with bcrypt),
  createdAt: Date,
  updatedAt: Date
}
```

### Question Model
```javascript
{
  title: String (required),
  content: String (required),
  category: String (required),
  votes: Number (default: 0),
  userVote: Number (default: 0), // 1, -1, or 0
  answers: [AnswerSchema],
  createdAt: Date,
  updatedAt: Date
}
```

### Answer Schema (embedded in Question)
```javascript
{
  content: String (required),
  votes: Number (default: 0),
  userVote: Number (default: 0), // 1, -1, or 0
  createdAt: Date
}
```

---

## 🎨 Features Implemented

### Authentication
- ✅ User registration (signup)
- ✅ User login
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Session persistence (localStorage)
- ✅ Logout functionality

### Questions
- ✅ Create new questions
- ✅ View all questions
- ✅ View single question with details
- ✅ Search questions
- ✅ Filter by category
- ✅ Vote on questions (upvote/downvote)
- ✅ Vote persistence in database

### Answers
- ✅ Post answers to questions
- ✅ View all answers for a question
- ✅ Vote on answers (upvote/downvote)
- ✅ Answers sorted by votes (highest first)
- ✅ Vote persistence in database

### UI/UX
- ✅ Modern glassmorphism design
- ✅ Animated 3D background (Beams effect)
- ✅ Responsive layout
- ✅ Loading states
- ✅ Error handling and display
- ✅ Smooth transitions and animations

---

## 🚀 Scripts

```bash
# Start development server (frontend)
npm run dev

# Start backend server
npm run server

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/myapp
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Secret Key
JWT_SECRET=your-secret-key-change-in-production

# Server Port
PORT=5000
```

For frontend (optional):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📝 API Usage Examples

### Signup
```javascript
fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    confirmPassword: 'password123'
  })
})
```

### Create Question
```javascript
fetch('http://localhost:5000/api/questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'How to use React?',
    content: 'I need help with React hooks',
    category: 'Web Development'
  })
})
```

### Vote on Question
```javascript
fetch('http://localhost:5000/api/questions/question_id/vote', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ vote: 1 }) // 1 = upvote, -1 = downvote, 0 = remove
})
```

---

## 🎯 Key Concepts Used

- **RESTful API Design** - Standard HTTP methods and status codes
- **JWT Authentication** - Token-based auth without sessions
- **MongoDB/Mongoose** - NoSQL database with ODM
- **React Hooks** - useState, useEffect for state management
- **Async/Await** - Modern JavaScript async handling
- **Optimistic UI Updates** - Update UI before server response
- **Error Handling** - Try-catch blocks and user-friendly error messages
- **Component-based Architecture** - Reusable React components
- **CSS-in-JS & CSS Modules** - Component-scoped styling
- **3D Graphics** - Three.js for animated backgrounds

---

## 📦 Total Dependencies

**Production Dependencies**: 15 packages
**Development Dependencies**: 8 packages

---

This project demonstrates a complete full-stack application with authentication, CRUD operations, real-time updates, and modern UI/UX design!

