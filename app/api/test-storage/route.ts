import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Test storage directory
const RESULTS_DIR = path.join(process.cwd(), "tmp");

export async function GET(request: Request) {
  try {
    // Ensure the directory exists
    if (!fs.existsSync(RESULTS_DIR)) {
      fs.mkdirSync(RESULTS_DIR, { recursive: true });
    }

    // Create a test file
    const testId = crypto.randomUUID();
    const testData = { test: true, timestamp: Date.now(), id: testId };
    const filePath = path.join(RESULTS_DIR, `${testId}.json`);

    // Write test data
    fs.writeFileSync(filePath, JSON.stringify(testData));

    // Read test data
    const readData = fs.readFileSync(filePath, "utf8");
    const parsedData = JSON.parse(readData);

    // Clean up
    fs.unlinkSync(filePath);

    // Return success
    return NextResponse.json({
      success: true,
      directoryExists: fs.existsSync(RESULTS_DIR),
      writeSuccess: true,
      readSuccess: true,
      dataMatch: parsedData.id === testId,
      testId,
      tmpDir: RESULTS_DIR,
    });
  } catch (error) {
    console.error("Storage test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        tmpDir: RESULTS_DIR,
        directoryExists: fs.existsSync(RESULTS_DIR),
      },
      { status: 500 }
    );
  }
}
