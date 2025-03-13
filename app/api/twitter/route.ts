import { TwitterApi } from "twitter-api-v2";
import { NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Create a client with OAuth 1.0a user context
const userClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY || "",
  appSecret: process.env.TWITTER_API_SECRET || "",
  accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
});

// Get the read-write client
const rwClient = userClient.readWrite;

export async function POST(request: Request) {
  try {
    const {
      caption,
      title,
      price,
      offerUrl,
      imageUrl,
      postToTwitter = true,
    } = await request.json();

    // If postToTwitter is false, skip Twitter posting
    if (!postToTwitter) {
      return NextResponse.json({
        success: true,
        message: "Twitter posting skipped as requested",
      });
    }

    const tweetText = `🔥 ${caption}\n\n🚨 ${title}\n\n💵 R$ ${price}\n👉 ${offerUrl}`;

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // Get the image as a buffer
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Path to the watermark image
    const watermarkPath = path.join(
      process.cwd(),
      "public",
      "assets",
      "watermark.png"
    );

    // Read the watermark image
    const watermarkBuffer = fs.readFileSync(watermarkPath);

    // Get the dimensions of the original image
    const imageMetadata = await sharp(imageBuffer).metadata();
    const imageWidth = imageMetadata.width || 800;
    const imageHeight = imageMetadata.height || 600;

    // Calculate watermark size - make it about 30% of the image width
    const watermarkWidth = Math.round(imageWidth * 0.45);

    // Resize the watermark
    const resizedWatermark = await sharp(watermarkBuffer)
      .resize({ width: watermarkWidth })
      .toBuffer();

    // Get the resized watermark dimensions
    const watermarkMetadata = await sharp(resizedWatermark).metadata();
    const watermarkHeight = watermarkMetadata.height || watermarkWidth / 2;

    // Add watermark to the image
    // Position the watermark at the bottom left of the image
    const watermarkedImageBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: resizedWatermark,
          // Use explicit positioning instead of gravity
          left: 20,
          top: imageHeight - watermarkHeight, // Position at the bottom with 0px bottom padding
        },
      ])
      .toBuffer();

    // Upload the watermarked image to Twitter
    const mediaId = await rwClient.v1.uploadMedia(watermarkedImageBuffer, {
      mimeType: imageResponse.headers.get("content-type") || "image/jpeg",
    });

    // Use the read-write client to post the tweet with the attached media
    const tweet = await rwClient.v2.tweet({
      text: tweetText,
      media: { media_ids: [mediaId] },
    });

    return NextResponse.json({ success: true, tweetId: tweet.data.id });
  } catch (error) {
    console.error("Error posting to Twitter:", error);
    return NextResponse.json(
      {
        error: "Failed to post to Twitter",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
