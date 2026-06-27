import { createContext, useContext, useState } from 'react';
const AuthContext = createContext(null);
AuthContext.displayName = 'AuthContext';
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('chm_admin') === 'true';
  });
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('chm_admin', 'true');
      setIsLoggedIn(true);
      return true;
    }
    return false;
  }
  
  const logout = () => {
    localStorage.removeItem('chm_admin');
    setIsLoggedIn(false);
  }
  const value = { isLoggedIn, login, logout };
  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
}
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('UseAuth cannot be used out of AuthProvider');
  return context;
}