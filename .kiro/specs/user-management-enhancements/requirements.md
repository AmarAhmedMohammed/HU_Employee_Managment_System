# Requirements Document

## Introduction

This specification defines enhancements to the HU Employee Management System's user management functionality. The system currently requires manual employee ID entry and lacks password management capabilities for administrators. These enhancements will improve security and streamline the employee registration process.

## Glossary

- **System**: The HU Employee Management System
- **Admin**: A user with administrative privileges (role='admin')
- **Employee_ID**: A unique identifier assigned to each employee (format: HU followed by a sequential number)
- **User**: An authenticated account in the system linked to an employee record
- **Password_Change_Form**: A user interface component for changing passwords
- **Employee_Registration_Form**: A user interface component for creating new employee records
- **Database**: The MySQL database storing all system data
- **Auto_Increment_Counter**: A mechanism to generate sequential employee IDs

## Requirements

### Requirement 1: Admin Password Change

**User Story:** As an admin, I want to change my password, so that I can maintain account security and update my credentials when needed.

#### Acceptance Criteria

1. WHEN an admin accesses the settings or profile section, THE System SHALL display a password change option
2. WHEN an admin submits a password change request, THE System SHALL require the current password for verification
3. WHEN the current password is incorrect, THE System SHALL reject the change and display an error message
4. WHEN the current password is correct and a new password is provided, THE System SHALL update the password in the Database
5. WHEN a password is successfully changed, THE System SHALL display a success confirmation message
6. WHEN a new password is less than 8 characters, THE System SHALL reject the change and display a validation error
7. WHEN a password change is successful, THE System SHALL maintain the user's active session without requiring re-login

### Requirement 2: Automatic Employee ID Generation

**User Story:** As an HR officer, I want employee IDs to be automatically generated when registering new employees, so that I can avoid manual ID assignment and prevent duplicate or incorrect IDs.

#### Acceptance Criteria

1. WHEN the Employee_Registration_Form is displayed, THE System SHALL hide or disable the employee ID input field
2. WHEN a new employee is created, THE System SHALL automatically generate a unique Employee_ID
3. THE System SHALL format the Employee_ID as "HU" followed by a zero-padded 3-digit sequential number (e.g., HU001, HU002, HU099, HU100)
4. WHEN generating an Employee_ID, THE System SHALL query the Database to find the highest existing employee ID number
5. WHEN the highest existing Employee_ID is found, THE System SHALL increment it by 1 to create the new Employee_ID
6. WHEN no employees exist in the Database, THE System SHALL generate the Employee_ID "HU001"
7. WHEN an employee is successfully created, THE System SHALL display the generated Employee_ID to the user
8. THE System SHALL ensure the generated Employee_ID is unique before inserting into the Database
9. IF a duplicate Employee_ID is detected, THEN THE System SHALL retry generation with the next sequential number

### Requirement 3: Backend API Support

**User Story:** As a system developer, I want backend API endpoints to support password changes and automatic ID generation, so that the frontend can implement these features reliably.

#### Acceptance Criteria

1. THE System SHALL provide a POST endpoint at `/api/auth/change-password` for password changes
2. WHEN the change password endpoint receives a request, THE System SHALL validate the current password against the stored password
3. WHEN the change password endpoint validates successfully, THE System SHALL update the password in the users table
4. THE System SHALL modify the employee creation endpoint to generate Employee_IDs automatically
5. WHEN the employee creation endpoint receives a request without an employee_id field, THE System SHALL generate one automatically
6. THE System SHALL return the generated Employee_ID in the API response after successful employee creation
7. WHEN database errors occur during ID generation, THE System SHALL return an appropriate error response with status code 500

### Requirement 4: User Interface Updates

**User Story:** As a user, I want intuitive interfaces for password changes and employee registration, so that I can complete these tasks efficiently.

#### Acceptance Criteria

1. THE System SHALL add a "Change Password" option in the admin settings or profile menu
2. WHEN the Password_Change_Form is displayed, THE System SHALL include fields for current password, new password, and confirm new password
3. WHEN passwords in the new password and confirm password fields do not match, THE System SHALL display a validation error
4. THE System SHALL remove or hide the employee ID input field from the Employee_Registration_Form
5. WHEN an employee is successfully created, THE System SHALL display the generated Employee_ID in the success message or confirmation dialog
6. THE System SHALL use password input fields with masked characters for all password entries
7. WHEN form validation fails, THE System SHALL display clear error messages indicating what needs to be corrected
