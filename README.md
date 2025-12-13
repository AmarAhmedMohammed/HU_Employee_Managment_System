# Haramaya University Employee Management System

A comprehensive, production-ready Employee Management System built specifically for Haramaya University, Ethiopia.

## 🎯 Features

- **Role-Based Access Control**: Admin, HR Officer, Department Head, Finance Officer, and Employee roles
- **Employee Management**: Complete CRUD operations for employee records
- **Leave Management**: Request, approve, and track employee leave
- **Attendance Tracking**: Daily attendance management with statistics
- **Performance Reviews**: Employee performance evaluation system
- **Reporting Module**: Generate and download various reports
- **Secure Authentication**: JWT-based authentication system

## 🛠️ Technology Stack

### Frontend
- **Vite** + **React** 19
- **React Router** for navigation
- **Axios** for API communication
- **Pure CSS** (No framework - custom design system)

### Backend
- **Node.js** + **Express.js**
- **mysql2** for MySQL database connections (No ORM)
- **bcrypt** for password hashing
- **jsonwebtoken** for authentication
- **express-validator** for input validation

### Database
- **MySQL** with normalized relational schema
- Managed via **phpMyAdmin**
- Foreign keys enabled

## 📁 Project Structure

```
HU_Employee_Managment_System/
├── backend/                    # Backend API
│   ├── config/                 # (Optional - not used in current setup)
│   ├── controllers/            # (Optional - not used in current setup)
│   ├── middleware/             # (Optional - not used in current setup)  
│   ├── routes/                 # (Optional - not used in current setup)
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   ├── package.json
│   └── server.js               # ⭐ All-in-one server (DB + API + Auth)
│
├── src/                        # Frontend React app
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── MainLayout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx   # Auth state management
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── dashboards/
│   │   │   └── Dashboard.jsx
│   │   └── employees/
│   │       └── EmployeeList.jsx
│   ├── services/
│   │   ├── api.js           # Axios instance
│   │   ├── authService.js
│   │   └── employeeService.js
│   ├── App.jsx              # Main app component
│   ├── index.css            # Global styles & theme
│   └── main.jsx
│
├── .env                     # Frontend env variables
└── package.json
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher)

### 1. Database Setup

The database will be **automatically created** when you start the backend server!

1. Make sure MySQL is running on your system
2. Update `.env` file in `/backend` with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=hu_employee_management
   ```

**That's it!** The server will:
- Create the database if it doesn't exist
- Create all 10 tables automatically
- Seed initial data (departments, employees, users)
- Hash default passwords

### 2. Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (already done):
   ```bash
   npm install
   ```

3. The `.env` file is already configured. Update MySQL password if needed.

4. Start the backend server:
   ```bash
   npm start
   ```
   ✅ Server runs on: http://localhost:5000
   ✅ Database auto-created and seeded!

### 3. Frontend Setup

1. Navigate to project root directory

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Frontend will run on: http://localhost:5173

## 🔐 Default Credentials

After importing the seed data, use these credentials to login:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | abebe.kebede@hu.edu.et | password123 |
| **HR Officer** | tigist.mohammed@hu.edu.et | password123 |
| **Department Head** | alemayehu.wolde@hu.edu.et | password123 |
| **Finance Officer** | dawit.tesfaye@hu.edu.et | password123 |
| **Employee** | yohannes.bekele@hu.edu.et | password123 |

⚠️ **Important**: Change these passwords in production!

## 📊 Database Schema

The system uses 10 normalized tables:

1. **users** - Authentication and roles
2. **employees** - Employee information
3. **departments** - Department structure
4. **leave_requests** - Leave management
5. **attendance** - Attendance records
6. **performance_reviews** - Performance evaluations
7. **audit_logs** - System activity tracking
8. **leave_balances** - Leave balance tracking
9. **notifications** - User notifications

## 🎨 Design System

The system uses Haramaya University's official colors:

- **Primary**: Forest Green (#1e5631)
- **Secondary**: Orange/Gold (#e67e22)
- Clean, academic design aesthetic
- Fully responsive layout

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/change-password` - Change password

### Employees
- `GET /api/employees` - Get all employees (HR only)
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee (HR only)
- `PUT /api/employees/:id` - Update employee (HR only)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Leave Requests
- `GET /api/leave-requests` - Get leave requests
- `POST /api/leave-requests` - Create leave request
- `PUT /api/leave-requests/:id/status` - Approve/reject leave
- `GET /api/leave-balance/:employee_id` - Get leave balance

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `POST /api/attendance/bulk` - Bulk mark attendance

### Reports
- `GET /api/reports/employees-by-department` - Employee list
- `GET /api/reports/leave-summary` - Leave summary
- `GET /api/reports/attendance-summary` - Attendance summary
- `GET /api/reports/promotion-eligibility` - Promotion report
- `GET /api/reports/payroll-summary` - Payroll input
- `GET /api/reports/dashboard-stats` - Dashboard statistics

## 🧪 Development

### Frontend Development
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev      # Start with auto-reload (--watch)
npm start        # Start production server
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API endpoints
- SQL injection prevention (parameterized queries)
- Input validation
- Audit logging

## 📝 Notes

- The system is designed specifically for Haramaya University
- Uses MySQL with mysql2 package (NO ORM)
- Frontend uses pure CSS (NO Tailwind or other frameworks)
- All employee-related processes are digitized
- Supports role-based dashboards and access

## 👥 User Roles

1. **Admin (HR Director)** - Full system access
2. **HR Officer** - Employee and HR management
3. **Department Head** - Department-specific management
4. **Finance Officer** - Payroll and financial reports
5. **Employee** - Personal data and requests

## 🎓 Academic Context

This system is designed for demonstration to Haramaya University instructors and IT staff. It follows best practices in:
- Software architecture
- Database design
- Security implementation
- User experience
- Code organization

## 📞 Support

For issues or questions about the system, please contact the Haramaya University IT Department.

---

**Built with ❤️ for Haramaya University**
