export const maxDuration = 30;

import { NextResponse } from "next/server";
import posthog from "posthog-js";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { searchQuery } = body;

    const auth = "Basic " + process.env.SMARTPROXY_API_KEY || "";

    const apiUrl = process.env.SMARTPROXY_API_URL || "";

    posthog.capture("sp_text_search_api_call_start");
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth, // Authorization token needs to be added here
      },
      body: JSON.stringify({
        target: "google_shopping_search",
        query: decodeURIComponent(searchQuery),
        locale: "pt-br",
        geo: "Brazil",
        page_from: "1",
        num_pages: "10",
        parse: true,
        google_results_language: "pt",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch results");
    }

    posthog.capture("sp_text_search_api_call_success");
    const data = await response.json();
    console.log(data.results[0].content.results.results.pla);
    console.log(data.results[0].content.results.results.organic);
    const results = [
      ...data.results[0].content.results.results.pla,
      ...data.results[0].content.results.results.organic,
    ];
    return NextResponse.json(results);
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { error: error.message || "An error occurred while fetching results" },
      { status: 500 }
    );
  }
}
