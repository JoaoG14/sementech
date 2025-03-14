"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
  return (
    <HotToaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 5000,
        style: {
          background: "#fff",
          color: "#363636",
          maxWidth: "500px",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
        },
        // Custom styles for each toast type
        success: {
          style: {
            background: "#f0fdf4",
            border: "1px solid #86efac",
          },
          iconTheme: {
            primary: "#22c55e",
            secondary: "#fff",
          },
        },
        error: {
          style: {
            background: "#fef2f2",
            border: "1px solid #fca5a5",
          },
          iconTheme: {
            primary: "#ef4444",
            secondary: "#fff",
          },
        },
        loading: {
          style: {
            background: "#f0f9ff",
            border: "1px solid #93c5fd",
          },
        },
      }}
    />
  );
}
