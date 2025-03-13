import { NextResponse } from "next/server";
import { supabase } from "@/app/utils/supabase";

export async function POST(request: Request) {
  try {
    const {
      caption,
      title,
      price,
      offerUrl,
      imageUrl,
      postToSupabase = true,
    } = await request.json();

    // If postToSupabase is false, skip Supabase posting
    if (!postToSupabase) {
      return NextResponse.json({
        success: true,
        message: "Supabase posting skipped as requested",
      });
    }

    // Create a new product in Supabase
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          title,
          description: caption,
          price,
          offer_url: offerUrl,
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, product: data[0] });
  } catch (error) {
    console.error("Error saving to Supabase:", error);
    return NextResponse.json(
      {
        error: "Failed to save to Supabase",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
