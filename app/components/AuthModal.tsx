"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSignUp = () => {
    router.push("/signup");
    onClose();
  };

  const handleLogin = () => {
    router.push("/login");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Conta necessária
          </h3>
          <p className="text-gray-600">
            Você precisa de uma conta para curtir produtos e salvar seus
            favoritos.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleSignUp}
            className="w-full bg-[#3042FB] text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Criar conta
          </button>
          <button
            onClick={handleLogin}
            className="w-full bg-white text-[#3042FB] border border-[#3042FB] py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Já tenho uma conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
