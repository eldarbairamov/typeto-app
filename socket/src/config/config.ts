import process from "process";

export const config = {
   SOCKET_PORT: process.env.SOCKET_PORT || 3200,
   CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173"
};