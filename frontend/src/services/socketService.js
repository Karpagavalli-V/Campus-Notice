import io from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket;

export const initSocket = (userId) => {
    if (!socket) {
        socket = io(SOCKET_URL);

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
            if (userId) {
                socket.emit("join", userId);
            }
        });
    } else {
        // If socket exists but re-initializing with user ID (e.g. login)
        if (userId) {
            socket.emit("join", userId);
        }
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initSocket();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
