export const maxDuration = 60;

const { getJson } = require("serpapi");
import { pipeline } from "@xenova/transformers";
import axios from "axios";
import * as cheerio from "cheerio";
import { HttpsProxyAgent } from "https-proxy-agent";

type Product = {
  thumbnail: any;
  source: string;
  title: string;
  price: string;
  url: any;
};

const selectRandom = (): string => {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

const proxies = [
  new HttpsProxyAgent(
    "https://sphiyc47k9:jXs6LncQ3nZp5g+j1z@gate.smartproxy.com:7000"
  ),
  new HttpsProxyAgent(
    "https://user-sphiyc47k9-sessionduration-1:jXs6LncQ3nZp5g+j1z@br.smartproxy.com:10001"
  ),
  new HttpsProxyAgent(
    "https://user-sphiyc47k9-sessionduration-1:jXs6LncQ3nZp5g+j1z@br.smartproxy.com:10002"
  ),
  new HttpsProxyAgent(
    "https://user-sphiyc47k9-sessionduration-1:jXs6LncQ3nZp5g+j1z@br.smartproxy.com:10003"
  ),
];

const selectRandomProxy = (): any => {
  return proxies[Math.floor(Math.random() * proxies.length)];
};

let paidResults: Product[] = [];
let organicResults: Product[] = [];

async function proxyRotatorScraper(urlDoProduto: string) {
  let html;
  for (let i = 0; i < proxies.length; i++) {
    try {
      const user_agent = selectRandom();
      const header = { "User-Agent": user_agent };
      const proxy = selectRandomProxy();
      html = await axios.get(
        `https://www.google.com/search?q=${urlDoProduto}&tbm=shop`,
        {
          headers: header,
          httpAgent: proxy instanceof HttpsProxyAgent ? proxy : undefined,
          proxy: proxy instanceof HttpsProxyAgent ? false : proxy.proxy,
        }
      );
      if (html.data) break;
    } catch {
      console.log(`A proxy ${String(proxies[i])} não deu certo`);
      continue;
    }
  }
  return html;
}

export async function POST(request: Request) {
  const { imageUrl, searchTitle } = await request.json();
  const apiKey = process.env.API_KEY;
  let offersImageEmbeds = [];
  let similarOffers = [];
  let mildlySimilarOffers = [];

  function cosineSimilarity(vec1: number[], vec2: number[]) {
    let dotProd = 0,
      mag1 = 0,
      mag2 = 0;
    for (let i = 0; i < vec1.length; i++) {
      dotProd += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }
    return dotProd / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

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
    if (offer.source === "AliExpress" && offer.price?.currency === "U") {
      offer.price = offer.price.extracted_value * 5.52;
      return offer;
    }
  });

  const formatedTitle = searchTitle.replace(/ /g, '+').replace("/", "");

  console.log(formatedTitle)

  const shoppingResponse: any = await proxyRotatorScraper(formatedTitle);

  const $ = cheerio.load(shoppingResponse.data);

  $(".KZmu8e").each((i, el) => {
    const thumbnail = $(el).find(".sh-img__image > img").attr("src") || "";
    const source = $(el).find(".E5ocAb").text().trim() || "";
    const title = $(el).find(".sh-np__product-title").text().trim();
    const price = $(el)
      .find(".T14wmb > b")
      .text()
      .trim()
      .slice(2, -3)
      .replace(".", "");
    const url = $(el).find(".sh-np__click-target").attr("href") || "";

    paidResults.push({ thumbnail, source, title, price, url });
  });

  $(".i0X6df").each((i, el) => {
    const thumbnail = $(el).find(".ArOc1c > img").attr("src") || "";
    const source = $(el).find(".aULzUe").text().trim() || "";
    const title = $(el).find(".tAxDx").text().trim();
    const price = $(el)
      .find(".QIrs8 > span")
      .text()
      .trim()
      .slice(2, -3)
      .replace(".", "");
    const url = $(el).find(".mnIHsc > a").attr("href") || "";

    organicResults.push({ thumbnail, source, title, price, url });
  });

  let offers = [...filteredLensOffers, ...paidResults, ...organicResults];

  offers = offers.filter((offer: Product) => {
    if (!offer.price.includes("mês") && offer.source) {
      return offer;
    }
  });

  offers = offers.sort((a: any, b: any) => a.price - b.price);

  const image_feature_extractor = await pipeline(
    "image-feature-extraction",
    "Xenova/clip-vit-base-patch32"
  );

  const featureScraped = await image_feature_extractor(imageUrl);
  const scrapedImgEmbed = Array.from(featureScraped.data);

  let counter = 0;

  for (let i = 0; i < offers.length && i < 45; i++) {
    let offerFeatureScraped = await image_feature_extractor(
      offers[i].thumbnail
    );
    offersImageEmbeds[i] = Array.from(offerFeatureScraped.data);
    const similarity = cosineSimilarity(scrapedImgEmbed, offersImageEmbeds[i]);
    console.log(similarity + " - " + offers[i].title);
    if (similarity > 0.87) {
      similarOffers.push(offers[i]);
    }
    if (similarity > 0.71) {
      mildlySimilarOffers.push(offers[i]);
    }
    if (i > 15) {
      if ((counter < 1 && similarOffers.length > 2) || i > 30) {
        break;
      }
      counter++;
    }
  }

  return Response.json([offers, similarOffers, mildlySimilarOffers]);
}
