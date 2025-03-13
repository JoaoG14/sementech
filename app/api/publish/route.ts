import { NextResponse } from "next/server";
import { headers } from "next/headers";

interface PublishResult {
  success: boolean;
  twitter: any;
  supabase: any;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postToTwitter = false, postToSupabase = false } = body;
    const headersList = headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    const results: PublishResult = {
      success: true,
      twitter: null,
      supabase: null,
    };

    // Post to Supabase if selected
    if (postToSupabase) {
      try {
        const supabaseResponse = await fetch(`${baseUrl}/api/supabase`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const supabaseData = await supabaseResponse.json();
        results.supabase = supabaseData;
      } catch (error) {
        console.error("Error posting to Supabase:", error);
        results.supabase = {
          error: "Failed to post to Supabase",
          details: error instanceof Error ? error.message : String(error),
        };
      }
    } else {
      results.supabase = { skipped: true };
    }

    // Post to Twitter if selected
    if (postToTwitter) {
      try {
        const twitterResponse = await fetch(`${baseUrl}/api/twitter`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const twitterData = await twitterResponse.json();
        results.twitter = twitterData;
      } catch (error) {
        console.error("Error posting to Twitter:", error);
        results.twitter = {
          error: "Failed to post to Twitter",
          details: error instanceof Error ? error.message : String(error),
        };
      }
    } else {
      results.twitter = { skipped: true };
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in publish API:", error);
    return NextResponse.json(
      {
        error: "Failed to publish",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
