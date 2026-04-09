import axios from "axios";

const API_URL = "http://localhost:5000/api/gamification";

const getLeaderboard = async (role = "") => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/leaderboard?role=${role}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

const getMyXP = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export { getLeaderboard, getMyXP };
