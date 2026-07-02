import api from "./api";

export const profileService = {
  get: async () => {
    const res = await api.get("/profile");
    return res.data.data;
  },

  update: async (data) => {
    const res = await api.put("/profile", data);
    return res.data.data;
  },
};
