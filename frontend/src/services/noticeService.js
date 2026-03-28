import api from "./apiService";

export const getNotices = async (filters = {}) => {
  const response = await api.get("/notices", { params: filters });
  return response.data;
};

export const getAllNotices = async () => {
  const response = await api.get("/notices/all");
  return response.data;
};

export const getArchivedNotices = async () => {
  const response = await api.get("/notices/archive");
  return response.data;
};

export const createNotice = async (data) => {
  const response = await api.post("/notices", data);
  return response.data;
};

export const deleteNotice = async (id) => {
  const response = await api.delete(`/notices/${id}`);
  return response.data;
};

export const updateNotice = async (id, data) => {
  const response = await api.put(`/notices/${id}`, data);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.post(`/notices/${id}/read`);
  return response.data;
};

export const votePoll = async (id, optionIndex) => {
  const response = await api.post(`/notices/${id}/vote`, { optionIndex });
  return response.data;
};

export const toggleSaveNotice = async (id) => {
  const response = await api.post(`/notices/${id}/save`);
  return response.data;
};

export const getSavedNotices = async () => {
  const response = await api.get("/notices/saved/all");
  return response.data;
};
export const toggleLikeNotice = async (id) => {
  const response = await api.post(`/notices/${id}/like`);
  return response.data;
};

export const toggleReaction = async (id, reactionType) => {
    const response = await api.post(`/notices/${id}/reaction`, { reactionType });
    return response.data;
};

export const toggleCommentReaction = async (id, commentId, reactionType) => {
    const response = await api.post(`/notices/${id}/comment/${commentId}/reaction`, { reactionType });
    return response.data;
};
