export const reportService = {
  getDashboardStats: async () => {
    const response = await fetch('http://localhost:5000/api/reports/dashboard-stats');
    return response.json();
  },

  getDepartmentDistribution: async () => {
    const response = await fetch('http://localhost:5000/api/reports/department-distribution');
    return response.json();
  },

  getLeaveSummary: async () => {
    const response = await fetch('http://localhost:5000/api/reports/leave-summary');
    return response.json();
  }
};

export default reportService;
