import React from "react";
import Image from "next/image";
import Link from "next/link";

const LatestPosts = () => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Você pode gostar</h3>
      <div className="space-y-4">
        {/* Latest Post Cards */}
        <div className="bg-white p-4 rounded-lg shadow">
          <Image
            src="/images/futon-sofa.jpg"
            alt="Futon couch"
            width={300}
            height={200}
            className="rounded-lg mb-2 object-cover w-full"
          />
          <h4 className="font-semibold mb-2">
            <Link href="/blog/futon-guide" className="hover:text-blue-600">
              What Is a Futon Couch? A Practical Solution
            </Link>
          </h4>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <Image
            src="/images/outdoor-sofa.jpg"
            alt="Outdoor sofa"
            width={300}
            height={200}
            className="rounded-lg mb-2 object-cover w-full"
          />
          <h4 className="font-semibold mb-2">
            <Link
              href="/blog/outdoor-sofa-guide"
              className="hover:text-blue-600"
            >
              Your Guide to the Best Outdoor Sofa
            </Link>
          </h4>
        </div>
      </div>
    </div>
  );
};

export default LatestPosts;
