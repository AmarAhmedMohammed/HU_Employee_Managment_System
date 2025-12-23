import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import './EmployeeList.css';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAll({ search });
      if (response.success) {
        setEmployees(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      inactive: 'badge-secondary',
      on_leave: 'badge-warning',
      terminated: 'badge-error'
    };
    return `badge ${badges[status] || 'badge-secondary'}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        console.log('Deleting employee with ID:', id);
        const response = await employeeService.delete(id);
        console.log('Delete response:', response);
        
        if (response.success) {
          alert('Employee deleted successfully');
          fetchEmployees(); // Refresh the list
        } else {
          alert('Failed to delete employee: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete employee: ' + (error.message || 'Network error'));
      }
    }
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="employee-list">
      <div className="page-header">
        <h1>Employee Management</h1>
        <button onClick={() => navigate('/employees/add')} className="btn btn-primary">
          <span>+ Add Employee</span>
        </button>
      </div>

      <div className="card">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Department</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.employee_id}</td>
                    <td>{employee.first_name} {employee.last_name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.position}</td>
                    <td>{employee.department_name || 'N/A'}</td>
                    <td>
                      <span className="badge badge-info">
                        {employee.employment_type}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadge(employee.status)}>
                        {employee.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          title="View"
                          onClick={() => handleView(employee)}
                        >
                          👁️
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Delete"
                          onClick={() => handleDelete(employee.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <p>Total: <strong>{employees.length}</strong> employees</p>
        </div>
      </div>

      {/* Employee Details Modal */}
      {showModal && selectedEmployee && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{color: "white"}}>Employee Details</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="employee-detail-grid">
                <div className="detail-item">
                  <label>Employee ID</label>
                  <span>{selectedEmployee.employee_id}</span>
                </div>
                <div className="detail-item">
                  <label>Full Name</label>
                  <span>{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <span>{selectedEmployee.email}</span>
                </div>
                <div className="detail-item">
                  <label>Phone</label>
                  <span>{selectedEmployee.phone}</span>
                </div>
                <div className="detail-item">
                  <label>Gender</label>
                  <span>{selectedEmployee.gender}</span>
                </div>
                <div className="detail-item">
                  <label>Date of Birth</label>
                  <span>{selectedEmployee.date_of_birth}</span>
                </div>
                <div className="detail-item">
                  <label>Position</label>
                  <span>{selectedEmployee.position}</span>
                </div>
                <div className="detail-item">
                  <label>Department</label>
                  <span>{selectedEmployee.department_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Employment Type</label>
                  <span className="badge badge-info">{selectedEmployee.employment_type}</span>
                </div>
                <div className="detail-item">
                  <label>Hire Date</label>
                  <span>{selectedEmployee.hire_date}</span>
                </div>
                <div className="detail-item">
                  <label>Salary</label>
                  <span>{selectedEmployee.salary} ETB</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={getStatusBadge(selectedEmployee.status)}>{selectedEmployee.status}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
