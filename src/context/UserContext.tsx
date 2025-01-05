import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define types for user data and context
interface User {
    id: string;
    role: string;
    accessToken: string;
    [key: string]: any; // Allow additional properties if needed
}

interface UserContextType {
    user: User | null;
    role: string;
    userID: string | null;
    login: (userData: User) => void;
    logout: () => void;
}

// Create the context with a default value of undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    // User state
    const [user, setUser] = useState<User | null>(null);
    const [userID, setUserID] = useState<string | null>(null);
    const [role, setRole] = useState<string>('guest'); // Default role is 'guest'

    // Load user from localStorage when the app starts
    useEffect(() => {
        const savedToken = localStorage.getItem("accessToken");
        const savedUser = localStorage.getItem("user");
        if (savedToken && savedUser) {
            const parsedUser: User = JSON.parse(savedUser);
            setUser({ ...parsedUser, accessToken: savedToken });
            setRole(parsedUser.role || 'guest'); // Set role from saved user or default to 'guest'
            setUserID(parsedUser.id);
            console.log("User loaded from storage:", parsedUser);
            console.log("Access token loaded:", savedToken);
        } else {
            console.log("No user or token found in localStorage");
        }
    }, []); // This runs once when the UserProvider is mounted

    // Login function
    const login = (userData: User) => {
        setUser(userData); // Update the user state
        setRole(userData.role || 'guest'); // Update role, defaulting to 'guest' if undefined
        setUserID(userData.id);
        localStorage.setItem("accessToken", userData.accessToken); // Persist token
        localStorage.setItem("user", JSON.stringify(userData)); // Persist user details
    };

    // Logout function
    const logout = () => {
        setUser(null); // Clear the user state
        setRole('guest'); // Reset role to 'guest'
        setUserID(null); // Clear userID
        localStorage.removeItem("accessToken"); // Remove token
        localStorage.removeItem("user"); // Remove user details
    };

    // Provide user state, role, and actions
    return (
        <UserContext.Provider value={{ user, role, userID, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

// Hook to use the UserContext
export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
