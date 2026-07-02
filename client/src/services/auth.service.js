import api from "./api";

export const authService = {
  signup: async (data) => {
    const res = await api.post("/auth/signup", data);
    return res.data.data;
  },

  login: async (data) => {
    const res = await api.post("/auth/login", data);
    return res.data.data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  me: async () => {
    const res = await api.get("/auth/me");
    return res.data.data;
  },
};
