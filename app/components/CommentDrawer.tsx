"use client";

import React, { useRef, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ProductInfo {
  id?: string;
  img: string;
  source: string;
  oldPrice: string;
  name: string;
  price: string;
  url: string;
  comment_count?: number;
  like_count?: number;
  created_at?: string;
}

interface Comment {
  id: string;
  user_id: string;
  product_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  like_count?: number;
}

interface CommentWithProfile {
  id: string;
  user_id: string;
  product_id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productInfo: ProductInfo;
}

const CommentDrawer: React.FC<CommentDrawerProps> = ({
  isOpen,
  onClose,
  productInfo,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  // For swipe to close functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // The required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50;

  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      // Save the current body overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;

      // Prevent scrolling on the body
      document.body.style.overflow = "hidden";

      // Restore original overflow style when drawer closes
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchEnd - touchStart;
    const isDownSwipe = distance > minSwipeDistance;

    if (isDownSwipe) {
      onClose();
    }

    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Fetch comments when drawer opens
  useEffect(() => {
    if (isOpen && productInfo.id) {
      fetchComments();
    }
  }, [isOpen, productInfo.id]);

  const fetchComments = async () => {
    if (!productInfo.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          user_id,
          product_id,
          content,
          created_at,
          like_count,
          profiles:user_id (
            name,
            avatar_url
          )
        `
        )
        .eq("product_id", productInfo.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
        return;
      }

      // Format the comments with user information
      const formattedComments = data.map((comment: any) => ({
        id: comment.id,
        user_id: comment.user_id,
        product_id: comment.product_id,
        content: comment.content,
        created_at: comment.created_at,
        like_count: comment.like_count || 0,
        user_name: comment.profiles?.name || "Usuário",
        user_avatar: comment.profiles?.avatar_url || "",
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error("Error in fetchComments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!newComment.trim() || !productInfo.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          product_id: productInfo.id,
          content: newComment.trim(),
          like_count: 0,
        })
        .select(
          `
          id,
          user_id,
          product_id,
          content,
          created_at,
          like_count,
          profiles:user_id (
            name,
            avatar_url
          )
        `
        )
        .single();

      if (error) {
        console.error("Error adding comment:", error);
        return;
      }

      // Add the new comment to the list
      const newCommentObj: Comment = {
        id: data.id,
        user_id: data.user_id,
        product_id: data.product_id,
        content: data.content,
        created_at: data.created_at,
        like_count: 0,
        // Use type assertion to handle the profiles property correctly
        user_name: (data.profiles as any)?.name || "Usuário",
        user_avatar: (data.profiles as any)?.avatar_url || "",
      };

      setComments([newCommentObj, ...comments]);
      setNewComment("");

      // Update comment count in the product
      await supabase
        .from("recommended")
        .update({ comment_count: (productInfo.comment_count || 0) + 1 })
        .eq("id", productInfo.id);
    } catch (error) {
      console.error("Error in handleSubmitComment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Toggle like state
    const isLiked = likedComments.has(commentId);
    const newLikedComments = new Set(likedComments);

    if (isLiked) {
      newLikedComments.delete(commentId);
    } else {
      newLikedComments.add(commentId);
    }

    setLikedComments(newLikedComments);

    // Update comment in state
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          const newLikeCount = isLiked
            ? Math.max((comment.like_count || 0) - 1, 0)
            : (comment.like_count || 0) + 1;

          return { ...comment, like_count: newLikeCount };
        }
        return comment;
      })
    );

    // Update like count in database
    try {
      const comment = comments.find((c) => c.id === commentId);
      if (!comment) return;

      const newLikeCount = isLiked
        ? Math.max((comment.like_count || 0) - 1, 0)
        : (comment.like_count || 0) + 1;

      await supabase
        .from("comments")
        .update({ like_count: newLikeCount })
        .eq("id", commentId);
    } catch (error) {
      console.error("Error updating comment like:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Mobile: Bottom drawer, Desktop: Centered bottom drawer */}
      <div
        ref={drawerRef}
        className={`
          fixed z-50 bg-white shadow-xl overflow-y-auto
          
          /* Mobile styles (default) */
          bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-xl
          
          /* Desktop styles (md breakpoint and up) */
          md:bottom-0 md:left-1/2 md:-translate-x-1/2
          md:right-auto md:top-auto
          md:w-[900px] md:h-[85vh] md:rounded-t-xl md:rounded-b-none
        `}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Header with close button */}
        <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
          {/* Show handle only on mobile */}
          <div className="absolute left-1/2 -top-0 transform -translate-x-1/2 -translate-y-1/2 w-12 h-1.5 bg-gray-300 rounded-full md:hidden"></div>

          <h2 className="text-xl font-bold">Comentários</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
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
        </div>

        {/* Desktop layout: Two columns */}
        <div className="md:flex md:h-[calc(100%-65px)]">
          {/* Product Info - Left side on desktop */}
          <div className="p-4 border-b md:border-b-0 md:border-r md:w-1/3 md:overflow-y-auto md:h-full">
            <div className="flex flex-col items-start">
              <div className="w-full mb-4">
                <img
                  src={productInfo.img}
                  alt={productInfo.name}
                  className="object-cover rounded-md w-full h-auto max-h-[300px] object-center"
                />
              </div>
              <div className="w-full">
                <h3 className="font-bold text-lg md:text-xl line-clamp-2">
                  {productInfo.name}
                </h3>
                <div className="flex items-baseline mt-2">
                  <span className="font-bold text-[#3042FB] md:text-lg">
                    R$ {Number(productInfo.price).toLocaleString("pt-BR")}
                  </span>
                  {Number(productInfo.oldPrice) > Number(productInfo.price) && (
                    <span className="ml-2 text-sm md:text-base text-[#FF2E12] line-through">
                      R$ {Number(productInfo.oldPrice).toLocaleString("pt-BR")}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <a
                    href={productInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#3042FB] text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Ver produto
                  </a>
                </div>
                <div className="mt-3 text-sm text-gray-500">
                  Fonte: {productInfo.source}
                </div>
                {productInfo.created_at && (
                  <div className="mt-1 text-sm text-gray-500">
                    Adicionado em: {formatDate(productInfo.created_at)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section - Right side on desktop */}
          <div className="md:w-2/3 md:overflow-y-auto md:h-full">
            {/* Comment Form */}
            <div className="p-4 md:p-6 border-b">
              <form onSubmit={handleSubmitComment} className="flex flex-col">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um comentário..."
                  className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#3042FB] focus:border-transparent"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={isLoading || !newComment.trim()}
                  className="mt-2 bg-[#3042FB] text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed self-end"
                >
                  {isLoading ? "Enviando..." : "Comentar"}
                </button>
              </form>
            </div>

            {/* Comments List */}
            <div className="p-4 md:p-6">
              <h3 className="font-bold mb-4 md:text-lg">
                {comments.length}{" "}
                {comments.length === 1 ? "Comentário" : "Comentários"}
              </h3>

              {isLoading && comments.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3042FB]"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Seja o primeiro a comentar sobre este produto!
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold mr-3 overflow-hidden">
                          {comment.user_avatar ? (
                            <img
                              src={comment.user_avatar}
                              alt={comment.user_name || ""}
                              className="w-10 h-10 object-cover"
                            />
                          ) : (
                            comment.user_name?.charAt(0) || "U"
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{comment.user_name}</div>
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line mb-3">
                        {comment.content}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center space-x-4">
                          {/* Like button */}
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className="flex items-center text-gray-500 hover:text-gray-700"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill={
                                likedComments.has(comment.id)
                                  ? "currentColor"
                                  : "none"
                              }
                              stroke="currentColor"
                              className="w-5 h-5 mr-1"
                              strokeWidth="2"
                            >
                              <path d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                            </svg>
                            <span>{comment.like_count || 0}</span>
                          </button>

                          {/* Reply button */}
                          <button className="flex items-center text-gray-500 hover:text-gray-700">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5 mr-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                              />
                            </svg>
                            <span>responder</span>
                          </button>
                        </div>

                        {/* Report button */}
                        <button className="text-gray-500 hover:text-gray-700 text-sm">
                          denunciar
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {formatDate(comment.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default CommentDrawer;
