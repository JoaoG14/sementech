"use client"

import React, { useState, useEffect } from 'react';

interface Product {
  title: string;
  price: string;
  source: string;
  url: string;
  img?: string;
}

interface ScraperData {
  googleShoppingResults: Product[];
  googleLensResults: Product[];
}

const Page: React.FC = () => {
  const [data, setData] = useState<ScraperData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://pexinxas-backend.onrender.com/scrape');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result: ScraperData = await response.json();
      setData(result);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Product Scraper Results</h1>
      {data && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Google Shopping Results:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.googleShoppingResults.map((item, index) => (
              <ProductCard key={index} product={item} />
            ))}
          </div>
          
          <h2 className="text-xl font-semibold mb-2 mt-8">Google Lens Results:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.googleLensResults.map((item, index) => (
              <ProductCard key={index} product={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => (
  <div className="border p-4 rounded">
    <h3 className="font-bold">{product.title}</h3>
    <p>Price: {product.price}</p>
    <p>Source: {product.source}</p>
    <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">View Product</a>
  </div>
);

export default Page;