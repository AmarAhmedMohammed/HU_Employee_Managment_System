# Design Document: Full Modules Implementation

## Overview

This design implements 5 fully functional modules (Departments, Leave Requests, Attendance, Performance, Reports) with complete backend API endpoints and React frontend components connected to MySQL database.

## Architecture

```
backend/
├── server.js              # Add new API endpoints for all modules

src/
├── services/
│   ├── departmentService.js   # Enhanced with CRUD
│   ├── leaveService.js        # New service
│   ├── attendanceService.js   # New service
│   ├── performanceService.js  # New service
│   └── reportService.js       # New service
├── pages/
│   ├── departments/
│   │   ├── DepartmentList.jsx
│   │   ├── DepartmentList.css
│   │   └── DepartmentForm.jsx
│   ├── leave/
│   │   ├── LeaveList.jsx
│   │   ├── LeaveList.css
│   │   └── LeaveForm.jsx
│   ├── attendance/
│   │   ├── AttendanceList.jsx
│   │   ├── AttendanceList.css
│   │   └── AttendanceForm.jsx
│   ├── performance/
│   │   ├── PerformanceList.jsx
│   │   ├── PerformanceList.css
│   │   └── PerformanceForm.jsx
│   └── reports/
│       ├── Reports.jsx
│       └── Reports.css
└── App.jsx                # Update routes
```

## Database Schema

### Performance Reviews Table (New)
```sql
CREATE TABLE IF NOT EXISTS performance_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  review_period ENUM('quarterly', 'annual') NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  strengths TEXT,
  improvements TEXT,
  goals TEXT,
  comments TEXT,
  review_date DATE NOT NULL,
  status ENUM('draft', 'submitted', 'acknowledged') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (reviewer_id) REFERENCES employees(id)
);
```

## API Endpoints

### Departments API
- GET /api/departments - List all departments
- GET /api/departments/:id - Get single department
- POST /api/departments - Create department
- PUT /api/departments/:id - Update department
- DELETE /api/departments/:id - Delete department

### Leave Requests API
- GET /api/leave-requests - List all leave requests
- GET /api/leave-requests/:id - Get single request
- POST /api/leave-requests - Create request
- PUT /api/leave-requests/:id - Update request (approve/reject)
- DELETE /api/leave-requests/:id - Delete request

### Attendance API
- GET /api/attendance - List attendance records
- GET /api/attendance/:id - Get single record
- POST /api/attendance - Create attendance record
- PUT /api/attendance/:id - Update record
- DELETE /api/attendance/:id - Delete record

### Performance API
- GET /api/performance - List reviews
- GET /api/performance/:id - Get single review
- POST /api/performance - Create review
- PUT /api/performance/:id - Update review
- DELETE /api/performance/:id - Delete review

### Reports API
- GET /api/reports/dashboard-stats - Dashboard statistics
- GET /api/reports/department-distribution - Employees by department
- GET /api/reports/attendance-summary - Attendance statistics
- GET /api/reports/leave-summary - Leave statistics

## Component Design

Each module follows the same pattern:
1. List component with table, search, filters
2. Form component for create/edit
3. Service file for API calls
4. CSS file for styling

## Error Handling

All API endpoints return consistent response format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": {} or []
}
```

## Testing Strategy

- Manual testing of all CRUD operations
- Verify database constraints
- Test form validation
- Test error handling
