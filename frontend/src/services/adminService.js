import api from "./apiService";

export const getAdminStats = async () => {
    const response = await api.get("/admin/stats");
    return response.data;
};

export const getAllUsers = async () => {
    const response = await api.get("/admin/users");
    return response.data;
};

export const createNewUser = async (userData) => {
    const response = await api.post("/admin/create-user", userData);
    return response.data;
};

export const deleteExistingUser = async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
};

export const getAnalytics = async () => {
    const response = await api.get("/admin/analytics");
    return response.data;
};

export const bulkRegisterUsers = async (formData) => {
    const response = await api.post("/admin/bulk-register", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const toggleUserLock = async (userId) => {
    const response = await api.put(`/admin/users/${userId}/lock`);
    return response.data;
};
