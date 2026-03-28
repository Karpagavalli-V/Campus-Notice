import api from "./apiService";

export const sendMessage = async (recipientId, content) => {
    const response = await api.post("/messages", { recipientId, content });
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
