const apiUrl = 'http://localhost:3000';

type User = {
  id: string;
  email: string;
};

type AuthResponse = {
  user: User;
};

async function readError(response: Response): Promise<string> {
  const body = (await response.json()) as { error?: string };

  return body.error ?? 'The request failed.';
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<AuthResponse>;
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch(`${apiUrl}/auth/me`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const body = (await response.json()) as AuthResponse;

  return body.user;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${apiUrl}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }
}
