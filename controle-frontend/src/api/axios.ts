import axios from 'axios'

export const api = axios.create({
  baseURL: "https://localhost:5024",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@App:token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error);
    
    // Se receber 401, pode redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('@App:token');
      localStorage.removeItem('@App:user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);