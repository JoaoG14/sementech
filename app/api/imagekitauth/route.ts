import { NextResponse } from "next/server";
import crypto from "crypto";

// Get the private key from environment variables
const privateKey = process.env.PRIVATE_KEY;

export async function GET(request: Request) {
  try {
    // Check if private key is defined
    if (!privateKey) {
      console.error(
        "ImageKit private key is not defined in environment variables"
      );
      return NextResponse.json(
        { error: "ImageKit configuration error" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || crypto.randomUUID();
    const expire =
      searchParams.get("expire") ||
      (Math.floor(Date.now() / 1000) + 2400).toString();

    // Generate signature
    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    // Return authentication data
    return NextResponse.json({
      token,
      expire,
      signature,
    });
  } catch (error) {
    console.error("Error in ImageKit authentication:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
