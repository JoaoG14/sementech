import { NextResponse } from "next/server";
import { seeds } from "../../shared/seeds";

// Define types for embeddings and results
type ImageEmbedding = number[];
type FeatureExtractorOutput = {
  data: Float32Array | number[];
};

interface SeedMatch {
  id: string;
  name: string;
  similarityScore: number;
  imageUrl: string;
}

interface SimilarityResults {
  bestMatches: SeedMatch[];
  goodMatches: SeedMatch[];
  possibleMatches: SeedMatch[];
  allResults: SeedMatch[];
}

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
        // Extract features from seed image
        const seedFeatures = (await featureExtractor(
          seed.img
        )) as FeatureExtractorOutput;
        const seedImageEmbedding = Array.from(seedFeatures.data);

        // Calculate similarity
        const similarity = cosineSimilarity(
          uploadedImageEmbedding,
          seedImageEmbedding
        );

        return {
          seed,
          similarity,
        };
      } catch (error) {
        console.error(`Error processing seed ${seed.id}:`, error);
        return {
          seed,
          similarity: 0,
        };
      }
    })
  );

  return results;
};

// Process similarity in parallel with early exit conditions
const processParallelSimilarity = async (
  seeds: any[],
  imageUrl: string,
  featureExtractor: any
): Promise<SimilarityResults> => {
  const results: SimilarityResults = {
    bestMatches: [],
    goodMatches: [],
    possibleMatches: [],
    allResults: [],
  };

  const BATCH_SIZE = 5; // Process 5 seeds simultaneously
  const MAX_SEEDS = 45;
  const totalSeeds = Math.min(seeds.length, MAX_SEEDS);

  // Get image embedding for uploaded image once
  const uploadedFeatures = (await featureExtractor(
    imageUrl
  )) as FeatureExtractorOutput;
  const uploadedImageEmbedding = Array.from(uploadedFeatures.data);

  // Process seeds in batches
  for (let i = 0; i < totalSeeds; i += BATCH_SIZE) {
    const batchResults = await processBatch(
      seeds,
      uploadedImageEmbedding,
      featureExtractor,
      i,
      BATCH_SIZE
    );

    // Categorize results
    for (const { seed, similarity } of batchResults) {
      // Add similarity score to the seed object
      const seedWithSimilarity: SeedMatch = {
        id: seed.id,
        name: seed.name,
        similarityScore: similarity,
        imageUrl: seed.img,
      };

      // Categorize based on similarity thresholds matching the original code
      if (similarity > 0.9) {
        results.bestMatches.push(seedWithSimilarity);
      } else if (similarity > 0.87) {
        results.goodMatches.push(seedWithSimilarity);
      } else if (similarity > 0.67) {
        results.possibleMatches.push(seedWithSimilarity);
      }

      // Add to all results
      results.allResults.push(seedWithSimilarity);
    }

    // Early exit condition - if we have enough good matches after processing 30+ seeds
    if (i > 30 && (results.goodMatches.length > 2 || i > 60)) {
      break;
    }
  }

  // Sort all result arrays by similarity score (highest first)
  results.bestMatches.sort((a, b) => b.similarityScore - a.similarityScore);
  results.goodMatches.sort((a, b) => b.similarityScore - a.similarityScore);
  results.possibleMatches.sort((a, b) => b.similarityScore - a.similarityScore);
  results.allResults.sort((a, b) => b.similarityScore - a.similarityScore);

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

    // Process similarity with the optimized parallel function
    const results = await processParallelSimilarity(
      seeds,
      imageUrl,
      featureExtractor
    );

    // Return categorized results
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in image comparison:", error);
    return NextResponse.json(
      { error: "Failed to process image comparison" },
      { status: 500 }
    );
  }
}
