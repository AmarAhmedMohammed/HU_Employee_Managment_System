# Implementation Plan: User Management Enhancements

## Overview

This implementation plan breaks down the user management enhancements into discrete, incremental coding tasks. Each task builds on previous work and includes testing to validate functionality. The implementation follows the existing React + Express.js architecture.

## Tasks

- [x] 1. Backend: Implement automatic employee ID generation
  - Modify the POST `/api/employees` endpoint in `backend/server.js`
  - Add `generateEmployeeId()` function to query max employee_id and generate next sequential ID
  - Remove employee_id from required request body parameters
  - Return generated employee_id in success response
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.8, 3.4, 3.5, 3.6_

- [ ]* 1.1 Write property test for employee ID format
  - **Property 9: ID format compliance**
  - **Validates: Requirements 2.3**

- [ ]* 1.2 Write property test for sequential ID increment
  - **Property 10: Sequential ID increment**
  - **Validates: Requirements 2.5**

- [ ]* 1.3 Write property test for ID uniqueness
  - **Property 11: ID uniqueness**
  - **Validates: Requirements 2.8**

- [ ]* 1.4 Write unit test for first employee ID edge case
  - Test that first employee gets ID "HU001"
  - _Requirements: 2.6_

- [x] 2. Frontend: Update employee registration form
  - Modify `src/pages/employees/EmployeeForm.jsx`
  - Remove employee_id from formData initial state
  - Remove employee_id input field from JSX
  - Update success message to display generated employee_id from API response
  - Add state to store and display generated ID
  - _Requirements: 2.1, 2.7, 4.4, 4.5_

- [ ]* 2.1 Write property test for automatic ID generation
  - **Property 8: Automatic ID generation**
  - **Validates: Requirements 2.2, 3.5**

- [ ]* 2.2 Write property test for generated ID in response
  - **Property 12: Generated ID in response**
  - **Validates: Requirements 2.7**

- [ ]* 2.3 Write unit test for employee form without ID field
  - Test that employee_id field is not rendered
  - _Requirements: 2.1_

- [ ] 3. Checkpoint - Test employee creation flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Backend: Enhance password change endpoint
  - Verify POST `/api/auth/change-password` endpoint exists in `backend/server.js`
  - Add JWT token extraction to get current user ID
  - Add current password verification logic
  - Add new password length validation (minimum 8 characters)
  - Update password in users table on successful validation
  - Return appropriate success/error responses
  - _Requirements: 1.2, 1.3, 1.4, 1.6, 3.1, 3.2, 3.3_

- [ ]* 4.1 Write property test for current password validation
  - **Property 1: Current password validation requirement**
  - **Validates: Requirements 1.2, 3.2**

- [ ]* 4.2 Write property test for successful password update
  - **Property 2: Successful password update**
  - **Validates: Requirements 1.4**

- [ ]* 4.3 Write property test for password length validation
  - **Property 4: Password length validation**
  - **Validates: Requirements 1.6**

- [ ]* 4.4 Write unit test for incorrect current password edge case
  - Test that incorrect current password is rejected
  - _Requirements: 1.3_

- [x] 5. Frontend: Create Settings page component
  - Create `src/pages/settings/Settings.jsx`
  - Create `src/pages/settings/Settings.css`
  - Implement password change form with fields: current password, new password, confirm password
  - Add form validation (password length, password match)
  - Integrate with authService.changePassword()
  - Display success/error messages
  - Use password input type for all password fields
  - _Requirements: 1.1, 1.5, 4.1, 4.2, 4.3, 4.6, 4.7_

- [ ]* 5.1 Write property test for success feedback
  - **Property 3: Success feedback**
  - **Validates: Requirements 1.5**

- [ ]* 5.2 Write property test for password mismatch validation
  - **Property 6: Password mismatch validation**
  - **Validates: Requirements 4.3**

- [ ]* 5.3 Write property test for validation error messaging
  - **Property 7: Validation error messaging**
  - **Validates: Requirements 4.7**

- [ ]* 5.4 Write unit test for password field masking
  - Test that password fields have type="password"
  - _Requirements: 4.6_

- [x] 6. Frontend: Add Settings route and navigation
  - Add Settings route to `src/App.jsx`
  - Update sidebar navigation in `src/components/Layout/Sidebar.jsx` to include Settings link
  - Restrict Settings access to admin role
  - _Requirements: 1.1, 4.1_

- [ ]* 6.1 Write property test for session persistence
  - **Property 5: Session persistence**
  - **Validates: Requirements 1.7**

- [ ] 7. Frontend: Update EmployeeService
  - Modify `src/services/employeeService.js`
  - Update create() method to exclude employee_id from request body
  - Ensure generated employee_id is returned in response
  - _Requirements: 3.5, 3.6_

- [ ]* 7.1 Write property test for generated ID in UI feedback
  - **Property 13: Generated ID in UI feedback**
  - **Validates: Requirements 4.5**

- [ ] 8. Final checkpoint - Integration testing
  - Test complete password change flow (UI → API → Database)
  - Test complete employee creation flow with auto-generated ID
  - Verify all error scenarios are handled correctly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The authService.changePassword() method already exists in the codebase
- Backend password change endpoint may need to be created or enhanced
