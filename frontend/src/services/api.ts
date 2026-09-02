import type { ProblemDetails } from '../types/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export class ApiHttpError extends Error {
  public problem: ProblemDetails;

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title || 'HTTP Request Failed');
    this.name = 'ApiHttpError';
    this.problem = problem;
  }
}

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    ...(options.data !== undefined ? { body: JSON.stringify(options.data) } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorData: ProblemDetails;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        type: 'https://httpstatuses.com/' + response.status,
        title: response.statusText || 'Error',
        status: response.status,
        detail: `Request failed with status ${response.status}`,
        timestamp: new Date().toISOString(),
      };
    }
    throw new ApiHttpError(errorData);
  }

  // If 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(url: string, options?: RequestOptions) => request<T>(url, { method: 'GET', ...options }),
  post: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    request<T>(url, { method: 'POST', data, ...options }),
  put: <T>(url: string, data?: unknown, options?: RequestOptions) =>
    request<T>(url, { method: 'PUT', data, ...options }),
  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { method: 'DELETE', ...options }),
};
