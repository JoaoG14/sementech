"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  "https://etqzloikgowvgpitntde.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cXpsb2lrZ293dmdwaXRudGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5NTUwNjYsImV4cCI6MjA0MjUzMTA2Nn0._uHKRITNGYId01hrBLGQrtr2w_T_S97DJW7mu8jgYak"
);

interface OfferFormData {
  caption: string;
  title: string;
  price: string;
  offerUrl: string;
  password: string;
  image: File | null;
  imageUrl: string;
  source: string;
  postToTwitter: boolean;
  postToSupabase: boolean;
}

export default function OfferForm() {
  const [formData, setFormData] = useState<OfferFormData>({
    caption: "",
    title: "",
    price: "",
    offerUrl: "",
    password: "",
    image: null,
    imageUrl: "",
    source: "",
    postToTwitter: true,
    postToSupabase: true,
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("url");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If it's an image URL input, update the preview
    if (name === "imageUrl" && value) {
      setImagePreview(value);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imageUrl: "", // Clear URL when file is selected
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadMethodChange = (method: "file" | "url") => {
    setUploadMethod(method);
    // Clear image preview and reset related form data
    if (method === "file") {
      setFormData((prev) => ({
        ...prev,
        imageUrl: "",
        image: null,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        image: null,
      }));
    }
    setImagePreview("");
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateForm = () => {
    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password !== process.env.NEXT_PUBLIC_OFFER_CREATION_PASSWORD) {
      setError("Incorrect password");
      return false;
    }

    if (!formData.title) {
      setError("Title is required");
      return false;
    }

    if (!formData.price) {
      setError("Price is required");
      return false;
    }

    if (!formData.offerUrl) {
      setError("Offer URL is required");
      return false;
    }

    if (!formData.source) {
      setError("Source is required");
      return false;
    }

    if (uploadMethod === "url" && !formData.imageUrl) {
      setError("Image URL is required");
      return false;
    }

    if (!formData.postToTwitter && !formData.postToSupabase) {
      setError("Please select at least one platform to post to");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate form
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      // Use the combined publish API endpoint
      try {
        const response = await fetch("/api/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            caption: formData.caption,
            title: formData.title,
            price: formData.price,
            offerUrl: formData.offerUrl,
            imageUrl: formData.imageUrl,
            postToTwitter: formData.postToTwitter,
            postToSupabase: formData.postToSupabase,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to publish");
        }

        const result = await response.json();
        console.log("Publish result:", result);

        // Clear form after successful submission
        setFormData({
          caption: "",
          title: "",
          price: "",
          offerUrl: "",
          password: "",
          image: null,
          imageUrl: "",
          source: "",
          postToTwitter: true,
          postToSupabase: true,
        });
        setImagePreview("");

        // Show success message
        let successMessage = "Offer created successfully!";
        if (result.twitter?.success && result.supabase?.success) {
          successMessage =
            "Offer created successfully and posted to Twitter and Supabase!";
        } else if (result.twitter?.success) {
          successMessage = "Offer created successfully and posted to Twitter!";
        } else if (result.supabase?.success) {
          successMessage = "Offer created successfully and saved to Supabase!";
        }
        alert(successMessage);
      } catch (publishError) {
        console.error("Error publishing:", publishError);
        throw publishError;
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Upload Section */}
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={uploadMethod === "url" ? "default" : "outline"}
              onClick={() => handleUploadMethodChange("url")}
              className="flex-1"
            >
              Image URL
            </Button>
            <Button
              type="button"
              variant={uploadMethod === "file" ? "default" : "outline"}
              onClick={() => handleUploadMethodChange("file")}
              className="flex-1"
            >
              Upload File
            </Button>
          </div>

          {uploadMethod === "url" ? (
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="Enter image URL"
                className="w-full"
              />
            </div>
          ) : null}

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden"
            onClick={() =>
              uploadMethod === "file" &&
              document.getElementById("image-upload")?.click()
            }
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4 flex text-sm text-gray-600">
                  {uploadMethod === "file" ? (
                    <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/90">
                      <span>Upload an image</span>
                      <input
                        id="image-upload"
                        name="image"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  ) : (
                    <span>Enter image URL above</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {uploadMethod === "file"
                    ? "PNG, JPG, GIF up to 10MB"
                    : "Supported formats: PNG, JPG, GIF"}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter admin password"
              className="w-full"
            />
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Input
              type="text"
              id="caption"
              name="caption"
              value={formData.caption}
              onChange={handleInputChange}
              placeholder="Enter offer caption"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter offer title"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter offer price"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="offerUrl">Offer URL</Label>
            <Input
              type="url"
              id="offerUrl"
              name="offerUrl"
              value={formData.offerUrl}
              onChange={handleInputChange}
              placeholder="Enter offer URL"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              type="text"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              placeholder="Enter offer source"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postToTwitter">Post to Twitter</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="postToTwitter"
                name="postToTwitter"
                checked={formData.postToTwitter}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="postToTwitter" className="text-sm font-normal">
                Post this offer to Twitter
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postToSupabase">Post to Supabase</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="postToSupabase"
                name="postToSupabase"
                checked={formData.postToSupabase}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="postToSupabase" className="text-sm font-normal">
                Save this offer to the database
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? "Creating Offer..." : "Create Offer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
