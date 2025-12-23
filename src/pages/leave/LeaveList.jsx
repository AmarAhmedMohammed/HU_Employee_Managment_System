import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import leaveService from '../../services/leaveService';
import employeeService from '../../services/employeeService';
import './LeaveList.css';

const LeaveList = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ employee_id: '', leave_type: 'annual', start_date: '', end_date: '', reason: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leaveRes, empRes] = await Promise.all([leaveService.getAll(), employeeService.getAll()]);
      if (leaveRes.success) setLeaves(leaveRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await leaveService.create(formData);
      setShowForm(false);
      setFormData({ employee_id: '', leave_type: 'annual', start_date: '', end_date: '', reason: '' });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveService.update(id, { status: 'approved', approved_by: user.id });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await leaveService.update(id, { status: 'rejected', approved_by: user.id });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Leave Requests</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Request</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>New Leave Request</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee *</label>
                <select required value={formData.employee_id} onChange={(e) => setFormData({...formData, employee_id: e.target.value})}>
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Leave Type *</label>
                <select required value={formData.leave_type} onChange={(e) => setFormData({...formData, leave_type: e.target.value})}>
                  <option value="annual">Annual</option>
                  <option value="sick">Sick</option>
                  <option value="maternity">Maternity</option>
                  <option value="paternity">Paternity</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input type="date" required value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input type="date" required value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Reason *</label>
                <textarea required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map(leave => (
              <tr key={leave.id}>
                <td><strong>{leave.employee_name}</strong><br/><small>{leave.emp_code}</small></td>
                <td><span className="badge badge-info">{leave.leave_type}</span></td>
                <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                <td>{leave.days_requested}</td>
                <td><span className={`badge badge-${leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'warning'}`}>{leave.status}</span></td>
                <td>
                  {leave.status === 'pending' && (user.role === 'admin' || user.role === 'hr_officer') && (
                    <>
                      <button className="btn-icon" onClick={() => handleApprove(leave.id)} title="Approve">✓</button>
                      <button className="btn-icon delete" onClick={() => handleReject(leave.id)} title="Reject">✗</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveList;
