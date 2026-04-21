import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem("token");
      if (token) {
        // Only clear if we actually had a session
        localStorage.clear();
        window.location.href = "/login?message=session_expired";
      }
    }
    return Promise.reject(error);
  },
);

export const postRequirement = (data) => api.post("/requirements", data);
export const getRequirements = () => api.get("/requirements");
export const updateRequirementStatus = (id, status) => api.patch(`/requirements/${id}`, { status });
export const deleteRequirement = (id) => api.delete(`/requirements/${id}`);
export const getSubscriptionStats = (requirementId) => api.get("/requirements/subscription-stats", { params: { requirementId } });
export const shareRequirement = (id, data) => api.post(`/requirements/${id}/share`, data);

// Seller Shared Leads
export const getMySharedLeads = () => api.get("/shared-leads/my-leads");
export const acceptSharedLead = (id) => api.post(`/shared-leads/${id}/accept`);

export default api;
