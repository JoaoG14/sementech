export const maxDuration = 300;

import { NextResponse } from "next/server";
import { seeds } from "../../shared/seeds";

// Define types for embeddings and results
type ImageEmbedding = number[];

interface SeedMatch {
  id: string;
  similarityScore: number;
}

interface ComparisonResult {
  matches: SeedMatch[];
}

// Load the transformers library
const loadTransformers = async () => {
  const { pipeline } = await import("@xenova/transformers");
  return { pipeline };
};

// Calculate cosine similarity between two vectors
const cosineSimilarity = (
  vecA: ImageEmbedding,
  vecB: ImageEmbedding
): number => {
  if (vecA.length !== vecB.length) return 0;

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

// Process image comparison
const processImageComparison = async (
  imageUrl: string
): Promise<ComparisonResult> => {
  // Load transformers
  const { pipeline } = await loadTransformers();

  // Create feature extractor
  const featureExtractor = await pipeline(
    "image-feature-extraction",
    "Xenova/clip-vit-base-patch32"
  );

  // Extract features from uploaded image
  const uploadedFeatures = await featureExtractor(imageUrl);
  const uploadedEmbedding = Array.from(uploadedFeatures.data);

  // Process seeds in batches to avoid memory issues
  const BATCH_SIZE = 10;
  const MAX_SEEDS = 50;
  const totalSeeds = Math.min(seeds.length, MAX_SEEDS);

  const matches: SeedMatch[] = [];

  for (let i = 0; i < totalSeeds; i += BATCH_SIZE) {
    const batchEnd = Math.min(i + BATCH_SIZE, totalSeeds);
    const batch = seeds.slice(i, batchEnd);

    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (seed) => {
        try {
          // Extract features from seed image
          const seedFeatures = await featureExtractor(seed.img);
          const seedEmbedding = Array.from(seedFeatures.data);

          // Calculate similarity
          const similarity = cosineSimilarity(uploadedEmbedding, seedEmbedding);

          return {
            id: seed.id,
            similarityScore: similarity,
          };
        } catch (error) {
          console.error(`Error processing seed ${seed.id}:`, error);
          return {
            id: seed.id,
            similarityScore: 0,
          };
        }
      })
    );

    // Add batch results to matches
    matches.push(...batchResults);

    // Early exit if we have enough good matches
    const goodMatches = matches.filter((m) => m.similarityScore > 0.85);
    if (i > 30 && goodMatches.length > 3) {
      break;
    }
  }

  // Sort matches by similarity score (highest first)
  matches.sort((a, b) => b.similarityScore - a.similarityScore);

  return {
    matches: matches.slice(0, 20), // Return top 20 matches
  };
};

// POST endpoint for image comparison
export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    console.log(
      "Processing image comparison for URL:",
      imageUrl.substring(0, 50) + "..."
    );

    // Process image comparison and return results directly
    const result = await processImageComparison(imageUrl);

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in image comparison:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to process image comparison",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
