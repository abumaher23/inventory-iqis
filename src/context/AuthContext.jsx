import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Verify user data has required fields
        if (parsedUser && parsedUser.email && parsedUser.role) {
          setUser(parsedUser);
        } else {
          // Invalid user data, remove it
          localStorage.removeItem('user');
        }
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);
  
  // Function to check if session is valid (can be extended to verify with backend)
  const checkAuth = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setUser(null);
      return false;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && parsedUser.email) {
        return true;
      }
    } catch (err) {
      // ignore
    }
    return false;
  };

  const login = (userData) => {
    const user = {
      id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      role: userData.role,
    };
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
