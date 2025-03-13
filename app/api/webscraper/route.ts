export const maxDuration = 10;

import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

const { JSDOM } = require("jsdom");

// required to use the axios https proxy fix with the bright data web unlocker
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const scraper = require("axios-https-proxy-fix");

// smartproxy proxies
const proxyAgentRotating = new HttpsProxyAgent(
  "https://spv9s12fpi:9nWzNspoy+PetGu839@gate.smartproxy.com:7000"
);

const proxyAgentBrSticky1 = new HttpsProxyAgent(
  "https://user-spv9s12fpi-sessionduration-1:9nWzNspoy+PetGu839@br.smartproxy.com:10001"
);

const proxyAgentBrSticky2 = new HttpsProxyAgent(
  "https://user-spv9s12fpi-sessionduration-1:9nWzNspoy+PetGu839@br.smartproxy.com:10002"
);

const proxyAgentRotatingBr = new HttpsProxyAgent(
  "https://spv9s12fpi:9nWzNspoy+PetGu839@br.smartproxy.com:10000"
);

const proxyAgentSticky1 = new HttpsProxyAgent(
  "https://user-spv9s12fpi-sessionduration-1:9nWzNspoy+PetGu839@gate.smartproxy.com:10001"
);

const proxyAgentSticky2 = new HttpsProxyAgent(
  "https://user-spv9s12fpi-sessionduration-1:9nWzNspoy+PetGu839@gate.smartproxy.com:10002"
);

// web unlocker options
var username = "brd-customer-hl_853774fc-zone-web_unlocker1";
var password = "izphoo16uq1n";
var port = 22225;
var session_id = (1000000 * Math.random()) | 0;
var options = {
  auth: {
    username: username + "-session-" + session_id,
    password,
  },
  host: "brd.superproxy.io",
  port,
  rejectUnauthorized: false,
};

// list of all proxies
const proxies = [
  null,
  proxyAgentRotatingBr,
  {
    rejectUnauthorized: false,
    proxy: {
      host: "brd.superproxy.io",
      port: "22225",
      auth: {
        username: "brd-customer-hl_853774fc-zone-web_unlocker1",
        password: "izphoo16uq1n",
      },
    },
  },
  options,
  proxyAgentBrSticky1,
  proxyAgentRotatingBr,
  {
    rejectUnauthorized: false,
    proxy: {
      host: "brd.superproxy.io",
      port: "22225",
      auth: {
        username: "brd-customer-hl_853774fc-zone-web_unlocker1",
        password: "izphoo16uq1n",
      },
    },
  },
  options,
  proxyAgentBrSticky2,
  proxyAgentRotating,
  proxyAgentSticky1,
  proxyAgentSticky2,
];

async function proxyRotatorScraper(urlDoProduto: string) {
  let html;
  for (let i = 0; i < 7; i++) {
    try {
      console.log(`trying with ${String(proxies[i])}`);
      html = await scraper.get(urlDoProduto, proxies[i]);
      if (html.data) break;
    } catch {
      console.log(`A proxy ${String(proxies[i])} não deu certo`);
      continue;
    }
  }
  return html;
}

export async function POST(request: Request) {
  let { productUrl } = await request.json();

  let fixedUrl: any;

  if (!productUrl.includes("https://")) {
    fixedUrl = productUrl.replace("https:/", "https://");
  } else {
    fixedUrl = productUrl;
  }

  let source: any;
  let price: any;
  let title: any;
  let img: any;
  let verified: boolean = false;

  // this is a workaround to fix the url for when the url is from the search button
  productUrl = productUrl.replace("https://", "https:/");

  try {
    if (!fixedUrl.includes("http")) {
      const brazilianDomains = [
        ".com.br",
        ".org.br",
        ".net.br",
        ".gov.br",
        ".edu.br",
        ".shop.br",
      ];
      const startsWithWww = fixedUrl.startsWith("www.");
      const hasBrazilianDomain = brazilianDomains.some((domain) =>
        fixedUrl.includes(domain)
      );

      if (startsWithWww) {
        // URL starts with www. but missing http
        fixedUrl = "https://" + fixedUrl;
        console.log("Fixed URL without http protocol:", fixedUrl);
      } else if (hasBrazilianDomain) {
        // URL has Brazilian domain but missing www. and http
        fixedUrl = "https://www." + fixedUrl;
        console.log("Fixed URL without http and www:", fixedUrl);
      } else {
        title = productUrl.replace("?", "");
        return NextResponse.json({ source, img, title, price, verified });
      }

      // Now try to scrape with the fixed URL
      return await POST(
        new Request("", {
          method: "POST",
          body: JSON.stringify({ productUrl: fixedUrl }),
        })
      );
    } else if (productUrl.slice(0, 31) === "https:/ik.imagekit.io/pexinxas/") {
      img = productUrl.replace("?", "").replace("https:/", "https://");
      title = "imagem";
    } else if (
      productUrl.slice(0, 21) === "https:/pinterest.com/" ||
      productUrl.slice(0, 24) === "https:/br.pinterest.com/"
    ) {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Pinterest";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
    } else if (productUrl.slice(0, 29) === "https:/www.americanas.com.br/") {
      const html = await scraper.get(fixedUrl, {
        rejectUnauthorized: false,
        proxy: {
          host: "brd.superproxy.io",
          port: "22225",
          auth: {
            username: "brd-customer-hl_853774fc-zone-web_unlocker1",
            password: "izphoo16uq1n",
          },
        },
      });
      const $ = await cheerio.load(html.data);

      source = "Americanas";
      title = $(`[property='og:title']`).attr("content")?.slice(0, -23);
      price = $(`.priceSales`).text().trim().slice(3, -3);
      img = $(`[property='og:image']`).attr("content");
      verified = true;
    } else if (
      productUrl.slice(0, 30) === "https:/www.mercadolivre.com.br" ||
      productUrl.slice(0, 30) === "https:/produto.mercadolivre.co"
    ) {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Mercado Livre";
      price = $("[itemprop=price]").attr("content")?.split(".")[0];
      title = $(".ui-pdp-title").text().trim();
      img = $('meta[name="twitter:image"]').attr("content");
      verified = true;
    } else if (productUrl.slice(0, 31) === "https:/www.magazineluiza.com.br") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Magazine Luiza";
      price = $("[data-testid='price-value']").text().trim().slice(3, -3);
      title = $("[data-testid='heading-product-title']").text().trim();
      img = $("[property='og:image']").attr("content");
      verified = true;
    } else if (productUrl.slice(0, 29) === "https:/www.casasbahia.com.br/") {
      const res = await fetch(productUrl);
      const html = await res.text();

      const dom = new JSDOM(html);
      const document = dom.window.document;

      source = "Casas Bahia";
      img = document.querySelector("[property='og:image']").content;
      title = document
        .querySelector('meta[name="title"]')
        .content.slice(0, -14);
      price = document
        .querySelector("#product-price > span:nth-child(2)")
        .innerHTML.slice(8, -3)
        .replace(".", "");
      verified = true;
    } else if (productUrl.slice(0, 25) === "https:/www.amazon.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Amazon";
      img = $("#landingImage").attr("src");
      title = $("#productTitle").text().trim();
      price = $(
        "#corePriceDisplay_desktop_feature_div > div.a-section.a-spacing-none.aok-align-center.aok-relative > span.a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > span:nth-child(2) > span.a-price-whole"
      )
        .text()
        .trim()
        .replace(",", "")
        .replace(".", "");
      verified = true;
    } else if (productUrl.slice(0, 27) === "https:/www.netshoes.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Netshoes";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']")?.attr("content")?.slice(0, -19);
      price = $(
        "#buy-box > div.if-available > div.price.price-box > div > span:nth-child(1) > strong"
      )
        .text()
        .trim()
        .slice(3, -3);
      verified = true;
    } else if (productUrl.slice(0, 22) === "https:/store.moma.org/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "MoMA";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = String(
        Math.floor(
          Number(
            $("[property='product:price:amount']")
              .attr("content")
              ?.split(",")[0]
              .replace(".", "")
          )
        )
      );
    } else if (productUrl.slice(0, 28) === "https:/www.woodprime.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Wood Prime";
      img = $("[property='og:image']").attr("content");
      title = $(".product-name").text().trim().split("�").join("á");
      price = $(".PrecoPrincipal").text().trim().slice(3, -3);
      verified = true;
    } else if (productUrl.slice(0, 26) === "https:/www.tokstok.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Tok&Stok";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = String(
        JSON.parse($("#__NEXT_DATA__").text().trim()).props.pageProps.product
          .simulationPrice.price
      ).split(".")[0];
      verified = true;
    } else if (productUrl.slice(0, 24) === "https:/www.zarahome.com/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Zara Home";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = $(
        "#btnAddToCart > button > div > span.line-break > span.inline-avoid-rtl"
      )
        .text()
        .trim()
        .slice(3, -3);
      verified = true;
    } else if (productUrl.slice(0, 31) === "https:/www.moveisbrasil.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Móveis Brasil";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = $("#preco_atual").attr("value");
      verified = true;
    } else if (productUrl.slice(0, 24) === "https:/www.mobly.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Mobly";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = String(
        JSON.parse($("#detailJsonLd").text().trim()).offers[0].price
      ).slice(0, -2);
      verified = true;
    } else if (
      productUrl.slice(0, 33) === "https:/www.madeiramadeira.com.br/"
    ) {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Madeira Madeira";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = $(
        "#control-box-content > div:nth-child(2) > div.cav--c-gkGAKm > div.cav--c-eNhzRw.cav--c-eNhzRw-fiXSPN-sm-12.cav--c-eNhzRw-fjkVwe-md-12.cav--c-eNhzRw-iNwOKQ-lg-5 > div:nth-child(2) > div.cav--c-lesPJm.cav--c-bsUccK.cav--c-bsUccK-ijaXjWv-css > div > div.cav--c-gqwkJN.cav--c-gqwkJN-iustkc-css > div > div:nth-child(1) > span"
      )
        .text()
        .trim()
        .slice(3, -3);
      verified = true;
    } else if (
      productUrl.slice(0, 34) === "https:/www.esplanadamoveis.com.br/"
    ) {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Esplanada Móveis";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = JSON.parse(
        $("[data-name='occ-structured-data']").text().trim()
      )[0].offers.price;
      verified = true;
    } else if (productUrl.slice(0, 28) === "https:/www.pontofrio.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Ponto Frio";
      img = "dfasdfasd";
      title = "dfasdf";
      price = "fasd";
      verified = true;
    } else if (productUrl.slice(0, 24) === "https:/www.extra.com.br/") {
      const res = await fetch(productUrl);
      const html = await res.text();

      const dom = new JSDOM(html);
      const document = dom.window.document;

      source = "Extra.com.br";
      img = document.querySelector("[property='og:image']").content;
      title = document.querySelector('meta[name="title"]').content;
      price = document
        .querySelector("#product-price > span:nth-child(2)")
        .innerHTML.slice(3, -3);
      verified = true;
    } else if (productUrl.slice(0, 30) === "https:/www.leroymerlin.com.br/") {
      const html = await scraper.get(fixedUrl, {
        httpsAgent: proxyAgentRotatingBr,
      });

      source = "Leroy Merlin";
      img = html.data.product.pictures[0];
      title = html.data.product.name;
      price = html.data.product.price.to_price;
      verified = true;
    } else if (productUrl.slice(0, 27) === "https:/www.lakhazza.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source =
        $("[property='og:site_name']").attr("content") ||
        $("[name='twitter:site']").attr("content") ||
        null;
      img = $("[property='og:image']").attr("content") || null;
      title = $("[property='og:title']").attr("content") || null;
      price = $("[itemprop='price']")?.attr("content")?.slice(0, -3) || null;
    } else if (productUrl.slice(0, 26) === "https:/www.colombo.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Lojas Colombo";
      img = JSON.parse(
        JSON.parse($("#__NEXT_DATA__").text().trim()).props.pageProps
          .initialData.seo.productJsonMicroformat
      ).image;
      title = $(
        "#product-top > div.styles__TitleProductStyled-sc-pl294v-0.eZMMYV > h1"
      )
        .text()
        .trim();
      price = String(
        JSON.parse(
          JSON.parse($("#__NEXT_DATA__").text().trim()).props.pageProps
            .initialData.seo.productJsonMicroformat
        ).offers[0].price
      ).slice(0, -2);
      verified = true;
    } else if (productUrl.slice(0, 27) === "https:/www.shoptime.com.br/") {
      const res = await fetch(productUrl);
      const html = await res.text();

      const dom = new JSDOM(html);
      const document = dom.window.document;

      source = "Shoptime";
      img = document.querySelector("head > meta:nth-child(19)").content;
      title = document.querySelector("head > meta:nth-child(16)").content;
      price = document
        .querySelector(
          "#rsyswpsdk > div > main > div.src__Container-sc-1a23x5b-3.bzAFUi > div.src__ProductOffer-sc-1a23x5b-6.kpLkBz > div.src__Wrapper-sc-g7i0pf-0.fUfANA > div.src__PriceWrapper-sc-17hp6jc-4.fNgChL > div"
        )
        .innerHTML.slice(3, -3);
      verified = true;
    } else if (
      productUrl.slice(0, 33) === "https:/www.webcontinental.com.br/"
    ) {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "WebContinental";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = $("[property='product:price:amount']").attr("content");
      verified = true;
    } else if (productUrl.slice(0, 28) === "https:/www.carrefour.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Carrefour";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = $("[property='product:price:amount']").attr("content");
      verified = true;
    } else if (productUrl.slice(0, 29) === "https:/www.casaevideo.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Casa & Video";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = $("[property='product:price:amount']").attr("content");
      verified = true;
    } else if (productUrl.slice(0, 27) === "https:/now.westwing.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "WestWing";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = $("[property='product:price:amount']")
        .attr("content")
        ?.replace(".", "");
      verified = true;
    } else if (productUrl.slice(0, 26) === "https:/sofanacaixa.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "Sofá na Caixa";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = $("[property='product:price:amount']")
        .attr("content")
        ?.split(",")[0]
        .replace(".", "");
      verified = true;
    } else if (
      productUrl.slice(0, 33) === "https:/store.hermanmiller.com.br/"
    ) {
      const html = await scraper.get(fixedUrl, {
        rejectUnauthorized: false,
        proxy: {
          host: "brd.superproxy.io",
          port: "22225",
          auth: {
            username: "brd-customer-hl_853774fc-zone-web_unlocker1",
            password: "izphoo16uq1n",
          },
        },
      });
      const $ = cheerio.load(html.data);

      source = "Herman Miller";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:title']").attr("content");
      price = $("[property='product:price:amount']").attr("content");
      verified = true;
    } else if (productUrl.slice(0, 23) === "https:/www.muma.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      source = "muma";
      img = $("[property='og:image']").attr("content");
      title = $("[property='og:description']").attr("content");
      price = $("[itemprop='price']").attr("content")?.split(".")[0];
      verified = true;
    } else if (productUrl.slice(0, 31) === "https:/www.taniabulhoes.com.br/") {
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = await cheerio.load(html.data);

      console.log("entrou no taniabulhoes");
      source = "Tania Bulhões";
      img = String(
        JSON.parse($("[type='application/ld+json']").text().trim()).image
      );
      title = $("h1").text().trim();
      price = String(
        JSON.parse($("[type='application/ld+json']").text().trim()).offers.price
      );
      verified = true;
    } else {
      console.log("using generic scraper");
      const html = await proxyRotatorScraper(fixedUrl);
      const $ = cheerio.load(html.data);

      source =
        $("[property='og:site_name']").attr("content") ||
        $("[name='twitter:site']").attr("content") ||
        null;
      img = $("[property='og:image']").attr("content") || null;
      title = $("[property='og:title']").attr("content") || null;
      price =
        String(
          Math.floor(
            Number(
              $("[property='product:price:amount']")
                .attr("content")
                ?.split(",")[0]
            )
          )
        ) ||
        String(
          Math.floor(Number($("[property='og:price']").attr("content")))
        ) ||
        null;
    }
    return NextResponse.json({ source, img, title, price, verified });
  } catch (error: any) {
    throw new Error(`Failed to scrape product: ${error.message}`);
  } finally {
  }
}
