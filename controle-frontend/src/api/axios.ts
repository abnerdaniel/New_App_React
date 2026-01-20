import axios from 'axios'

export const api = axios.create({
  baseURL: "http://localhost:7080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // aqui você pode tratar 401, 403, 500 etc
    console.error('Erro na API:', error);
    return Promise.reject(error);
  }
);