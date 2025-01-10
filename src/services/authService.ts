import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth';

// Axios instance oluşturma
export const axiosInstance = axios.create();

// Request interceptor - her istekte token'ı ekle
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hatası durumunda login'e yönlendir
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log('Login isteği gönderiliyor:', { email, password });
    const response = await axios.post(`${API_URL}/login`, { email, password });
    console.log('Login yanıtı:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Login hatası:', error.response?.data || error.message);
    if (error.response) {
      throw new Error(error.response.data.message || 'Giriş başarısız');
    }
    throw new Error('Sunucuya bağlanılamadı');
  }
};

export const refreshToken = async (refreshToken: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
    return response.data.data;
  } catch (error: any) {
    throw new Error('Token yenileme başarısız');
  }
}; 