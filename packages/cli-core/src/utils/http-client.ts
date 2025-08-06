import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { createLogger } from './logger.js';
import { errors } from '../errors/index.js';

const logger = createLogger();

// Create axios instance with defaults
export const httpClient: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'User-Agent': 'Revolutionary-UI-CLI/1.0.0',
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and auth
httpClient.interceptors.request.use(
  (config) => {
    logger.debug(`HTTP ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.debug('HTTP Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
httpClient.interceptors.response.use(
  (response) => {
    logger.debug(`HTTP ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      logger.debug(`HTTP ${error.response.status} ${error.config.url}`);
      
      switch (error.response.status) {
        case 401:
          throw errors.auth.notAuthenticated();
        case 403:
          throw errors.auth.sessionExpired();
        case 404:
          throw errors.network.apiError(404, 'Resource not found');
        case 429:
          throw errors.network.apiError(429, 'Rate limit exceeded');
        case 500:
        case 502:
        case 503:
        case 504:
          throw errors.network.apiError(
            error.response.status,
            'Server error. Please try again later.'
          );
      }
    } else if (error.request) {
      // Request made but no response
      logger.debug('HTTP No Response:', error.message);
      throw errors.network.connectionFailed(error.config?.url || 'unknown');
    } else {
      // Error in request setup
      logger.debug('HTTP Setup Error:', error.message);
      throw errors.network.connectionFailed('Request setup failed');
    }
    
    return Promise.reject(error);
  }
);

// Helper functions
export async function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.get<T>(url, config);
  return response.data;
}

export async function post<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await httpClient.post<T>(url, data, config);
  return response.data;
}

export async function put<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await httpClient.put<T>(url, data, config);
  return response.data;
}

export async function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await httpClient.delete<T>(url, config);
  return response.data;
}

export async function patch<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await httpClient.patch<T>(url, data, config);
  return response.data;
}

// Set auth token
export function setAuthToken(token: string): void {
  httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Remove auth token
export function clearAuthToken(): void {
  delete httpClient.defaults.headers.common['Authorization'];
}

// Set custom headers
export function setHeaders(headers: Record<string, string>): void {
  Object.assign(httpClient.defaults.headers.common, headers);
}