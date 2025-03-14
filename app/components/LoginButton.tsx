"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";

const LoginButton = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="absolute top-6 right-6 md:top-8 md:right-8 lg:top-10 lg:right-16">
      {user ? (
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="text-[#7DCB2D] hover:text-[#9ae44a] font-semibold flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Meu Perfil
          </Link>
          <button
            onClick={handleLogout}
            className="text-[#7DCB2D] hover:text-[#9ae44a] font-medium"
          >
            Sair
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="text-[#7DCB2D] hover:text-[#9ae44a] font-medium flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Entrar
        </button>
      )}
    </div>
  );
};

export default LoginButton;
