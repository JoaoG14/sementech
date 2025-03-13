import React from "react";
import TopBar from "../../components/TopBar";
import Image from "next/image";
import LatestPosts from "../../components/LatestPosts";

const SofaMaisConfortavel = () => {
  return (
    <>
      <TopBar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Latest Posts Sidebar */}
          <div className="lg:w-1/3 order-2 lg:order-1">
            <LatestPosts />
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3 order-1 lg:order-2">
            <h1 className="text-3xl font-bold mb-6">
              What Makes a Sofa Truly Comfortable
            </h1>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Key Features of Comfortable Sofas
              </h2>
              <p className="text-gray-700 mb-4">
                Comfortable sofas are distinguished by their thoughtful design
                elements that enhance both comfort and style. Quality cushioning
                creates a welcoming seat, while proper support from the frame
                ensures long-lasting comfort. The right balance of firmness and
                softness in the seating makes a significant difference in daily
                use.
              </p>
              <div className="relative h-64 mb-4">
                <Image
                  src="/images/comfortable-sofa.jpg"
                  alt="A comfortable modern sofa"
                  fill
                  className="rounded-lg object-cover"
                />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                Materials That Make a Difference
              </h2>
              <p className="text-gray-700 mb-4">
                The choice of materials plays a crucial role in a sofas comfort
                level. High-density foam cores wrapped in softer materials
                provide the perfect combination of support and comfort. Premium
                upholstery fabrics not only feel good to touch but also
                contribute to the sofas durability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Design Considerations</h2>
              <p className="text-gray-700 mb-4">
                A truly comfortable sofa combines ergonomic design with
                aesthetic appeal. The depth of the seat, height of the backrest,
                and angle of recline all contribute to overall comfort. Modern
                sofas often feature adjustable elements to accommodate different
                preferences and uses.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default SofaMaisConfortavel;
