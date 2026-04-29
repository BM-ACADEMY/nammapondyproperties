import api from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:6060/api";


function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeToPushNotifications = async () => {
  console.log("Attempting to subscribe to push notifications...");
  // alert("Push Notification Subscription Started");
  try {

    if (!("serviceWorker" in navigator)) {
      console.warn("Service workers are not supported in this browser");
      return;
    }

    if (!("PushManager" in window)) {
      console.warn("Push notifications are not supported in this browser");
      return;
    }

    // Request permission first
    const permission = await Notification.requestPermission();
    console.log("Notification permission:", permission);
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return;
    }

    // Register service worker
    console.log("Registering service worker...");
    const register = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });


    console.log("Service Worker Registered...");

    // Get VAPID public key from server
    const { data } = await api.get("/notifications/vapid-public-key");
    const publicVapidKey = data.publicKey;


    if (!publicVapidKey) {
      console.warn("VAPID public key not found on server");
      return;
    }

    // Get current subscription
    const existingSubscription = await register.pushManager.getSubscription();
    const publicVapidKeyUint8 = urlBase64ToUint8Array(publicVapidKey);

    if (existingSubscription) {
      // Check if keys match (simplified check)
      const currentKey = existingSubscription.options.applicationServerKey;
      if (currentKey) {
        const currentKeyUint8 = new Uint8Array(currentKey);
        const keysMatch = publicVapidKeyUint8.every((val, i) => val === currentKeyUint8[i]);
        
        if (keysMatch) {
          console.log("Subscription already exists and VAPID keys match.");
          // Still send to server just in case it's missing there
          await api.post("/notifications/subscribe", {
            subscription: existingSubscription,
            deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
          });
          return;
        } else {
          console.log("VAPID keys changed, un-subscribing and re-subscribing...");
          await existingSubscription.unsubscribe();
        }
      }
    }

    // Subscribe to push manager
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicVapidKeyUint8,
    });


    console.log("Push Subscribed...");
    // alert("Push Subscribed Successfully");

    // Send subscription to server

    await api.post("/notifications/subscribe", {
      subscription,
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    });


    console.log("Subscription sent to server");
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
  }
};
