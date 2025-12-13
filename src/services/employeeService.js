// Simple employee service using fetch (no authentication)
export const employeeService = {
  // Get all employees
  getAll: async (filters = {}) => {
    const response = await fetch('http://localhost:5000/api/employees');
    return response.json();
  },

  // Get single employee
  getById: async (id) => {
    const response = await fetch(`http://localhost:5000/api/employees/${id}`);
    return response.json();
  },

  // Create employee
  create: async (employeeData) => {
    const response = await fetch('http://localhost:5000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(employeeData)
    });
    return response.json();
  },

  // Update employee
  update: async (id, employeeData) => {
    const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(employeeData)
    });
    return response.json();
  },

  // Delete employee
  delete: async (id) => {
    const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Get statistics
  getStats: async () => {
    const response = await fetch('http://localhost:5000/api/reports/dashboard-stats');
    return response.json();
  }
};

export default employeeService;
