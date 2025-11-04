import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // État initial : récupérer le token depuis localStorage
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    return storedToken || null;
  });
  
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Base URL de l'API
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Initialisation : charger le profil si un token existe
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !player) {
        try {
          await loadPlayerProfile();
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Si le token est invalide, le supprimer
          logout();
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  // Fonction pour faire des requêtes authentifiées
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expiré ou invalide
        logout();
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      const data = await response.json();
      return { response, data };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Login
  const login = async (email, motDePasse) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, motDePasse }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur de connexion');
      }

      if (data.token) {
        // Stocker le token dans localStorage
        localStorage.setItem('token', data.token);
        setToken(data.token);
        
        // Mettre à jour les données du joueur
        setPlayer(data.data);
        
        return { success: true, player: data.data };
      }

      throw new Error('Token non reçu');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (nom, email, motDePasse) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nom, email, motDePasse }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Après l'inscription réussie, connecter automatiquement
      return await login(email, motDePasse);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    // Supprimer le token du localStorage
    localStorage.removeItem('token');
    
    // Réinitialiser l'état
    setToken(null);
    setPlayer(null);
  };

  // Charger le profil du joueur
  const loadPlayerProfile = async () => {
    if (!token) return null;

    try {
      const { data } = await authFetch('/api/player/profile');
      if (data.success) {
        // Mettre à jour le joueur avec les stats du profil
        setPlayer(data.data.stats);
        return data.data;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Si erreur, déconnecter l'utilisateur
      logout();
    }
    return null;
  };

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = () => {
    // Vérifier à la fois le token en mémoire et dans localStorage
    const storedToken = localStorage.getItem('token');
    return !!(token || storedToken);
  };

  // Obtenir le token (pour utilisation externe si nécessaire)
  const getToken = () => {
    return token || localStorage.getItem('token');
  };

  const value = {
    token: token || getToken(),
    player,
    loading,
    isInitialized,
    login,
    register,
    logout,
    authFetch,
    loadPlayerProfile,
    isAuthenticated,
    getToken,
    API_URL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
