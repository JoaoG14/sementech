import { NextResponse } from "next/server";
import { seeds } from "../../shared/seeds";
import crypto from "crypto";
import fs from "fs";
import path from "path";

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

// File system storage for results
const RESULTS_DIR = path.join(process.cwd(), "tmp");

// Ensure the results directory exists
try {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
} catch (error) {
  console.error("Failed to create results directory:", error);
}

// Store results in a file
const storeResults = (
  resultId: string,
  results: SimilarityResults
): boolean => {
  try {
    const filePath = path.join(RESULTS_DIR, `${resultId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(results));

    // Set up auto-cleanup after 30 minutes
    setTimeout(() => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`Failed to delete result file ${resultId}:`, err);
      }
    }, 30 * 60 * 1000);

    return true;
  } catch (error) {
    console.error(`Failed to store results for ${resultId}:`, error);
    return false;
  }
};

// Retrieve results from a file
const getResults = (resultId: string): SimilarityResults | null => {
  try {
    const filePath = path.join(RESULTS_DIR, `${resultId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as SimilarityResults;
  } catch (error) {
    console.error(`Failed to retrieve results for ${resultId}:`, error);
    return null;
  }
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
      console.error("POST request missing imageUrl");
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    console.log(
      "Processing image comparison for URL:",
      imageUrl.substring(0, 50) + "..."
    );

    // Check if the results directory exists and create it if needed
    if (!fs.existsSync(RESULTS_DIR)) {
      console.log(`Creating results directory: ${RESULTS_DIR}`);
      try {
        fs.mkdirSync(RESULTS_DIR, { recursive: true });
      } catch (dirError) {
        const errorMessage =
          dirError instanceof Error ? dirError.message : String(dirError);
        console.error(`Failed to create results directory: ${errorMessage}`);
        return NextResponse.json(
          {
            error: "Storage system error",
            details: `Failed to create results directory: ${errorMessage}`,
          },
          { status: 500 }
        );
      }
    }

    // Load the transformers library
    console.log("Loading transformers library...");
    const { pipeline } = await loadTransformers();

    // Create the feature extractor
    console.log("Creating feature extractor...");
    const featureExtractor = await pipeline(
      "image-feature-extraction",
      "Xenova/clip-vit-base-patch32"
    );

    // Process similarity with the optimized parallel function
    console.log("Processing image similarity...");
    const results = await processParallelSimilarity(
      seeds,
      imageUrl,
      featureExtractor
    );

    console.log(
      `Found ${results.allResults.length} matches (${results.bestMatches.length} best, ${results.goodMatches.length} good, ${results.possibleMatches.length} possible)`
    );

    // Generate a unique ID for the results
    const resultId = crypto.randomUUID();
    console.log(`Generated result ID: ${resultId}`);

    // Store the results in a file
    console.log(`Storing results to file...`);
    const stored = storeResults(resultId, results);

    if (!stored) {
      console.error(`Failed to store results for ID: ${resultId}`);
      return NextResponse.json(
        {
          error: "Failed to store results",
          details: "Could not write results to storage",
        },
        { status: 500 }
      );
    }

    console.log(`Successfully stored results with ID: ${resultId}`);

    // Return only the result ID instead of the full results
    return NextResponse.json({
      resultId,
      matchCounts: {
        total: results.allResults.length,
        best: results.bestMatches.length,
        good: results.goodMatches.length,
        possible: results.possibleMatches.length,
      },
    });
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

// Add a GET endpoint to retrieve results by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get("id");

    if (!resultId) {
      console.error("GET request missing result ID");
      return NextResponse.json(
        { error: "Result ID is required" },
        { status: 400 }
      );
    }

    console.log(`Retrieving results for ID: ${resultId}`);

    // Check if the results directory exists
    if (!fs.existsSync(RESULTS_DIR)) {
      console.error(`Results directory does not exist: ${RESULTS_DIR}`);
      return NextResponse.json(
        {
          error: "Storage system error",
          details: "Results directory not found",
        },
        { status: 500 }
      );
    }

    // Check if the file exists before trying to read it
    const filePath = path.join(RESULTS_DIR, `${resultId}.json`);
    if (!fs.existsSync(filePath)) {
      console.error(`Results file not found: ${filePath}`);
      return NextResponse.json(
        {
          error: "Results not found or expired",
          details: "The requested result ID does not exist in storage",
        },
        { status: 404 }
      );
    }

    // Get the results from file storage
    const results = getResults(resultId);

    if (!results) {
      console.error(`Failed to parse results for ID: ${resultId}`);
      return NextResponse.json(
        {
          error: "Results could not be retrieved",
          details: "The result file exists but could not be parsed",
        },
        { status: 500 }
      );
    }

    console.log(`Successfully retrieved results for ID: ${resultId}`);

    // Return the full results
    return NextResponse.json(results);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error retrieving image comparison results:", errorMessage);

    return NextResponse.json(
      {
        error: "Failed to retrieve results",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
