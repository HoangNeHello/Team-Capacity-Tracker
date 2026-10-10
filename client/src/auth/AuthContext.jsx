// auth/AuthContext.jsx: holds token and user, provides login(), signup() and logout(), saves to localStorage.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api/client.js';

const USER_KEY = 'tct.user';

const AuthContext = createContext(null);

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readUser() {
  try {
    return JSON.parse(read(USER_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => read(api.TOKEN_KEY));
  const [user, setUser] = useState(readUser);

  const save = useCallback(({ token, user }) => {
    try {
      localStorage.setItem(api.TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Storage blocked: the session lasts until the tab closes.
    }
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(api.TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Storage blocked: nothing to remove.
    }
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => save(await api.login(email, password)), [save]);
  const signup = useCallback(async (email, password) => save(await api.signup(email, password)), [save]);

  useEffect(() => {
    api.setUnauthorizedHandler(logout);
  }, [logout]);

  const value = useMemo(() => ({ token, user, login, signup, logout }), [token, user, login, signup, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
