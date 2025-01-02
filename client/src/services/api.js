import axios from "axios";
console.log("Connect", process.env.REACT_APP_API_URL);
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

let accessToken = null;
export const setToken = (token) => {
  accessToken = token;
};

apiClient.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${accessToken}`;
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});
apiClient.interceptors.response.use((response) => {
  return response;
});

export default apiClient;
