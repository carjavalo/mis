import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthResponse, authService } from "../lib/auth";

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (correo: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
    hasRole: (role: string) => boolean;
    isVerifying: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            const savedToken = localStorage.getItem("auth_token");

            if (!savedToken) {
                setIsVerifying(false);
                return;
            }

            try {
                const userData = await authService.getCurrentUser(savedToken);
                setUser(userData);
                setToken(savedToken);
            } catch (error) {
                console.error("Token inválido:", error);
                localStorage.removeItem("auth_token");
                setToken(null);
                setUser(null);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyAuth();
    }, []);

    const login = async (correo: string, password: string) => {
        setIsLoading(true);
        try {
            const authData: AuthResponse = await authService.login(
                correo,
                password
            );
            // Assuming API returns user object directly or nested
            // Adjust if authData.user is correct
            setUser(authData.user);
            setToken(authData.access_token);
            localStorage.setItem("auth_token", authData.access_token);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            if (token) {
                await authService.logout(token);
            }
        } catch (error) {
            console.error("Error durante logout:", error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem("auth_token");
            setIsLoading(false);
        }
    };

    const hasRole = (role: string): boolean => {
        // Super-admin has access to everything
        if (user?.rol === "super-admin") return true;
        return user?.rol === role;
    };

    const value: AuthContextType = {
        user,
        token,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user && !!token,
        hasRole,
        isVerifying,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
}
