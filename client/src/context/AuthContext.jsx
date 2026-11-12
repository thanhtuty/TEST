import { createContext, useContext, useEffect, useState } from "react";
import {
  changeCustomerPassword,
  getCurrentUser,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
  updateCustomerProfile,
} from "../services/authService.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "modena-session-token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(
    () => Boolean(localStorage.getItem(TOKEN_KEY))
  );

  useEffect(() => {
    let active = true;

    if (!token) {
      setUser(null);
      setIsAuthLoading(false);
      return undefined;
    }

    setIsAuthLoading(true);

    getCurrentUser(token)
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (!active) return;

        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (active) setIsAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);
  async function updateProfile(profile) {
    const updatedUser = await updateCustomerProfile(token, profile);
    setUser(updatedUser);
    return updatedUser;
  }

  async function changePassword(passwords) {
    return changeCustomerPassword(token, passwords);
  }
  function saveSession(session) {
    localStorage.setItem(TOKEN_KEY, session.token);
    setToken(session.token);
    setUser(session.user);
  }

  async function register(customer) {
    const session = await registerCustomer(customer);
    saveSession(session);
    return session.user;
  }

  async function login(credentials) {
    const session = await loginCustomer(credentials);
    saveSession(session);
    return session.user;
  }

  async function logout() {
    try {
      if (token) {
        await logoutCustomer(token);
      }
    } catch {
      // Vẫn xóa phiên ở trình duyệt nếu không kết nối được server.
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }

  const value = {
    token,
    user,
    isAuthLoading,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider.");
  }

  return context;
}
