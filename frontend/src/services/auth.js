const TOKEN_KEY = 'nyaya_ai_token';
const USER_KEY = 'nyaya_ai_user';
const API_BASE = import.meta.env.VITE_API_URL || '';

export function isAuthenticated() {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
}

export function getCurrentUser() {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.detail || 'Invalid email or password' };
    }
  } catch (error) {
    return { success: false, error: 'Connection to server failed.' };
  }
}

export async function register(name, email, password) {
  try {
    if (!name || name.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.detail || 'Registration failed' };
    }
  } catch (error) {
    return { success: false, error: 'Connection to server failed.' };
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export default {
  isAuthenticated,
  getCurrentUser,
  getAuthHeaders,
  login,
  register,
  logout,
};
