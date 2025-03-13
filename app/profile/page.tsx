"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Spinner from "../components/Spinner";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import NavBar from "../components/NavBar";

const ProfilePage = () => {
  const supabase = createClientComponentClient();
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<{
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    created_at: string | null;
    updated_at: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError("No authenticated session");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          throw error;
        }

        console.log("Profile data retrieved:", data);

        setProfile(data);
        setFormData({
          name: data.name || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching your profile"
        );
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [supabase]);

  // Function to get avatar URL from auth user metadata
  const getAuthUserAvatar = () => {
    if (authUser?.user_metadata?.avatar_url) {
      return authUser.user_metadata.avatar_url;
    }
    return null;
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during logout"
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);

      // Prepare the data to save
      const dataToUpdate = {
        name: formData.name,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(dataToUpdate)
        .eq("id", profile.id);

      if (error) throw error;

      // Update local state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: formData.name,
              updated_at: new Date().toISOString(),
            }
          : null
      );

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while updating your profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <Spinner message="Carregando perfil..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-Mulish">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full border border-gray-200">
          <div className="text-red-500 mb-4 text-center">
            <h2 className="text-xl font-bold mb-2">Erro ao carregar perfil</h2>
            <p className="mb-4">{error}</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#3042FB] hover:bg-[#4c5bff] text-white px-4 py-2 rounded-full transition-colors font-semibold"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get avatar URL from auth user metadata or profile
  const avatarUrl = getAuthUserAvatar() || profile?.avatar_url;

  // Format the account creation date in a friendly way
  const getJoinedDate = () => {
    if (!profile?.created_at) return "";

    const date = new Date(profile.created_at);
    const month = date.toLocaleString("pt-BR", { month: "long" });
    const year = date.getFullYear();

    // Capitalize the first letter of the month
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

    return `Entrou em ${capitalizedMonth} de ${year}`;
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-Mulish">
        <div className="max-w-3xl mx-auto">
          {/* Navigation */}
          <div className="mb-8">
            <Link
              href="/"
              className="text-[#3042FB] font-semibold flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Voltar para a página inicial
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              {/* Logout button - visible on mobile at top right */}
              <div className="flex justify-end mb-4 sm:hidden">
                <button
                  onClick={handleLogout}
                  className="bg-white text-red-600 border border-red-600 hover:bg-red-50 px-4 py-2 rounded-full transition-colors font-semibold"
                >
                  Sair
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12"
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
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  {isEditing ? (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3042FB] focus:border-[#3042FB]"
                        placeholder="Seu nome"
                      />
                    </div>
                  ) : (
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {profile?.name || "Usuário"}
                    </h1>
                  )}
                  <p className="text-gray-500">{profile?.email}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {getJoinedDate()}
                  </p>

                  {/* Edit/Save buttons for mobile - below profile info */}
                  <div className="mt-4 sm:hidden">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#3042FB] hover:bg-[#4c5bff] text-white px-4 py-2 rounded-full transition-colors font-semibold w-full"
                      >
                        Editar Perfil
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className={`bg-[#3042FB] hover:bg-[#4c5bff] text-white px-4 py-2 rounded-full transition-colors font-semibold flex-1 ${
                            isSaving ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                        >
                          {isSaving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: profile?.name || "",
                            });
                          }}
                          className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-full transition-colors font-semibold"
                          disabled={isSaving}
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons - visible on desktop */}
                <div className="hidden sm:flex flex-col sm:flex-row gap-2">
                  {!isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-[#3042FB] hover:bg-[#4c5bff] text-white px-4 py-2 rounded-full transition-colors font-semibold"
                      >
                        Editar Perfil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="bg-white text-red-600 border border-red-600 hover:bg-red-50 px-4 py-2 rounded-full transition-colors font-semibold"
                      >
                        Sair
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className={`bg-[#3042FB] hover:bg-[#4c5bff] text-white px-4 py-2 rounded-full transition-colors font-semibold ${
                          isSaving ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {isSaving ? "Salvando..." : "Salvar"}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: profile?.name || "",
                          });
                        }}
                        className="bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-full transition-colors font-semibold"
                        disabled={isSaving}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
