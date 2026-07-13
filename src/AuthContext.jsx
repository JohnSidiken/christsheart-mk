import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

const AuthContext = createContext(null);
AuthContext.displayName = 'AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    // listening for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    // Cleanup
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);
  
  // Login
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };
  
  // Logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
  
  const value = { loading, isLoggedIn: !!user, login, logout };
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