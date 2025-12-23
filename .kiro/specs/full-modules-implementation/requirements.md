# Requirements Document

## Introduction

This feature implements fully functional modules for Departments, Leave Requests, Attendance, Performance Reviews, and Reports in the Haramaya University Employee Management System. Each module will have complete CRUD operations connected to the MySQL database with proper UI components.

## Glossary

- **Department_System**: Module for managing university departments
- **Leave_System**: Module for managing employee leave requests
- **Attendance_System**: Module for tracking employee attendance
- **Performance_System**: Module for employee performance reviews
- **Reports_System**: Module for generating HR reports
- **API_Server**: Express.js backend server connected to MySQL

## Requirements

### Requirement 1: Department Management

**User Story:** As an HR officer, I want to manage departments, so that I can organize employees by their work units.

#### Acceptance Criteria

1. THE Department_System SHALL display a list of all departments with name, description, head, and employee count
2. WHEN an admin creates a department, THE Department_System SHALL save it to the database
3. WHEN an admin edits a department, THE Department_System SHALL update the database record
4. WHEN an admin deletes a department, THE Department_System SHALL remove it from the database
5. THE Department_System SHALL allow assigning a department head from existing employees

### Requirement 2: Leave Request Management

**User Story:** As an employee, I want to submit and track leave requests, so that I can manage my time off.

#### Acceptance Criteria

1. THE Leave_System SHALL display all leave requests with employee name, type, dates, status
2. WHEN an employee submits a leave request, THE Leave_System SHALL save it with pending status
3. WHEN a manager approves/rejects a request, THE Leave_System SHALL update the status
4. THE Leave_System SHALL calculate days requested automatically from date range
5. THE Leave_System SHALL support leave types: annual, sick, maternity, paternity, unpaid

### Requirement 3: Attendance Tracking

**User Story:** As an HR officer, I want to track employee attendance, so that I can monitor workforce presence.

#### Acceptance Criteria

1. THE Attendance_System SHALL display attendance records with date, employee, status, times
2. WHEN recording attendance, THE Attendance_System SHALL save check-in/check-out times
3. THE Attendance_System SHALL support statuses: present, absent, late
4. THE Attendance_System SHALL allow filtering by date range and employee
5. THE Attendance_System SHALL prevent duplicate attendance records for same employee/date

### Requirement 4: Performance Reviews

**User Story:** As a manager, I want to conduct performance reviews, so that I can evaluate and develop employees.

#### Acceptance Criteria

1. THE Performance_System SHALL display performance reviews with employee, reviewer, rating, date
2. WHEN creating a review, THE Performance_System SHALL save rating, comments, and goals
3. THE Performance_System SHALL support ratings from 1-5 scale
4. THE Performance_System SHALL track review periods (quarterly, annual)
5. THE Performance_System SHALL allow setting goals and tracking progress

### Requirement 5: Reports Module

**User Story:** As an administrator, I want to generate reports, so that I can analyze HR data.

#### Acceptance Criteria

1. THE Reports_System SHALL display summary statistics on a dashboard
2. THE Reports_System SHALL show employee distribution by department
3. THE Reports_System SHALL show attendance summary statistics
4. THE Reports_System SHALL show leave request statistics
5. THE Reports_System SHALL allow filtering reports by date range
