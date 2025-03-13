import React from "react";

interface BlogCardProps {
  href: string;
  image: {
    src: string;
    alt: string;
  };
  category: {
    name: string;
    icon: React.ReactNode;
  };
  createdAt: string | Date;
  title: string;
  description: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  href,
  image,
  category,
  createdAt,
  title,
  description,
}) => {
  const formatDate = (date: string | Date) => {
    const postDate = new Date(date);
    const now = new Date();

    // Reset hours to compare just the dates
    postDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - postDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears >= 1) {
      return postDate.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? "mês" : "meses"} atrás`;
    } else if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? "dia" : "dias"} atrás`;
    } else {
      return "Hoje";
    }
  };

  return (
    <a
      href={href}
      className="cursor-pointer transition-transform duration-300 hover:scale-105"
    >
      <article className="p-4 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
        <img
          className="mb-3 rounded-lg w-full h-48 object-cover"
          src={image.src}
          alt={image.alt}
        />
        <div className="flex justify-between items-center mb-3 text-gray-500">
          <span className="bg-primary-100 text-primary-800 text-xs font-medium inline-flex items-center px-2 py-0.5 rounded dark:bg-primary-200 dark:text-primary-800">
            {category.icon}
            {category.name}
          </span>
          <span className="text-xs">{formatDate(createdAt)}</span>
        </div>
        <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="mb-3 text-sm font-light text-gray-500 dark:text-gray-400">
          {description}
        </p>
        <div className="flex justify-end items-center">
          <span className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-500">
            Continue lendo
            <svg
              className="ml-1 w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </span>
        </div>
      </article>
    </a>
  );
};

export default BlogCard;
