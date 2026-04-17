// context/AuthContext.jsx
// Manages global authentication state (user login, logout, role management)

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Sample seed data so the app feels pre-populated
const SEED_USERS = [
  {
    id: 'u1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password',
    role: 'seeker',
    title: 'Frontend Developer',
    location: 'Bengaluru, India',
    skills: ['React', 'JavaScript', 'CSS', 'TypeScript'],
    education: [{ school: 'IIT Bombay', degree: 'B.Tech Computer Science', year: '2022' }],
    experience: [{ company: 'TCS', role: 'Junior Developer', duration: '2022 - Present', desc: 'Built React applications' }],
  },
  {
    id: 'u2',
    name: 'Rahul Mehta',
    email: 'rahul@example.com',
    password: 'password',
    role: 'employer',
    company: 'TechNova Solutions',
    location: 'Mumbai, India',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUsers   = localStorage.getItem('hh_users');
    const storedSession = localStorage.getItem('hh_session');

    const allUsers = storedUsers ? JSON.parse(storedUsers) : SEED_USERS;
    setUsers(allUsers);

    if (!storedUsers) {
      localStorage.setItem('hh_users', JSON.stringify(SEED_USERS));
    }

    if (storedSession) {
      const sessionUser = allUsers.find(u => u.id === storedSession);
      if (sessionUser) setUser(sessionUser);
    }

    setLoading(false);
  }, []);

  // ——— Login ———
  const login = (email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'Invalid email or password.' };
    setUser(found);
    localStorage.setItem('hh_session', found.id);
    return { success: true, user: found };
  };

  // ——— Register ———
  const register = (data) => {
    const exists = users.find(u => u.email === data.email);
    if (exists) return { success: false, error: 'Email already registered.' };

    const newUser = {
      id: `u${Date.now()}`,
      ...data,
      skills: [],
      education: [],
      experience: [],
    };

    const updated = [...users, newUser];
    setUsers(updated);
    setUser(newUser);
    localStorage.setItem('hh_users', JSON.stringify(updated));
    localStorage.setItem('hh_session', newUser.id);
    return { success: true, user: newUser };
  };

  // ——— Logout ———
  const logout = () => {
    setUser(null);
    localStorage.removeItem('hh_session');
  };

  // ——— Update current user profile ———
  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    const updatedUsers = users.map(u => u.id === user.id ? updated : u);
    setUsers(updatedUsers);
    localStorage.setItem('hh_users', JSON.stringify(updatedUsers));
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, users, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for easy access
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
