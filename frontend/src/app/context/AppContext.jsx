/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  clearAuthToken,
  createSupportTicket as createSupportTicketRequest,
  fetchCurrentUser,
  fetchSupportTickets,
  getAuthToken,
  login as loginRequest,
  register as registerRequest,
  resolveSupportTicket as resolveSupportTicketRequest,
  setAuthToken,
  updateCurrentUser as updateCurrentUserRequest,
} from "../services/api";

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    return stored === "dark" ? "dark" : "light";
  });
  const [supportTickets, setSupportTickets] = useState([]);

  const refreshSupportTickets = useCallback(async () => {
    if (user?.role !== "admin") {
      return [];
    }

    const tickets = await fetchSupportTickets();
    setSupportTickets(tickets);
    return tickets;
  }, [user?.role]);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getAuthToken();

      if (!token) {
        setSupportTickets([]);
        setAuthReady(true);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        if (currentUser?.role !== "admin") {
          setSupportTickets([]);
        }
      } catch {
        clearAuthToken();
        setUser(null);
        setSupportTickets([]);
      } finally {
        setAuthReady(true);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (user?.role === "admin") {
      const timeoutId = setTimeout(() => {
        void refreshSupportTickets();
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [refreshSupportTickets, user?.role]);

  const login = async (payload) => {
    const result = await loginRequest(payload);
    setAuthToken(result.token);
    setUser(result.user);
    if (result.user?.role !== "admin") {
      setSupportTickets([]);
    }
    setAuthError("");
    return result.user;
  };

  const register = async (payload) => {
    const result = await registerRequest(payload);
    setAuthToken(result.token);
    setUser(result.user);
    if (result.user?.role !== "admin") {
      setSupportTickets([]);
    }
    setAuthError("");
    return result.user;
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setSupportTickets([]);
    setAuthError("");
  };

  const updateCurrentUser = async (payload) => {
    const updatedUser = await updateCurrentUserRequest(payload);
    setUser(updatedUser);
    return updatedUser;
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const createSupportTicket = async ({ subject, description }) => {
    const ticket = await createSupportTicketRequest({ subject, description });
    return ticket;
  };

  const resolveSupportTicket = async (id) => {
    const updatedTicket = await resolveSupportTicketRequest(id);
    setSupportTickets((prev) =>
      prev.map((ticket) => (ticket.id === id ? updatedTicket : ticket))
    );
    return updatedTicket;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        userType: user?.role ?? null,
        theme,
        isAuthenticated: Boolean(user && getAuthToken()),
        authReady,
        authError,
        setAuthError,
        login,
        register,
        updateCurrentUser,
        logout,
        toggleTheme,
        supportTickets,
        refreshSupportTickets,
        createSupportTicket,
        resolveSupportTicket,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
}
