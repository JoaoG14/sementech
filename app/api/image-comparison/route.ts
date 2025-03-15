import { NextResponse } from "next/server";
import { seeds } from "../../shared/seeds";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// Define types for embeddings and results
type ImageEmbedding = number[];

interface SeedMatch {
  id: string;
  similarityScore: number;
}

interface ComparisonResult {
  resultId: string;
  matches: SeedMatch[];
}

// File system storage for results
const RESULTS_DIR = path.join(process.cwd(), "tmp");

// Ensure the results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Store results in a file
const storeResults = (resultId: string, results: ComparisonResult): boolean => {
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
const getResults = (resultId: string): ComparisonResult | null => {
  try {
    const filePath = path.join(RESULTS_DIR, `${resultId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as ComparisonResult;
  } catch (error) {
    console.error(`Failed to retrieve results for ${resultId}:`, error);
    return null;
  }
};

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

  // Generate a unique ID for the results
  const resultId = crypto.randomUUID();

  return {
    resultId,
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

    // Process image comparison
    const result = await processImageComparison(imageUrl);

    // Store results
    const stored = storeResults(result.resultId, result);

    if (!stored) {
      return NextResponse.json(
        { error: "Failed to store results" },
        { status: 500 }
      );
    }

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

// GET endpoint to retrieve results by ID
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get("id");

    if (!resultId) {
      return NextResponse.json(
        { error: "Result ID is required" },
        { status: 400 }
      );
    }

    // Get the results from file storage
    const results = getResults(resultId);

    if (!results) {
      return NextResponse.json({ error: "Results not found" }, { status: 404 });
    }

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
