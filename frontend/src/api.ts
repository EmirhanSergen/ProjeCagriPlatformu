const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export interface RegisterData {
  email: string;
  password: string;
  role: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
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

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface ApplicationData {
  call_id: number;
  content: string;
}

export interface Application {
  id: number;
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

export async function fetchApplicationByUserAndCall(
  callId: number,
): Promise<Application> {
  const res = await fetch(`${API_BASE}/applications/${callId}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch application');
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

export async function fetchCall(callId: number): Promise<Call> {
  const res = await fetch(`${API_BASE}/calls/${callId}`, { headers: { ...authHeaders() } })
  if (!res.ok) {
    throw new Error('Failed to fetch call')
  }
  return res.json()
}

export interface CallInput {
  title: string;
  description?: string | null;
  is_open?: boolean;
}

export async function createCall(data: CallInput): Promise<Call> {
  const res = await fetch(`${API_BASE}/calls/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to create call');
  }
  return res.json();
}

export interface CallWithDefsInput extends CallInput {
  documents: {
    name: string
    description?: string | null
    allowed_formats: string
  }[]
}

export async function apiCreateCallWithDefs(data: CallWithDefsInput): Promise<Call> {
  const res = await fetch(`${API_BASE}/calls/with-defs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error('Failed to create call')
  }
  return res.json()
}

export async function updateCall(id: number, data: CallInput): Promise<Call> {
  const res = await fetch(`${API_BASE}/calls/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Failed to update call');
  }
  return res.json();
}

export async function deleteCall(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/calls/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error('Failed to delete call');
  }
}

export async function uploadDocuments(
  callId: number,
  documentId: number,
  files: File[],
  onProgress?: (percent: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/applications/${callId}/upload?document_id=${documentId}`);
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

export interface Attachment {
  id: number;
  application_id: number;
  file_path: string;
}

export interface ApplicationDetail {
  id: number;
  user_id: number;
  call_id: number;
  content: string;
  documents_confirmed: boolean;
  user_email: string;
  attachments: Attachment[];
}

export async function fetchAttachments(callId: number): Promise<Attachment[]> {
  const res = await fetch(`${API_BASE}/applications/${callId}/attachments`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch attachments');
  }
  return res.json();
}

export async function confirmDocuments(callId: number) {
  const res = await fetch(`${API_BASE}/applications/${callId}/confirm`, {
    method: 'POST',
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error('Failed to confirm documents');
  }
  return res.json();
}

export interface DocumentDefinition {
  id: number
  call_id: number
  name: string
  description?: string | null
  allowed_formats: string
}

export async function createDocumentDefinition(callId: number, data: { name: string; description?: string | null; allowed_formats: string }): Promise<DocumentDefinition[]> {
  const res = await fetch(`${API_BASE}/admin/calls/${callId}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error('Failed to save document definition')
  }
  return res.json()
}

export async function updateDocumentDefinition(callId: number, docId: number, data: { name: string; description?: string | null; allowed_formats: string }): Promise<DocumentDefinition> {
  const res = await fetch(`${API_BASE}/admin/calls/${callId}/documents/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error('Failed to update document definition')
  }
  return res.json()
}

export async function deleteDocumentDefinition(callId: number, docId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/calls/${callId}/documents/${docId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  })
  if (!res.ok) {
    throw new Error('Failed to delete document definition')
  }
}

export async function fetchDocumentDefinitions(callId: number): Promise<DocumentDefinition[]> {
  const res = await fetch(`${API_BASE}/applications/${callId}/documents`, { headers: { ...authHeaders() } })
  if (!res.ok) {
    throw new Error('Failed to load document definitions')
  }
  return res.json()
}

export async function fetchApplications(
  callId: number,
): Promise<ApplicationDetail[]> {
  const res = await fetch(`${API_BASE}/calls/${callId}/applications`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch applications');
  }
  return res.json();
}

export async function verifyEmail(token: string) {
  const res = await fetch(`${API_BASE}/users/verify/${token}`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to verify email');
  }
  return res.json();
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export async function requestPasswordReset(email: string) {
  const res = await fetch(`${API_BASE}/users/password-reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error('Failed to request password reset');
  }
  return res.json();
}

export async function confirmPasswordReset(token: string, newPassword: string) {
  const res = await fetch(`${API_BASE}/users/password-reset/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  if (!res.ok) {
    throw new Error('Failed to reset password');
  }
  return res.json();
}
