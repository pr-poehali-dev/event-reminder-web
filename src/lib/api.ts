const API_URLS = {
  register: 'https://functions.poehali.dev/7a7f18ca-7e12-45c8-adfe-7761f46ee2ba',
  login: 'https://functions.poehali.dev/42fa3010-308e-44ea-98b5-54882a4d756b',
  reminders: 'https://functions.poehali.dev/74878efb-7718-4c5a-b4a2-ac5966fb7d7b',
  sendNotification: 'https://functions.poehali.dev/a48b0516-943b-4a11-8cdf-52b3aeee9481',
};

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Reminder {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ReminderCreate {
  title: string;
  description?: string;
  date: string;
  time: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface ReminderUpdate {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  is_active?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }
  return response.json();
}

export const api = {
  async register(email: string, password: string, full_name: string): Promise<AuthResponse> {
    const response = await fetch(API_URLS.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    });
    return handleResponse<AuthResponse>(response);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(API_URLS.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(response);
  },

  async getReminders(token: string, search?: string): Promise<Reminder[]> {
    const url = search 
      ? `${API_URLS.reminders}?search=${encodeURIComponent(search)}`
      : API_URLS.reminders;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
    });
    return handleResponse<Reminder[]>(response);
  },

  async createReminder(token: string, data: ReminderCreate): Promise<Reminder> {
    const response = await fetch(API_URLS.reminders, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Reminder>(response);
  },

  async updateReminder(token: string, id: number, data: ReminderUpdate): Promise<Reminder> {
    const response = await fetch(`${API_URLS.reminders}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Reminder>(response);
  },

  async deleteReminder(token: string, id: number): Promise<void> {
    const response = await fetch(`${API_URLS.reminders}?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
    });
    await handleResponse<{ message: string }>(response);
  },

  async sendNotification(token: string, data: {
    to_email: string;
    reminder_title: string;
    reminder_date: string;
    reminder_time: string;
    reminder_description?: string;
  }): Promise<void> {
    const response = await fetch(API_URLS.sendNotification, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify(data),
    });
    await handleResponse<{ message: string }>(response);
  },
};

export { ApiError };
