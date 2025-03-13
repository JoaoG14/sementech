"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import RecomendationCard from "./RecomendationCard";
import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "../contexts/AuthContext";

// Define the product interface
interface Product {
  id: string;
  img: string;
  source: string;
  oldPrice: string;
  name: string;
  price: string;
  url: string;
  created_at?: string;
  like_count?: number;
  comment_count?: number;
}

const Recommended = () => {
  return (
    <div className="mb-2 text-center">
      <h1 className="mt-36 mx-auto m-3 mb-6 font-black text-center text-xl">
        Achadinhos pra você
      </h1>
      <LazyLoadProducts />
    </div>
  );
};

// Lazy Load Products component that fetches data as user scrolls
const LazyLoadProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const productsPerPage = 50;
  // Track loaded product IDs to prevent duplicates
  const [loadedProductIds, setLoadedProductIds] = useState<Set<string>>(
    new Set()
  );
  // Use the auth context instead of managing our own auth state
  const { user } = useAuth();

  // Create Supabase client using auth-helpers-nextjs instead of direct createClient
  const supabase = createClientComponentClient();

  // Log authentication status on component mount
  useEffect(() => {
    console.log("Auth status from AuthContext:", {
      isAuthenticated: !!user,
      userId: user?.id || "not logged in",
    });
  }, [user]);

  // Function to fetch products from Supabase
  const fetchProducts = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);

    try {
      // Calculate range for pagination
      const from = page * productsPerPage;
      const to = from + productsPerPage - 1;

      // Fetch products with pagination
      const { data, error, count } = await supabase
        .from("recommended")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching products:", error);
        return;
      }

      if (data && data.length > 0) {
        // Filter out any products that have already been loaded
        const newProducts = data.filter(
          (product) => !loadedProductIds.has(product.id)
        );

        if (newProducts.length > 0) {
          // Update the set of loaded product IDs
          const newIds = new Set(loadedProductIds);
          newProducts.forEach((product) => newIds.add(product.id));
          setLoadedProductIds(newIds);

          // Add new unique products to the existing array
          setProducts((prevProducts) => [...prevProducts, ...newProducts]);
        }

        setPage((prevPage) => prevPage + 1);
      }

      // Check if we've reached the end of the data
      if (
        data &&
        (data.length < productsPerPage ||
          (count && from + data.length >= count))
      ) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error in fetchProducts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading, supabase, productsPerPage, loadedProductIds]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Setup Intersection Observer for infinite scroll
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        fetchProducts();
      }
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, isLoading, fetchProducts]);

  // Function to handle authentication before liking
  const handleLike = async (product: Product, isLiked: boolean) => {
    try {
      console.log("handleLike called with:", {
        productId: product.id,
        isLiked,
        currentUser: user?.id || "not logged in",
      });

      // Check if user is authenticated
      if (!user) {
        // Redirect to login or show login modal
        alert("Please log in to like products");
        // You could redirect to login page or show a modal here
        return;
      }

      // Calculate the new like count based on the isLiked state
      const newLikeCount = isLiked
        ? (product.like_count || 0) + 1
        : Math.max((product.like_count || 0) - 1, 0);

      console.log("Attempting to update like_count:", {
        productId: product.id,
        oldCount: product.like_count || 0,
        newCount: newLikeCount,
        userId: user.id,
      });

      // First, let's check if we can read the product (to test RLS read policies)
      const { data: readData, error: readError } = await supabase
        .from("recommended")
        .select("*")
        .eq("id", product.id)
        .single();

      console.log("RLS read check:", {
        success: !readError,
        canRead: !!readData,
        error: readError ? readError.message : null,
        data: readData,
      });

      // Update the like count in Supabase
      const { data, error } = await supabase
        .from("recommended")
        .update({ like_count: newLikeCount })
        .eq("id", product.id)
        .select();

      console.log("Supabase update response:", {
        success: !error,
        data,
        error: error
          ? { message: error.message, code: error.code, details: error.details }
          : null,
      });

      if (error) {
        console.error("Error updating like count:", error);

        // If there's an error, let's try to get more information about the current user and session
        try {
          // Check current auth status
          const { data: session } = await supabase.auth.getSession();
          console.log("Current session during error:", {
            hasSession: !!session.session,
            accessToken: session.session?.access_token ? "present" : "missing",
            userId: session.session?.user?.id || "no user id",
          });

          // Try to get RLS context if the function exists
          try {
            const { data: rls_context, error: rls_error } = await supabase.rpc(
              "get_my_claims"
            );
            console.log("RLS context check:", {
              success: !rls_error,
              context: rls_context,
              error: rls_error ? rls_error.message : null,
            });
          } catch (rpcError) {
            console.log(
              "RLS context check failed - function may not exist:",
              rpcError
            );
          }
        } catch (authError) {
          console.error("Failed to check auth status during error:", authError);
        }

        return;
      }

      // Update local state to reflect the change
      if (data && data.length > 0) {
        console.log("Successfully updated product in database:", data[0]);
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p.id === product.id ? { ...p, like_count: newLikeCount } : p
          )
        );
      } else {
        console.warn(
          "No data returned from update operation. RLS might be blocking the operation."
        );
      }
    } catch (error) {
      console.error("Error in like handler:", error);
    }
  };

  // Filter out duplicates before rendering
  const uniqueProducts = products.filter(
    (product, index, self) =>
      index === self.findIndex((p) => p.id === product.id)
  );

  return (
    <>
      {products.length === 0 && !isLoading ? (
        <div className="text-gray-500 mb-32">
          Nenhum achado disponível no momento.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mx-auto px-2 w-full max-w-[1200px] mb-8">
          {uniqueProducts.map((product, index) => (
            <div key={product.id || `product-${product.name}-${index}`}>
              <RecomendationCard
                productInfo={{
                  img: product.img,
                  source: product.source,
                  oldPrice: product.oldPrice,
                  name: product.name,
                  price: product.price,
                  url: product.url,
                  created_at: product.created_at,
                  like_count: product.like_count || 0,
                  comment_count: product.comment_count || 0,
                }}
                onFavorite={(isLiked) => handleLike(product, isLiked)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Loading spinner */}
      {hasMore && (
        <div
          ref={loaderRef}
          className="flex justify-center items-center py-4 mb-32"
        >
          {isLoading ? (
            <div className="loader">
              <div className="w-10 h-10 border-4 border-[#3042FB] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="h-10">
              {/* Placeholder to keep the observer visible */}
            </div>
          )}
        </div>
      )}

      {/* End message */}
      {!hasMore && products.length > 0 && (
        <div className="text-gray-500 mb-32">
          Você viu todas as ofertas disponíveis!
        </div>
      )}
    </>
  );
};

export default Recommended;
