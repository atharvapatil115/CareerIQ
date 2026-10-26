
import { createContext, useContext, useState, useEffect } from "react";
import { apiUrl } from "../api";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        localStorage.getItem("access_token")
    );
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = async (email, password) => {
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await fetch(apiUrl("/users/me"), {           
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Login Failed");
        }

        const newToken = data.access_token;

        localStorage.setItem("access_token", newToken);
        setToken(newToken);

        const profileResponse = await fetch(apiUrl("/users/me"), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${newToken}`,
            },
        });

        const userData = await profileResponse.json();

        if (!profileResponse.ok) {
            throw new Error(
                userData.detail || "Failed to fetch user profile"
            );
        }

        setUser(userData);

        return userData;
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        const restoreUser = async () => {
            const storedToken = localStorage.getItem("access_token");

            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(apiUrl("/users/me"), {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${storedToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Invalid or expired token");
                }

                const userData = await response.json();

                setToken(storedToken);
                setUser(userData);
            } catch (error) {
                console.error("Session restoration failed:", error);

                localStorage.removeItem("access_token");
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        restoreUser();
    }, []);

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
