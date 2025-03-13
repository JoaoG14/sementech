import React from "react";
import TopBar from "../components/TopBar";
import BlogCard from "../components/BlogCard";

const Blog = () => {
  const blogPosts = [
    {
      href: "/blog/sofa-mais-confortavel",
      image: {
        src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
        alt: "Laptop with code on screen",
      },
      category: {
        name: "Tutorial",
        icon: (
          <svg
            className="mr-1 w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
          </svg>
        ),
      },
      createdAt: "2024-01-15",
      title: "O que faz um ser confortável?",
      description:
        "Static websites are now used to bootstrap lots of websites and are becoming the basis for a variety of tools that even influence both web designers and developers.",
    },
    {
      href: "#",
      image: {
        src: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
        alt: "React code on screen",
      },
      category: {
        name: "Article",
        icon: (
          <svg
            className="mr-1 w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
              clip-rule="evenodd"
            ></path>
            <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"></path>
          </svg>
        ),
      },
      createdAt: "2023-12-25",
      title: "10 Sofás Bons e Baratos",
      description:
        "Static websites are now used to bootstrap lots of websites and are becoming the basis for a variety of tools that even influence both web designers and developers.",
    },
    {
      href: "#",
      image: {
        src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
        alt: "Code editor with colorful syntax",
      },
      category: {
        name: "Article",
        icon: (
          <svg
            className="mr-1 w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
              clip-rule="evenodd"
            ></path>
            <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"></path>
          </svg>
        ),
      },
      createdAt: "2023-03-10",
      title: "Our first project with React",
      description:
        "Static websites are now used to bootstrap lots of websites and are becoming the basis for a variety of tools that even influence both web designers and developers.",
    },
  ];

  return (
    <>
      <TopBar />
      <section className="bg-white dark:bg-gray-900">
        <div className="py-4 px-4 mx-auto max-w-screen-lg lg:py-8 lg:px-4">
          <div className="mx-auto max-w-screen-sm text-center mb-6">
            <h2 className="mb-3 text-2xl lg:text-3xl tracking-tight font-bold text-gray-900 dark:text-white">
              Blog
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {blogPosts.map((post, index) => (
              <BlogCard key={index} {...post} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;
