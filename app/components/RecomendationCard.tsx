import React, { useState, useEffect } from "react";
import checkmark from "../checkmark.png";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import CommentDrawer from "./CommentDrawer";

interface ProductInfo {
  img: string;
  source: string;
  oldPrice: string;
  name: string;
  price: string;
  url: string;
  comment_count?: number;
  like_count?: number;
  created_at?: string; // ISO date string
}

interface RecomendationCardProps {
  productInfo: ProductInfo;
  onComment?: () => void;
  onFavorite?: (isLiked: boolean) => void;
}

const RecomendationCard: React.FC<RecomendationCardProps> = ({
  productInfo,
  onComment = () => {},
  onFavorite = () => {},
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(
    productInfo.like_count || 0
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);

  // Use the auth context to check if the user is authenticated
  const { user } = useAuth();

  // Update local like count when prop changes
  useEffect(() => {
    setLocalLikeCount(productInfo.like_count || 0);
  }, [productInfo.like_count]);

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCommentDrawerOpen(true);
    onComment();
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if the user is authenticated
    if (!user) {
      // Show the auth modal instead of an alert
      setIsAuthModalOpen(true);
      return;
    }

    console.log("Like button clicked:", {
      productId: productInfo.url,
      currentLikeCount: localLikeCount,
      currentLikedState: isLiked,
    });

    // Toggle like state
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    // Update local like count
    setLocalLikeCount((prev) =>
      newLikedState ? prev + 1 : Math.max(prev - 1, 0)
    );

    console.log("Setting new like state:", {
      newLikedState,
      newLikeCount: newLikedState
        ? localLikeCount + 1
        : Math.max(localLikeCount - 1, 0),
    });

    // The parent will handle authentication and actual DB update
    onFavorite(newLikedState);
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "2 dias atrás"; // Default fallback

    const createdDate = new Date(dateString);
    const now = new Date();

    // Reset time part for accurate day comparison
    const createdDay = new Date(
      createdDate.getFullYear(),
      createdDate.getMonth(),
      createdDate.getDate()
    );
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate difference in days
    const diffTime = today.getTime() - createdDay.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "hoje";
    if (diffDays === 1) return "ontem";
    return `${diffDays} dias atrás`;
  };

  const like_count = localLikeCount;
  const comment_count = productInfo.comment_count || 0;

  return (
    <>
      <a
        href={productInfo.url}
        target="_blank"
        id="RecomendationCard"
        className="text-left border border-gray-200 rounded-md max-w-[260px] relative block overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex aspect-square justify-center items-center bg-white">
          <img
            className="max-w-48 max-h-48 my-auto mx-auto p-3 object-contain"
            src={productInfo.img}
            alt={productInfo.name}
          />
        </div>

        <div className="p-2 bg-white">
          <div className="flex items-center mb-1">
            <img
              className="w-4 h-4 inline rounded-sm mr-1"
              src={`https://s2.googleusercontent.com/s2/favicons?domain=www.${productInfo.source.replace(
                " ",
                ""
              )}.com`}
              alt={productInfo.source}
            />

            <span className="font-black text-[#4f4f4f] leading-none text-sm">
              {productInfo.source}
            </span>

            <img
              src={checkmark.src}
              className="w-[12px] h-[12px] inline-block ml-1"
              alt="checkmark"
            />
          </div>

          <h2 className="text-left font-black text-lg truncate mb-2">
            {productInfo.name}
          </h2>

          <div className="pb-1">
            <div className="flex">
              <span className="inline-block font-black text-xl text-[#3042FB]">
                R${" "}
                {Number(productInfo.price).toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="ml-2 inline-block truncate font-extrabold text-base text-[#FF2E12] leading-none mt-1">
                {Math.floor(
                  Number(productInfo.oldPrice) - Number(productInfo.price)
                ) < 1
                  ? null
                  : `-${Math.floor(
                      (Number(productInfo.oldPrice) -
                        Number(productInfo.price)) /
                        (Number(productInfo.oldPrice) / 100)
                    )}%`}
              </span>
            </div>
            {/* change hidden to flex to show likes, comments and date it was created */}
            <div className="hidden items-center mt-2 justify-between">
              <div className="text-xs text-[#666] font-medium">
                {getTimeAgo(productInfo.created_at)}
              </div>
              <div className="flex items-center">
                <div className="flex items-center">
                  <button
                    onClick={handleFavoriteClick}
                    className="p-1 text-[#666] hover:text-gray-900 transition-colors"
                    aria-label="Favorite"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      className={`w-4 h-4 ${
                        isLiked ? "fill-[#3042FB]" : "fill-[#666]"
                      }`}
                    >
                      {isLiked ? (
                        // Filled heart icon when liked
                        <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                      ) : (
                        // Outline heart icon when not liked
                        <path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20-.1-.1s0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5l0 3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2l0-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" />
                      )}
                    </svg>
                  </button>
                  {like_count > 0 && (
                    <span className="text-xs text-[#666] font-medium ml-0.5">
                      {like_count}
                    </span>
                  )}
                </div>
                <div className="flex items-center ml-2">
                  <button
                    onClick={handleCommentClick}
                    className="p-1 text-[#666] hover:text-gray-900 transition-colors"
                    aria-label="Comment"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      className="w-4 h-4 fill-[#666]"
                    >
                      <path d="M160 368c26.5 0 48 21.5 48 48l0 16 72.5-54.4c8.3-6.2 18.4-9.6 28.8-9.6L448 368c8.8 0 16-7.2 16-16l0-288c0-8.8-7.2-16-16-16L64 48c-8.8 0-16 7.2-16 16l0 288c0 8.8 7.2 16 16 16l96 0zm48 124l-.2 .2-5.1 3.8-17.1 12.8c-4.8 3.6-11.3 4.2-16.8 1.5s-8.8-8.2-8.8-14.3l0-21.3 0-6.4 0-.3 0-4 0-48-48 0-48 0c-35.3 0-64-28.7-64-64L0 64C0 28.7 28.7 0 64 0L448 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64l-138.7 0L208 492z" />
                    </svg>
                  </button>
                  {comment_count > 0 && (
                    <span className="text-xs text-[#666] font-medium ml-0.5">
                      {comment_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <CommentDrawer
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        productInfo={productInfo}
      />
    </>
  );
};

export default RecomendationCard;
