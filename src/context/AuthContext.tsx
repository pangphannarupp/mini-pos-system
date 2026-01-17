import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'cashier';

interface User {
    id: string;
    username: string;
    role: UserRole;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (pin: string) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Mock users
const USERS: User[] = [
    { id: '1', username: 'admin', role: 'admin', name: 'Admin User' },
    { id: '2', username: 'cashier', role: 'cashier', name: 'John Doe' }
];

// Mock PINs
const PINS = {
    '1234': USERS[0], // Admin PIN
    '0000': USERS[1]  // Cashier PIN
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [user]);

    const login = (pin: string): boolean => {
        const matchedUser = PINS[pin as keyof typeof PINS];
        if (matchedUser) {
            setUser(matchedUser);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};
