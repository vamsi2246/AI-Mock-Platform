import api from "./api";

export const interviewService = {
  start: async (data) => {
    const res = await api.post("/interview/start", data);
    return res.data.data;
  },

  end: async (data) => {
    const res = await api.post("/interview/end", data);
    return res.data.data;
  },

  saveMessage: async (data) => {
    const res = await api.post("/interview/message", data);
    return res.data.data;
  },

  getHistory: async (page = 1, limit = 10, search) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set("search", search);
    const res = await api.get(`/interview/history?${params}`);
    return res.data.data;
  },

  getSession: async (id) => {
    const res = await api.get(`/interview/${id}`);
    return res.data.data;
  },

  deleteSession: async (id) => {
    const res = await api.delete(`/interview/${id}`);
    return res.data;
  },

  generateReport: async (id) => {
    const res = await api.post(`/interview/${id}/report`);
    return res.data.data;
  },

  getReport: async (id) => {
    const res = await api.get(`/interview/${id}/report`);
    return res.data.data;
  },
};
