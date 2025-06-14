const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export interface RegisterData {
  email: string;
  password: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
  role: string;
}

export async function registerUser(data: RegisterData) {
  const res = await fetch(`${API_BASE}/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to register');
  }
  return res.json();
}

export async function login(data: LoginData) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to login');
  }
  return res.json();
}

export function storeToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ApplicationData {
  user_id: number;
  call_id: number;
  content: string;
}

export async function submitApplication(data: ApplicationData) {
  const res = await fetch(`${API_BASE}/applications/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to submit application');
  }
  return res.json();
}

export interface Call {
  id: number;
  title: string;
  description?: string;
  is_open: boolean;
}

export async function fetchCalls(onlyOpen = false): Promise<Call[]> {
  const url = new URL(`${API_BASE}/calls/`);
  if (onlyOpen) url.searchParams.set('only_open', 'true');
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch calls');
  }
  return res.json();
}

export async function uploadDocuments(
  files: File[],
  onProgress?: (percent: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/documents/upload`);
    const token = getToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
    const data = new FormData();
    files.forEach((f) => data.append('files', f));
    xhr.send(data);
  });
}
