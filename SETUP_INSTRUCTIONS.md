# 🎉 Haramaya University EMS - Complete Setup Instructions

## ✅ What's Been Implemented

All 5 modules are now **100% functional** with full database connectivity:

1. **🏢 Departments** - Full CRUD operations
2. **📋 Leave Requests** - Create, approve/reject leave requests
3. **✓ Attendance** - Record and track employee attendance
4. **⭐ Performance** - Create and manage performance reviews
5. **📈 Reports** - Dashboard with analytics and statistics

## 🚀 How to Run

### Step 1: Start the Backend Server

```bash
cd backend
npm start
```

The server will start on http://localhost:5000

### Step 2: Initialize the Database

Visit these URLs in your browser (in order):

1. **Create Tables**: http://localhost:5000/create-tables
   - Creates all database tables including the new `performance_reviews` table

2. **Seed Data**: http://localhost:5000/seed-data
   - Adds sample departments and admin user

### Step 3: Start the Frontend

```bash
# In the root directory
npm run dev
```

The app will start on http://localhost:5173

### Step 4: Login

Use these credentials:
- **Email**: admin@hu.edu.et
- **Password**: password123

## 📦 What Each Module Does

### 🏢 Departments
- View all departments with employee counts
- Add new departments
- Edit department details
- Assign department heads
- Delete departments (if no employees assigned)

### 📋 Leave Requests
- Submit leave requests (annual, sick, maternity, paternity, unpaid)
- Automatic calculation of days requested
- Approve/reject requests (admin/HR only)
- View all leave requests with status

### ✓ Attendance
- Record daily attendance (present, absent, late)
- Track check-in and check-out times
- Filter by date
- Prevents duplicate records for same employee/date

### ⭐ Performance Reviews
- Create performance reviews with 1-5 star ratings
- Track quarterly and annual reviews
- Record strengths, improvements, goals, and comments
- View all reviews with employee and reviewer details

### 📈 Reports
- Dashboard statistics (total employees, departments, attendance, pending leaves)
- Employee distribution by department
- Attendance summary
- Leave request statistics
- Employee distribution by type (academic, admin, support)

## 🎨 Design Features

- Modern SaaS-style UI with clean white backgrounds
- Green accent colors matching Haramaya University branding
- Responsive design for mobile, tablet, and desktop
- Modal forms for quick data entry
- Real-time data updates
- Professional table layouts with hover effects

## 🔧 Technical Stack

**Backend:**
- Node.js + Express
- MySQL database
- RESTful API endpoints

**Frontend:**
- React 18
- React Router for navigation
- Context API for authentication
- Modern CSS with custom properties

## 📝 API Endpoints

All modules have full CRUD endpoints:

- **Departments**: GET, POST, PUT, DELETE `/api/departments`
- **Leave Requests**: GET, POST, PUT, DELETE `/api/leave-requests`
- **Attendance**: GET, POST, PUT, DELETE `/api/attendance`
- **Performance**: GET, POST, PUT, DELETE `/api/performance`
- **Reports**: GET `/api/reports/*`

## 🎯 Next Steps

The system is now fully functional! You can:

1. Add more employees through the Employees module
2. Create departments and assign heads
3. Submit and manage leave requests
4. Record daily attendance
5. Conduct performance reviews
6. View comprehensive reports

## 💡 Tips

- Use the modal forms for quick data entry
- Filter attendance by date to view specific days
- Approve/reject leave requests from the Leave Requests page
- View real-time statistics on the Reports page
- All data is stored in MySQL and persists across sessions

Enjoy your fully functional HR management system! 🎊
