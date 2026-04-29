/**
 * Utility for handling browser native notifications
 */

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const showBrowserNotification = (title, options = {}) => {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    const defaultOptions = {
      icon: "/logo.png", // Path to your logo
      badge: "/logo.png",
      vibrate: [200, 100, 200],
      ...options,
    };

    const notification = new Notification(title, defaultOptions);

    notification.onclick = function(event) {
      event.preventDefault(); // prevent the browser from focusing the Notification's tab
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notification.close();
    };
    
    return notification;
  }
};
