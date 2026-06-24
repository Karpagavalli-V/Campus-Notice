import api from "./apiService";

const getLeaderboard = async (role = "") => {
    const response = await api.get(`/gamification/leaderboard?role=${role}`);
    return response.data;
};

const getMyXP = async () => {
    const response = await api.get("/gamification/me");
    return response.data;
};

export { getLeaderboard, getMyXP };
