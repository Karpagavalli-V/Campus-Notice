import api from "./apiService";

export const loginUser = async (data) => {
  const response = await api.post(`/auth/login`, data);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post(`/auth/register`, data);
  return response.data;
};

export const toggleFollow = async (id) => {
  const response = await api.post(`/auth/follow/${id}`);
  return response.data;
};

export const getFollowing = async () => {
  const response = await api.get('/auth/following');
  return response.data;
};

export const getConnections = async () => {
  const response = await api.get('/auth/connections');
  return response.data;
};

export const getPublicProfile = async (id) => {
  const response = await api.get(`/auth/user/${id}`);
  return response.data;
};
