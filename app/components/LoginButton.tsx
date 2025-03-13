"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import Image from "next/image";

const LoginButton = () => {
  const { user, signOut } = useAuth();

  // Function to get user's display name
  const getUserDisplayName = () => {
    if (!user) return "";

    // Try to get name from user metadata if available
    if (user.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user.user_metadata?.name) return user.user_metadata.name;

    // Fall back to email (show only part before @)
    if (user.email) {
      const emailParts = user.email.split("@");
      return emailParts[0];
    }

    return "User";
  };

  // If user is logged in, show profile button that redirects to profile page
  if (user) {
    const displayName = getUserDisplayName();
    const hasProfileImage = user.user_metadata?.avatar_url;

    return (
      <div className="absolute top-4 lg:top-24 lg:right-8 right-4 z-10">
        <Link href="/profile">
          <button className="border-2 border-gray text-black font-semibold py-2 px-6 rounded-full transition-all duration-300 flex items-center">
            <span className="mr-2">{displayName}</span>
            {hasProfileImage ? (
              <Image
                src={user.user_metadata.avatar_url}
                alt="Profile"
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </Link>
      </div>
    );
  }

  // If user is not logged in, show login button
  return (
    <div className="absolute top-4 lg:top-24 lg:right-8 right-4 z-10">
      <Link href="/login">
        <button className="bg-[#3042FB] hover:bg-[#4c5bff] text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 flex items-center">
          <span>Entrar</span>
          <svg
            className="w-4 h-4 ml-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </Link>
    </div>
  );
};

export default LoginButton;
