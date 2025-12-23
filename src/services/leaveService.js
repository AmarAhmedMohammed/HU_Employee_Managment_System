export const leaveService = {
  getAll: async () => {
    const response = await fetch('http://localhost:5000/api/leave-requests');
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`http://localhost:5000/api/leave-requests/${id}`);
    return response.json();
  },

  create: async (leaveData) => {
    const response = await fetch('http://localhost:5000/api/leave-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData)
    });
    return response.json();
  },

  update: async (id, leaveData) => {
    const response = await fetch(`http://localhost:5000/api/leave-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`http://localhost:5000/api/leave-requests/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};

export default leaveService;
