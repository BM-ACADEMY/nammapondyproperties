import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";

import { getBaseUrl } from "../utils/baseUrl";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(getBaseUrl(), {
      withCredentials: true,
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && user) {
      // Join seller-specific room for notifications
      socket.emit("join-seller-room", user._id);

      // Listen for property expiration notifications
      socket.on("property-expired", (data) => {
        toast.error(data.message, {
          duration: 6000,
          icon: "🕒",
        });
      });

      return () => {
        socket.off("property-expired");
      };
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
