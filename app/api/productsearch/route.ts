export const maxDuration = 30;

import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import posthog from "posthog-js";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("image");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // SmartProxy API configuration
    const apiUrl = process.env.SMARTPROXY_API_URL || "";
    const auth = "Basic " + process.env.SMARTPROXY_API_KEY || "";

    const payload = {
      target: "google_lens",
      query: decodeURIComponent(imageUrl),
      headless: "html",
      parse: true,
      locale: "pt-br",
      geo: "Brazil",
    };

    posthog.capture("sp_visual_search_api_call_start");
    const response = await axios.post(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
    });

    if (response.status === 200) {
      posthog.capture("sp_visual_search_api_call_success");
      const data = response.data.results[0].content;
      console.log(data.results.results.organic);
      return NextResponse.json({ results: data.results.results.organic });
    } else {
      throw new Error("Request failed with status code: " + response.status);
    }
  } catch (error) {
    console.error("Error in Google Lens API:", error);

    if (error instanceof AxiosError) {
      return NextResponse.json(
        { error: error.message, details: error.response?.data },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch data from Google Lens" },
      { status: 500 }
    );
  }
}
