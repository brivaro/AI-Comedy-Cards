import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import * as apiService from '../services/apiService'; 
import { User, UserCreate } from '../types'; 

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (username: any, password: any) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  refreshUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async (token: string) => {
    try {
      // Usamos un interceptor para añadir el token, pero aquí lo hacemos explícito para claridad
      const response = await apiService.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error("Session expired or invalid token", error);
      handleLogout(); // Limpiamos todo si el token es inválido
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      fetchUser(token);
    } else {
      setIsLoading(false); // No hay token, terminamos de cargar
    }
  }, [fetchUser]);

  const handleLogin = async (username: any, password: any) => {
    const response = await apiService.login(username, password);
    const { access_token } = response.data;
    localStorage.setItem('accessToken', access_token);
    setAccessToken(access_token);
    setIsLoading(true); // Ponemos en carga mientras se obtiene el usuario
    await fetchUser(access_token); // Obtenemos los datos del usuario inmediatamente
  };
  
  const handleRegister = async (userData: UserCreate) => {
    await apiService.register(userData);
    // Después del registro, loguear al usuario automáticamente
    await handleLogin(userData.username, userData.password);
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) await fetchUser(token);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login: handleLogin, register: handleRegister, logout: handleLogout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};