import { NextResponse } from "next/server";
import { seeds } from "../../shared/seeds";

// Define types for embeddings
type ImageEmbedding = number[];
type FeatureExtractorOutput = {
  data: Float32Array | number[];
};

// Import the transformers library at runtime
const loadTransformers = async () => {
  const { pipeline } = await import("@xenova/transformers");
  return { pipeline };
};

// Process a single image and get its embedding
const getImageEmbedding = async (
  imageUrl: string,
  featureExtractor: any
): Promise<ImageEmbedding | null> => {
  try {
    const features = (await featureExtractor(
      imageUrl
    )) as FeatureExtractorOutput;
    return Array.from(features.data);
  } catch (error) {
    console.error(`Error extracting features from ${imageUrl}:`, error);
    return null;
  }
};

// Calculate cosine similarity between two vectors
const cosineSimilarity = (
  vecA: ImageEmbedding | null,
  vecB: ImageEmbedding | null
): number => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Process seeds in batches to avoid memory issues
const processBatch = async (
  seeds: any[],
  uploadedImageEmbedding: ImageEmbedding,
  featureExtractor: any,
  startIndex: number,
  batchSize: number
) => {
  const endIndex = Math.min(startIndex + batchSize, seeds.length);
  const batch = seeds.slice(startIndex, endIndex);

  const results = await Promise.all(
    batch.map(async (seed) => {
      try {
        const seedImageEmbedding = await getImageEmbedding(
          seed.img,
          featureExtractor
        );
        const similarity = cosineSimilarity(
          uploadedImageEmbedding,
          seedImageEmbedding
        );

        return {
          id: seed.id,
          name: seed.name,
          similarityScore: similarity,
          imageUrl: seed.img,
        };
      } catch (error) {
        console.error(`Error processing seed ${seed.id}:`, error);
        return {
          id: seed.id,
          name: seed.name,
          similarityScore: 0,
          imageUrl: seed.img,
        };
      }
    })
  );

  return results;
};

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Load the transformers library
    const { pipeline } = await loadTransformers();

    // Create the feature extractor
    const featureExtractor = await pipeline(
      "image-feature-extraction",
      "Xenova/clip-vit-base-patch32"
    );

    // Get embedding for the uploaded image
    const uploadedImageEmbedding = await getImageEmbedding(
      imageUrl,
      featureExtractor
    );

    if (!uploadedImageEmbedding) {
      return NextResponse.json(
        { error: "Failed to process the uploaded image" },
        { status: 500 }
      );
    }

    // Process seeds in batches
    const BATCH_SIZE = 5;
    const results = [];

    for (let i = 0; i < seeds.length; i += BATCH_SIZE) {
      const batchResults = await processBatch(
        seeds,
        uploadedImageEmbedding,
        featureExtractor,
        i,
        BATCH_SIZE
      );

      results.push(...batchResults);
    }

    // Sort results by similarity score (highest first)
    const sortedResults = results.sort(
      (a, b) => b.similarityScore - a.similarityScore
    );

    // Categorize results based on similarity thresholds
    const bestMatches = sortedResults.filter(
      (item) => item.similarityScore > 0.9
    );
    const goodMatches = sortedResults.filter(
      (item) => item.similarityScore > 0.8 && item.similarityScore <= 0.9
    );
    const possibleMatches = sortedResults.filter(
      (item) => item.similarityScore > 0.7 && item.similarityScore <= 0.8
    );

    // Return categorized results
    return NextResponse.json({
      bestMatches,
      goodMatches,
      possibleMatches,
      allResults: sortedResults,
    });
  } catch (error) {
    console.error("Error in image comparison:", error);
    return NextResponse.json(
      { error: "Failed to process image comparison" },
      { status: 500 }
    );
  }
}
