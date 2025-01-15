"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { setSignIn, setSignOut } from "@/utils/NavAuthToggle";
import toast from "react-hot-toast";

type UserProviderType = {
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
  userFN: string;
  setUserFN: React.Dispatch<React.SetStateAction<string>>;
  userLN: string;
  setUserLN: React.Dispatch<React.SetStateAction<string>>;
  profilePic: string;
  setProfilePic: React.Dispatch<React.SetStateAction<string>>; // Setter function for profile picture URL
  authStatus: boolean;
  setAuthStatus: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserContext = createContext<UserProviderType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUserContext not used in correct provider");

  return context;
};

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userId, setUserId] = useState<string>("");
  const [userFN, setUserFN] = useState<string>("");
  const [userLN, setUserLN] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string>("");
  const [authStatus, setAuthStatus] = useState<boolean>(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/user/check-login", {
          credentials: "include",
          next: { revalidate: 0 },
        });

        const data = await res.json();
        if (res.ok) {
          // this is because a valid response (200) can also be sent if even the user is not signed in
          if (res.status === 202) {
            const user = JSON.parse(data.data);
            setUserId(user.id);
            setUserFN(user.f_name);
            setUserLN(user.l_name);
            setProfilePic(user.profilePic);
            setAuthStatus(true);

            localStorage.setItem("userId", user.id);
            localStorage.setItem("userFN", user.f_name);
            localStorage.setItem("userLN", user.l_name);
            localStorage.setItem("profilePic", user.profilePic);
            localStorage.setItem("authStatus", "true");
          }
        } else {
          toast.error(res.statusText);
        }
      } catch (error: any) {
        console.error("Error:", error.message);
      }
    };

    // Immediately invoke the asynchronous function
    (async () => {
      await checkLogin();
    })();

    setSignIn(() => setAuthStatus(true));
    setSignOut(() => {
      setUserId("");
      setUserFN("");
      setUserLN("");
      setProfilePic("");
      setAuthStatus(false);
    });
  }, []);

  const providerVal: UserProviderType = {
    userId,
    setUserId,
    userFN,
    setUserFN,
    userLN,
    setUserLN,
    profilePic,
    setProfilePic,
    authStatus,
    setAuthStatus,
  };

  return (
    <UserContext.Provider value={providerVal}>{children}</UserContext.Provider>
  );
};
