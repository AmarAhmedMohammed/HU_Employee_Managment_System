import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import departmentService from '../../services/departmentService';
import './EmployeeForm.css';

const EmployeeForm = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedEmployeeId, setGeneratedEmployeeId] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'male',
    date_of_birth: '',
    phone: '',
    email: '',
    position: '',
    department_id: '',
    employment_type: 'admin',
    hire_date: '',
    salary: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await employeeService.create(formData);
      
      if (response.success) {
        setGeneratedEmployeeId(response.data.employee_id);
        alert(`✅ Employee created successfully! Employee ID: ${response.data.employee_id}`);
        navigate('/employees');
      } else {
        alert('❌ Error: ' + (response.message || 'Failed to create employee'));
      }
    } catch (error) {
      alert('❌ Failed: ' + (error.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-form-container">
      <div className="page-header">
        <h1>Add New Employee</h1>
        <button onClick={() => navigate('/employees')} className="btn btn-outline">
          ← Back to List
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+251911234567"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@hu.edu.et"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Position *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                placeholder="e.g., Senior Lecturer"
              />
            </div>

            <div className="form-group">
              <label>Department *</label>
              <select name="department_id" value={formData.department_id} onChange={handleChange} required>
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Employment Type *</label>
              <select name="employment_type" value={formData.employment_type} onChange={handleChange} required>
                <option value="academic">Academic</option>
                <option value="admin">Admin</option>
                <option value="support">Support</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hire Date *</label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Salary *</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                placeholder="45000.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/employees')} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
