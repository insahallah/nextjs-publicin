"use client";

import { useEffect, useState } from "react";
import AwesomeAuthModal from "./AwesomeAuthModal";

export default function AuthGuard({ children }) {
  const [authenticated, setAuthenticated] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    const handler = (e) => {
      console.log("openLoginModalFromBusiness event received:", e?.detail);
      setShowLogin(true);
    };

    window.addEventListener("openLoginModalFromBusiness", handler);

    const token = localStorage.getItem("user_token");
    const mobileNumber = localStorage.getItem("user_mobile");

    if (token) {
      setAuthenticated(true);
      setMobile(mobileNumber || "");
    } else {
      setAuthenticated(false);
      setShowLogin(true);
    }

    return () =>
      window.removeEventListener("openLoginModalFromBusiness", handler);
  }, []);

  const handleLoginSuccess = (mobileNumber) => {
    console.log("Login success, mobile:", mobileNumber);

    localStorage.setItem("user_token", "token_123456");
    localStorage.setItem("user_mobile", mobileNumber);

    setMobile(mobileNumber);
    setAuthenticated(true);
    setShowLogin(false);
  };

  if (authenticated === null) return null;

  if (!authenticated) {
    return (
      <AwesomeAuthModal
        open={showLogin}
        onClose={() => {}}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return <>{children}</>;
}
