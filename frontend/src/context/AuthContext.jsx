import { createContext, useContext, useEffect, useState } from 'react';
import { registerUser, loginUser, getCurrentUser } from '../services';
import { getToken, setToken, clearToken } from '../services/token';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { access_token } = await loginUser(email, password);
    setToken(access_token);
    const u = await getCurrentUser();
    setUser(u);
  }

  async function register(input) {
    await registerUser(input);
    await login(input.email, input.password);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
