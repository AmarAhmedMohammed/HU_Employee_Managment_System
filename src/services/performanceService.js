import api from "./api";

export const performanceService = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/performance${queryString ? `?${queryString}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/api/performance", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/performance/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/performance/${id}`);
    return response.data;
  },
};

export default performanceService;
