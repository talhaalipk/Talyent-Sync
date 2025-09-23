import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_BACKED_BASE_URL_SOCKET, {
  withCredentials: true,
});
