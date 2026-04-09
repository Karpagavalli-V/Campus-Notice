import api from "./apiService";

export const sendMessage = async (data) => {
    // data can be FormData for media or a regular object
    const response = await api.post("/messages", data);
    return response.data;
};

export const getConversations = async () => {
    const response = await api.get("/messages/conversations");
    return response.data;
};

export const getConversation = async (userId) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
};

export const updateMessage = async (messageId, content) => {
    const response = await api.put(`/messages/${messageId}`, { content });
    return response.data;
};

export const deleteMessage = async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
};
