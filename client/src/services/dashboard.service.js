import api from "./api";

export const dashboardService = {
  get: async () => {
    const res = await api.get("/dashboard");
    return res.data.data;
  },
};
