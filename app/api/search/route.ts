export const maxDuration = 30;

const { getJson } = require("serpapi");

export async function POST(request: Request) {
  const { imageUrl, searchTitle } = await request.json();
  const apiKey = process.env.API_KEY;

  const lensParams = {
    engine: "google_lens",
    country: "br",
    hl: "pt-br",
    url: imageUrl,
    api_key: apiKey,
  };

  let responseGoogleLens = await getJson(lensParams);

  let lensVisualMatches = responseGoogleLens.visual_matches;

  let filteredLensOffers = lensVisualMatches.filter((offer: any) => {
    if (offer.price?.currency === "R") {
      offer.price = offer.price.extracted_value;
      return offer;
    }
  });

  const googleShoppingParams = {
    api_key: apiKey,
    engine: "google_shopping",
    google_domain: "google.com.br",
    q: searchTitle,
    hl: "pt-br",
    gl: "br",
    location: "Brazil",
  };

  let responseGoogleShopping = await getJson(googleShoppingParams);

  let googleShoppingOffers =
    responseGoogleShopping.inline_shopping_results ??
    responseGoogleShopping.shopping_results;

  googleShoppingOffers = googleShoppingOffers.filter((offer: any) => {
    if (!offer.price.includes("mês") && offer.source) {
      offer.price = offer.extracted_price;
      return offer;
    }
  });

  let offers = [...filteredLensOffers, ...googleShoppingOffers];

  offers = offers.sort((a: any, b: any) => a.price - b.price);

  offers = offers.slice(0, 6);

  offers = offers.map((offer: any) => {
    if (offer.thumbnail.includes(".webp")) {
      offer.thumbnail.replace(".webp", ".jpg");
    } else if (!offer.thumbnail.includes(".jpg")) {
      offer.thumbnail = offer.thumbnail + ".jpg";
    }
    return offer;
  });

  return Response.json(offers);
}
