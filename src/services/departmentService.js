// Simple department service using fetch
export const departmentService = {
  // Get all departments
  getAll: async () => {
    const response = await fetch('http://localhost:5000/api/departments');
    return response.json();
  }
};

export default departmentService;
