const socketIo = require("socket.io");

let io;

exports.init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("New client connected: " + socket.id);

        // User joins their own room
        socket.on("join", (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`User ${userId} joined room ${userId}`);
            }
        });

        // Real-time Calling Signaling
        socket.on("callUser", (data) => {
            console.log(`Calling user ${data.to} from ${data.from}`);
            socket.to(data.to).emit("incomingCall", { 
                from: data.from, 
                type: data.type, 
                user: data.user 
            });
        });

        socket.on("answerCall", (data) => {
            socket.to(data.to).emit("callResponse", { accepted: data.accepted });
        });

        socket.on("endCall", (data) => {
            socket.to(data.to).emit("callEnded");
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });

    return io;
};

exports.getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
