import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "react-hot-toast";

import { getBaseUrl } from "../utils/baseUrl";
import { requestNotificationPermission, showBrowserNotification } from "../utils/notification";

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
      // Request notification permission
      requestNotificationPermission();

      // Join seller-specific room for notifications
      socket.emit("join-seller-room", user._id);

      // Join admin room if user is admin or superadmin
      const isAdmin = user.role_id?.role_name === "admin" || user.role_id?.role_name === "superadmin" || user.role === "admin";
      if (isAdmin) {
        socket.emit("join-admin-room");
      }

      // Listen for property expiration notifications
      socket.on("property-expired", (data) => {
        toast.error(data.message, {
          duration: 6000,
          icon: "🕒",
        });
        showBrowserNotification("Property Expired", {
          body: data.message,
        });
      });

      // Support Ticket Notifications
      const handleNewSupportMessage = (data) => {
        const isSupportPage = window.location.pathname.includes("/support");
        
        // Show toast if not on support page or if it's a general alert
        if (!isSupportPage) {
          const senderName = data.message?.sender?.name || "Support Team";
          const contentSnippet = data.message?.content?.substring(0, 50) + (data.message?.content?.length > 50 ? "..." : "");
          const subject = data.subject || "Support Ticket";
          
          toast.success(`New message in "${subject}" from ${senderName}`, {
            duration: 5000,
            icon: "💬",
          });

          showBrowserNotification(`New Message: ${subject}`, {
            body: `${senderName}: ${contentSnippet}`,
            url: isAdmin ? "/admin/support" : "/seller/support"
          });
        }
      };

      const handleNewSupportTicket = (data) => {
        if (isAdmin) {
          const isSupportPage = window.location.pathname.includes("/admin/support");
          if (!isSupportPage) {
            toast.success(`New Support Ticket: ${data.subject}`, {
              duration: 5000,
              icon: "🎫",
            });

            showBrowserNotification("New Support Ticket", {
              body: `From ${data.sellerName}: ${data.subject}`,
              url: "/admin/support"
            });
          }
        }
      };

      socket.on("new-support-message", handleNewSupportMessage);
      socket.on("new-support-ticket", handleNewSupportTicket);

      socket.on("ticket-status-updated", (data) => {
        const isSupportPage = window.location.pathname.includes("/support");
        if (!isSupportPage) {
          toast.success(`Ticket status updated to ${data.ticket.status}`, {
            duration: 5000,
            icon: "🔄",
          });

          showBrowserNotification("Ticket Status Updated", {
            body: `Your ticket status is now ${data.ticket.status}`,
            url: isAdmin ? "/admin/support" : "/seller/support"
          });
        }
      });

      return () => {
        socket.off("property-expired");
        socket.off("new-support-message", handleNewSupportMessage);
        socket.off("new-support-ticket", handleNewSupportTicket);
        socket.off("ticket-status-updated");
      };
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
