"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { setSignIn, setSignOut } from "@/utils/NavAuthToggle";
import toast from "react-hot-toast";
import { apiFetch } from "@/utils/api";
import { User } from "@/app/types/user";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const UserContext = createContext<AuthContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUserContext must be used within a UserContextProvider");
  return context;
};

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch("/api/user/check-login", {
          cache: "no-store",
        });

        if (res.status === 202) {
          const data = await res.json();
          const userData = JSON.parse(data.data);
          const user: User = {
            id: userData.id,
            first_name: userData.f_name, // Map from f_name to first_name
            last_name: userData.l_name, // Map from l_name to last_name
            profile_picture: userData.profilePic, // Map from profilePic to profile_picture
            families: userData.families || [], // Initialize empty array if not provided
          };

          setUser(user);
          localStorage.setItem("user", JSON.stringify(user));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error checking login:", error);
        toast.error("Failed to check login status");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage(); // Load from localStorage first
    checkLogin(); // Then verify with server

    setSignIn(() => {
      // This will be handled by checkLogin updating the user state
    });

    setSignOut(() => {
      setUser(null);
      localStorage.removeItem("user");
    });
  }, []);

  const providerVal: AuthContextType = {
    user,
    setUser,
    isAuthenticated: !!user,
    isLoading,
  };

  return (
    <UserContext.Provider value={providerVal}>{children}</UserContext.Provider>
  );
};
