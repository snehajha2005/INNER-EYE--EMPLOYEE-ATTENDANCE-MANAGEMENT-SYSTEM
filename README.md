# ⏱️ Employee Attendance Management System

A complete full-stack **Employee Attendance Management System** built using the **MERN Stack**.

The application provides separate dashboards and functionality for **Employees** and **HR/Admin users**. Employees can register, log in, manage daily attendance, track working hours, view attendance history, submit leave requests, and monitor leave balances. HR/Admin users can monitor organization-wide attendance, employees, attendance statistics, and employee leave requests.

---

## 📌 Assignment Requirements

The following table represents the requirements provided in the assignment and their implementation status.

| # | Assignment Requirement | Status | Implementation |
|---|---|---|---|
| 1 | Employee Login & Registration | ✅ Done | Employees can securely register new accounts and log in to access their personal dashboard. |
| 2 | Attendance Check-In / Check-Out | ✅ Done | Employees can check in and check out, with attendance time records stored in the system. |
| 3 | Working Hours Calculation | ✅ Done | Working hours and net working hours are automatically calculated using attendance records. |
| 4 | Leave Deduction Calculation | ✅ Done | Attendance-based leave deduction is automatically calculated based on attendance status and rules. |
| 5 | HR Dashboard | ✅ Done | A dedicated HR/Admin dashboard displays organization-wide attendance statistics and recent attendance activity. |
| 6 | Employee Dashboard | ✅ Done | Employees have a personal dashboard showing daily attendance status, net hours, statistics, quick actions, and recent records. |
| 7 | Attendance Status Tracking | ✅ Done | The system automatically tracks attendance statuses such as Present, Half Day, and Absent, along with late arrivals. |

### 🎯 Assignment Status: **COMPLETED**

All mandatory features specified in the assignment have been successfully implemented.

---

# ✨ Implemented Features

## 👤 Employee Features

- Employee Registration
- Secure Login and Logout
- Personal Employee Dashboard
- Attendance Check-In
- Attendance Check-Out
- Automatic Working Hours Calculation
- Net Working Hours Tracking
- Check-In and Check-Out Time Tracking
- Break Duration Tracking
- Overtime Tracking
- Present Days Tracking
- Half Days Tracking
- Absent Status Tracking
- Late Arrival Tracking
- Automatic Attendance Status Generation
- Automatic Leave Deduction Calculation
- Personal Attendance History
- Recent Attendance Records
- Attendance Summary Statistics
- Today's Attendance Status
- Today's Shift Terminal
- Quick Navigation and Actions
- Leave Request Submission
- Casual Leave Management
- Sick Leave Management
- Paid Leave Management
- Loss of Pay (LOP) Tracking
- Leave Quota Tracking
- Leave Balance Tracking
- Leave Request History
- Leave Approval Status Tracking
- HR Comments on Leave Requests
- Employee Profile Page
- Responsive Modern UI

---

## 🧑‍💼 HR/Admin Features

- Secure HR/Admin Login
- Separate HR/Admin Dashboard
- Organization-Wide Attendance Statistics
- Total Employee Count
- Present Employee Statistics
- Half Day Statistics
- Absent Employee Statistics
- Currently Checked-In Statistics
- On-Break Employee Statistics
- Recent Attendance Activity
- View Registered Employees
- Employee Management
- View Organization-Wide Attendance Records
- Attendance Search
- Attendance Filtering
- Leave Management Dashboard
- View Employee Leave Requests
- Search Leave Requests by Employee Name or ID
- Filter Leave Requests by Leave Type
- Filter Requests by Status
- Approve Leave Requests
- Reject Leave Requests
- Add HR Comments
- Pending Request Statistics
- Approved Request Statistics
- Rejected Request Statistics
- Total Leave Request Statistics
- HR/Admin Profile Page
- Protected HR/Admin Routes

---

# 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| API Communication | Axios |
| Icons | Lucide React |
| Backend | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcryptjs |
| Authorization | Role-Based Access Control |

---

# 🏗️ Application Architecture

The project follows a full-stack client-server architecture.

```text
┌─────────────────────────────┐
│       React Frontend        │
│                             │
│  Employee Portal            │
│  HR/Admin Portal            │
└──────────────┬──────────────┘
               │
               │ REST API / Axios
               ▼
┌─────────────────────────────┐
│      Node.js + Express      │
│                             │
│  Authentication             │
│  Attendance Logic           │
│  Leave Management           │
│  Role Authorization         │
└──────────────┬──────────────┘
               │
               │ Mongoose
               ▼
┌─────────────────────────────┐
│           MongoDB           │
│                             │
│  Users                      │
│  Attendance Records         │
│  Leave Requests             │
└─────────────────────────────┘
```

---

# 📁 Project Folder Structure

```text
Employee Attendance Management System/
│
├── backend/
│   │
│   ├── config/                 # Database configuration
│   ├── controllers/            # Route and business logic
│   ├── middleware/             # Authentication and role middleware
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API routes
│   ├── utils/                  # Helper and calculation functions
│   ├── .env                    # Environment variables
│   ├── package.json
│   ├── seed.js                 # Initial HR account seed script
│   └── server.js               # Backend entry point
│
└── frontend/
    │
    ├── public/
    │
    ├── src/
    │   ├── components/         # Reusable UI components
    │   ├── context/            # React Context and state management
    │   ├── pages/              # Employee and HR pages
    │   ├── services/           # API service calls
    │   ├── utils/              # Utility functions
    │   ├── App.jsx             # Main routing component
    │   └── index.css           # Global styles
    │
    ├── package.json
    ├── postcss.config.js
    └── tailwind.config.js
```

---

# 👥 User Roles

| Role | Access |
|---|---|
| Employee | Employee dashboard, check-in/check-out, attendance history, leave management, profile |
| HR/Admin | HR dashboard, employees, organization-wide attendance, leave approval, profile |

---

# 📊 Employee Dashboard

The Employee Dashboard provides a complete overview of the employee's attendance information.

### Dashboard Summary

- Today's Attendance Status
- Today's Net Working Hours
- Present Days
- Late Arrivals
- Half Days
- Remaining Leaves

### Attendance Information

- Arrival Status
- Check-In Time
- Check-Out Time
- Break Duration
- Net Working Hours
- Overtime
- Current Attendance Status

### Additional Features

- Today's Shift Terminal
- Recent Attendance Records
- Quick Action Buttons
- Apply for Leave
- View Full Attendance History

---

# 🧑‍💼 HR/Admin Dashboard

The HR Dashboard provides organization-wide attendance monitoring.

### Dashboard Statistics

- Total Employees
- Present Today
- Half Days
- Absent Today
- Currently Checked-In Employees
- Employees On Break

### Management Features

- Recent Attendance Activity
- Employee Management
- View Attendance Logs
- View Registered Employees
- Organization-Wide Attendance Statistics

---

# 🕒 Attendance Status Tracking

The application automatically tracks employee attendance.

| Status | Description |
|---|---|
| 🟢 Present | Employee has completed attendance requirements |
| 🟡 Half Day | Employee has completed partial working hours |
| 🔴 Absent | Employee is marked absent according to attendance rules |
| 🟠 Late | Employee checked in later than the expected time |

The system also tracks:

- Check-In Time
- Check-Out Time
- Gross Working Hours
- Net Working Hours
- Break Duration
- Overtime
- Attendance Status
- Leave Deduction

---

# 🏖️ Leave Management

The application also includes an employee leave management system.

## Supported Leave Types

| Leave Type | Description |
|---|---|
| Casual Leave | Personal or casual leave |
| Sick Leave | Leave due to illness |
| Paid Leave | Paid leave available to the employee |
| Loss of Pay (LOP) | Excess unpaid leave |

## Employee Leave Features

- Submit Leave Application
- Select Leave Type
- Select Start and End Date
- Choose Leave Duration
- Add Reason for Leave
- View Requested Duration
- Track Leave Status
- View HR Comments
- View Leave History
- View Leave Balances

## Leave Statuses

- 🟡 Pending
- 🟢 Approved
- 🔴 Rejected

## HR Leave Features

- View All Leave Applications
- Search Employee Leave Requests
- Filter by Leave Type
- Filter by Status
- Approve Requests
- Reject Requests
- Add HR Comments
- Track Leave Request Statistics

---

# 🔐 Authentication & Security

The application implements the following security features:

- JWT-based Authentication
- Password Hashing using bcryptjs
- Protected API Routes
- Role-Based Authorization
- Separate Employee and HR/Admin Access
- Authentication Middleware
- Role Middleware
- Protected Frontend Routes
- Role-Specific Dashboards and Pages

---

# 🗄️ Database Design

The application uses **MongoDB** with **Mongoose**.

## Core Entities

| Entity | Purpose |
|---|---|
| User | Stores employee and HR/Admin account information |
| Attendance | Stores employee check-in, check-out, working hours, and attendance status |
| Leave Request | Stores leave details, duration, status, reason, and HR comments |

## User Data

- Name
- Email
- Password
- Role
- Employee Information

## Attendance Data

- Employee Reference
- Date
- Check-In Time
- Check-Out Time
- Working Hours
- Net Working Hours
- Break Duration
- Overtime
- Attendance Status
- Leave Deduction

## Leave Request Data

- Employee Reference
- Leave Type
- Start Date
- End Date
- Duration
- Reason
- Leave Status
- HR Comment

---

# 🔌 API Overview

## Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new employee |
| `POST` | `/api/auth/login` | Login employee or HR/Admin |

---

## Employee Attendance APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/attendance/check-in` | Check in for the day |
| `PUT` | `/api/attendance/check-out` | Check out for the day |
| `GET` | `/api/attendance/today` | Get today's attendance |
| `GET` | `/api/attendance/history` | Get attendance history |
| `GET` | `/api/attendance/summary` | Get attendance summary |

---

## HR/Admin APIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hr/dashboard` | Get HR dashboard statistics |
| `GET` | `/api/hr/employees` | Get registered employees |
| `GET` | `/api/hr/attendance` | Get organization attendance records |

---

# 🚀 Setup Instructions

## Prerequisites

Make sure the following are installed:

| Requirement | Version / Requirement |
|---|---|
| Node.js | v14 or higher |
| npm | Latest compatible version |
| MongoDB | Local MongoDB or MongoDB Atlas |
| Git | Recommended for repository cloning |

---

## 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd Employee-Attendance-Management-System
```

---

## 2️⃣ Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file and configure the environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
PORT=5000
```

Create the initial HR account:

```bash
npm run seed
```

Start the backend server:

```bash
npm start
```

---

## 3️⃣ Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

Open the application using the local URL displayed in the terminal.

Usually:

```text
http://localhost:5173
```

---

# 👤 Application Usage

## Employee Access

1. Open the application.
2. Click on **Register as a new employee**.
3. Create a new employee account.
4. Log in with the registered credentials.
5. Access the Employee Dashboard.
6. Check in for the day.
7. Check out after completing the shift.
8. View attendance status and history.
9. Submit leave requests when required.
10. Track leave balances and leave approval status.

---

## HR/Admin Access

The initial HR account can be created using the seed script.

Example credentials:

```text
Email: hr@company.com
Password: Hr@12345
```

After login, the HR/Admin user can:

1. Access the HR Dashboard.
2. View organization-wide statistics.
3. View employees.
4. Monitor attendance records.
5. Search and filter attendance.
6. Manage employee leave requests.
7. Approve or reject leave requests.

---

# 🎨 UI/UX Features

- Modern Dashboard Interface
- Separate Employee and HR/Admin Portals
- Responsive Layout
- Clean Sidebar Navigation
- Summary Statistic Cards
- Attendance Status Badges
- Leave Status Badges
- Attendance Tables
- Leave Management Tables
- Search Functionality
- Filtering Functionality
- Quick Action Buttons
- Role-Specific Navigation
- Clear Visual Status Indicators

---

# 🧪 Functional Checklist

| Functionality | Status |
|---|---|
| Employee Registration | ✅ Implemented |
| Employee Login | ✅ Implemented |
| HR/Admin Login | ✅ Implemented |
| JWT Authentication | ✅ Implemented |
| Password Hashing | ✅ Implemented |
| Role-Based Authorization | ✅ Implemented |
| Employee Dashboard | ✅ Implemented |
| HR/Admin Dashboard | ✅ Implemented |
| Attendance Check-In | ✅ Implemented |
| Attendance Check-Out | ✅ Implemented |
| Working Hours Calculation | ✅ Implemented |
| Net Working Hours Tracking | ✅ Implemented |
| Break Tracking | ✅ Implemented |
| Overtime Tracking | ✅ Implemented |
| Present Tracking | ✅ Implemented |
| Half Day Tracking | ✅ Implemented |
| Absent Tracking | ✅ Implemented |
| Late Arrival Tracking | ✅ Implemented |
| Leave Deduction Calculation | ✅ Implemented |
| Attendance History | ✅ Implemented |
| HR Attendance Management | ✅ Implemented |
| Employee Management | ✅ Implemented |
| Leave Request System | ✅ Implemented |
| Leave Approval System | ✅ Implemented |
| Leave Rejection System | ✅ Implemented |
| HR Comments | ✅ Implemented |
| Leave Quota Tracking | ✅ Implemented |
| Leave Balance Tracking | ✅ Implemented |
| Employee Profile Page | ✅ Implemented |
| HR/Admin Profile Page | ✅ Implemented |
| Responsive UI | ✅ Implemented |

---

# 🔮 Future Improvements

The following features can be added in future versions:

- CSV/Excel Attendance Export
- Advanced Reports and Analytics
- Email Notifications
- Password Reset Functionality
- Pagination for Large Data Tables
- Shift Scheduling
- Holiday Calendar Integration
- Mobile Application
- Biometric Device Integration
- Advanced HR/Admin Controls

---

# 📦 Submission Contents

This project includes the following:

- Complete Source Code
- Backend API
- Frontend Application
- Database Models and Configuration
- Seed Script for Initial HR Account
- Setup Instructions
- Environment Configuration Guide
- Project Documentation

---

# 🏆 Assignment Completion

| Assessment Area | Status |
|---|---|
| Required Project Features | ✅ Completed |
| Problem-Solving | ✅ Implemented through attendance, status, working hours, and deduction logic |
| Application Architecture | ✅ Structured full-stack MERN architecture |
| Code Quality | ✅ Modular components and separation of concerns |
| UI/UX | ✅ Modern role-based responsive dashboards |
| Database Design | ✅ MongoDB and Mongoose data models |
| Security | ✅ JWT authentication, bcrypt hashing, protected routes, and role-based access |
| Overall Implementation | ✅ Completed |

---

## ✅ Final Status: ASSIGNMENT COMPLETED

All mandatory assignment requirements have been implemented successfully.

The project also includes additional features such as:

- Leave Request and Approval System
- Leave Balance and Quota Tracking
- HR Leave Management
- Attendance History
- Employee and HR Profile Pages
- Role-Based Route Protection
- Search and Filtering
- HR Comments
- Modern Responsive UI
- Employee and HR/Admin Dashboards

---

## 👩‍💻 Developer

**Sneha Jha**



---
