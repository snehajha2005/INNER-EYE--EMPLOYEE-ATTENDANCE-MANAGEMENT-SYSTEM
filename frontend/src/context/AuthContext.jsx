import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const userData = response.data;
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Login failed';
    }
  };

  const register = async (name, employeeId, email, password, role = 'employee') => {
    try {
      const response = await api.post('/auth/register', {
        name,
        employeeId,
        email,
        password,
        role,
      });
      
      const userData = response.data;
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Registration failed';
    }
  };

  const updateUser = (updatedUserData) => {
    if (updatedUserData.token) {
      localStorage.setItem('token', updatedUserData.token);
    }
    const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
    const mergedUser = { ...currentUserData, ...updatedUserData };
    localStorage.setItem('user', JSON.stringify(mergedUser));
    setUser(mergedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
