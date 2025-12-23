export const departmentService = {
  getAll: async () => {
    const response = await fetch('http://localhost:5000/api/departments');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`http://localhost:5000/api/departments/${id}`);
    return response.json();
  },

  create: async (departmentData) => {
    const response = await fetch('http://localhost:5000/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(departmentData)
    });
    return response.json();
  },

  update: async (id, departmentData) => {
    const response = await fetch(`http://localhost:5000/api/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(departmentData)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`http://localhost:5000/api/departments/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

export default departmentService;
