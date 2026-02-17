import { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../lib/types';
import { authAPI, securityAPI } from '../lib/api';

// Usuarios de prueba mockeados - fallback si el backend no está disponible
const MOCK_USERS: Record<string, User & { password: string }> = {
  'admin@tormentus.com': {
    id: 1,
    email: 'admin@tormentus.com',
    password: 'password123',
    first_name: 'Admin',
    last_name: 'System',
    role: 'admin' as UserRole,
    balance: 5000,
    demo_balance: 50000,
    is_verified: true,
    verification_status: 'approved',
    created_at: '2024-01-01',
    pin: '1234',
    pin_enabled: false,
    phone: '+1 555 123 4567',
    country: 'Estados Unidos',
    two_factor_enabled: false
  },
  'operator@tormentus.com': {
    id: 2,
    email: 'operator@tormentus.com',
    password: 'password123',
    first_name: 'Operator',
    last_name: 'System',
    role: 'operator' as UserRole,
    balance: 2000,
    demo_balance: 20000,
    is_verified: true,
    verification_status: 'approved',
    created_at: '2024-01-01',
    pin: '1234',
    pin_enabled: false
  },
  'user@tormentus.com': {
    id: 5,
    email: 'user@tormentus.com',
    password: 'password123',
    first_name: 'Usuario',
    last_name: 'Demo',
    role: 'user' as UserRole,
    balance: 1000,
    demo_balance: 10000,
    is_verified: false,
    verification_status: 'not_submitted',
    created_at: '2024-01-01',
    pin: '1234',
    pin_enabled: false,
    phone: '+34 612 345 678',
    country: 'España'
  }
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresPin, setRequiresPin] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [useBackend, setUseBackend] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const pinVerified = sessionStorage.getItem('pin_verified');
    
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      
      if (parsedUser.pin_enabled && !pinVerified) {
        setPendingUser(parsedUser);
        setRequiresPin(true);
      } else {
        setUser(parsedUser);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    // Intentar con el backend real primero
    if (useBackend) {
      try {
        const response = await authAPI.login(email, password);
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        setPendingUser(null);
        setRequiresPin(false);
        
        return userData;
      } catch (error: any) {
        // Log error but don't automatically disable backend unless it's a structural failure
        console.error('Login error:', error);
        
        if (error.code === 'ERR_NETWORK' || error.response?.status === 502) {
          // If we want to strictly test backend, we should throw here
          // For now, we'll keep the option to fallback but make it more obvious
          // or throw if the user wants strict integration
          throw new Error('No se pudo conectar con el servidor. Por favor, asegúrate de que el backend esté corriendo.');
        } else {
          throw error;
        }
      }
    }
    
    // Fallback a mock
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = MOCK_USERS[email.toLowerCase()];
    
    if (!mockUser || mockUser.password !== password) {
      throw { response: { data: { error: 'Credenciales inválidas' } } };
    }
    
    const { password: _, ...userWithoutPassword } = mockUser;
    const newUser = userWithoutPassword as User;
    const newToken = 'mock-token-' + Date.now();
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    setToken(newToken);
    setUser(newUser);
    setPendingUser(null);
    setRequiresPin(false);
    
    return newUser;
  }, [useBackend]);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    // Intentar verificar con el backend
    if (useBackend) {
      try {
        const response = await securityAPI.verifyPin(pin);
        if (response.data.valid) {
          sessionStorage.setItem('pin_verified', 'true');
          if (pendingUser) {
            setUser(pendingUser);
            setPendingUser(null);
            setRequiresPin(false);
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error verificando PIN:', error);
      }
    }
    
    // Fallback a verificación local
    if (pendingUser && pendingUser.pin === pin) {
      sessionStorage.setItem('pin_verified', 'true');
      setUser(pendingUser);
      setPendingUser(null);
      setRequiresPin(false);
      return true;
    }
    return false;
  }, [pendingUser, useBackend]);

  const setupPin = useCallback(async (pin: string): Promise<boolean> => {
    // Intentar configurar con el backend
    if (useBackend) {
      try {
        const response = await securityAPI.setupPin(pin);
        if (response.data.pin_enabled && user) {
          const updatedUser = { ...user, pin_enabled: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          return true;
        }
      } catch (error: any) {
        console.error('Error configurando PIN:', error);
        throw error;
      }
    }
    
    // Fallback a almacenamiento local
    if (user) {
      const updatedUser = { ...user, pin, pin_enabled: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    }
    return false;
  }, [user, useBackend]);

  const disablePin = useCallback(async (currentPin?: string): Promise<boolean> => {
    // Intentar desactivar con el backend
    if (useBackend && currentPin) {
      try {
        const response = await securityAPI.disablePin(currentPin);
        if (!response.data.pin_enabled && user) {
          const updatedUser = { ...user, pin: undefined, pin_enabled: false };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          return true;
        }
      } catch (error) {
        console.error('Error desactivando PIN:', error);
        throw error;
      }
    }
    
    // Fallback a almacenamiento local
    if (user) {
      const updatedUser = { ...user, pin: undefined, pin_enabled: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    }
    return false;
  }, [user, useBackend]);

  const register = useCallback(async (data: { email: string; password: string; first_name: string; last_name: string }): Promise<User> => {
    // Intentar con el backend real primero
    if (useBackend) {
      try {
        const response = await authAPI.register(data);
        const { token: newToken, user: userData } = response.data;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        
        return userData;
      } catch (error: any) {
        console.error('Registration error:', error);
        if (error.code === 'ERR_NETWORK' || error.response?.status === 502) {
          throw new Error('No se pudo conectar con el servidor. Por favor, asegúrate de que el backend esté corriendo.');
        } else {
          throw error;
        }
      }
    }
    
    // Fallback a mock
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: Date.now(),
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: 'user',
      balance: 0,
      demo_balance: 10000,
      is_verified: false,
      verification_status: 'not_submitted',
      created_at: new Date().toISOString(),
      pin_enabled: false
    };
    
    const newToken = 'mock-token-' + Date.now();
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    setToken(newToken);
    setUser(newUser);
    
    return newUser;
  }, [useBackend]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('pin_verified');
    setToken(null);
    setUser(null);
    setPendingUser(null);
    setRequiresPin(false);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  }, [user]);

  // Refrescar datos del usuario desde el backend
  const refreshUser = useCallback(async () => {
    if (!token || !useBackend) return;
    
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
  }, [token, useBackend]);

  return {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    requiresPin,
    pendingUser,
    useBackend,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    verifyPin,
    setupPin,
    disablePin
  };
}
