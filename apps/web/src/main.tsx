import { FormEvent, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { getApiHealth } from './api';
import { getCurrentUser, login, logout } from './auth';
import { RecipePage } from './recipes/RecipePage';
import './recipes/RecipePage.css';

type User = {
  id: string;
  email: string;
};

function App() {
  const [apiStatus, setApiStatus] = useState('Checking API...');
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      getApiHealth().then((health) => {
        setApiStatus(`API status: ${health.status}`);
      }),
      getCurrentUser()
        .then((currentUser) => {
          setUser(currentUser);
        })
        .catch(() => {
          setError('Could not check the current login session.');
        })
        .finally(() => {
          setCheckingSession(false);
        }),
    ]).catch(() => {
      setError('The API could not be reached.');
      setCheckingSession(false);
    });
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      setUser(result.user);
      setPassword('');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setError(null);

    try {
      await logout();
      setUser(null);
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Logout failed.');
    }
  }

  if (checkingSession) {
    return (
      <main>
        <h1>PersonalSpace</h1>
        <p>Checking login session...</p>
      </main>
    );
  }

  return (
    user ? (
      <RecipePage onLogout={handleLogout} />
    ) : (
      <main>
        <h1>PersonalSpace</h1>
        <p>Your personal space for recipes and more.</p>
        <p>{apiStatus}</p>

        <section>
          <h2>Log in</h2>

          <form onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </section>

        {error && <p role="alert">{error}</p>}
      </main>
    )
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
