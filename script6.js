const { default: axios } = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");
const cheerio = require("cheerio");

let source, img, price, title;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

const proxyAgent1 = new HttpsProxyAgent(
  "https://user-sphiyc47k9-sessionduration-1:jXs6LncQ3nZp5g+j1z@br.smartproxy.com:10001"
);
const proxyAgent2 = new HttpsProxyAgent(
  "https://user-sphiyc47k9-sessionduration-1:jXs6LncQ3nZp5g+j1z@br.smartproxy.com:10002"
);
const proxyAgent3 = new HttpsProxyAgent(
  "https://user-sphiyc47k9-sessionduration-1:jXs6LncQ3nZp5g+j1z@br.smartproxy.com:10003"
);
const proxyAgent4 = new HttpsProxyAgent(
  "https://user-sphiyc47k9-sessionduration-1:jXs6LncQ3nZp5g+j1z@br.smartproxy.com:10004"
);
const proxyAgent5 = new HttpsProxyAgent(
  "https://user-sphiyc47k9-sessionduration-1:jXs6LncQ3nZp5g+j1z@br.smartproxy.com:10005"
);
const proxyAgent6 = new HttpsProxyAgent(
  "https://sphiyc47k9:jXs6LncQ3nZp5g+j1z@gate.smartproxy.com:7000"
);
const proxyAgent7 = new HttpsProxyAgent(
  "https://user-sphiyc47k9-sessionduration-1:jXs6LncQ3nZp5g+j1z@gate.smartproxy.com:10001"
);
const proxyAgent8 = new HttpsProxyAgent(
  "https://user-sphiyc47k9-sessionduration-1:jXs6LncQ3nZp5g+j1z@gate.smartproxy.com:10002"
);
const proxyAgent9 = new HttpsProxyAgent(
  "https://user-sphiyc47k9-sessionduration-1:jXs6LncQ3nZp5g+j1z@gate.smartproxy.com:10003"
);
const proxyAgent10 = new HttpsProxyAgent(
  "https://sphiyc47k9:jXs6LncQ3nZp5g+j1z@br.smartproxy.com:10000"
);

const proxies = [
  proxyAgent1,
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
  proxyAgent2,
  proxyAgent3,
  proxyAgent4,
  proxyAgent5,
  proxyAgent6,
  proxyAgent7,
  proxyAgent8,
  proxyAgent9,
  proxyAgent10,
];

const scraper = require("axios-https-proxy-fix");

async function proxyRotatorScraper(urlDoProduto) {
  let html;
  for (let i = 0; i < proxies.length; i++) {
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

const urlTeste =
  "https://www.zarahome.com/br/capa-de-almofada-em-chenille-l43301008?categoryId=1020423814&colorId=526&ct=true";

const main = async () => {
  const scrapedHTML = await proxyRotatorScraper(urlTeste);
  const $ = await cheerio.load(scrapedHTML.data);

  source =
    $("[property='og:site_name']").attr("content") ||
    $("[name='twitter:site']").attr("content") ||
    null;
  img = $("[property='og:image']").attr("content") || null;
  title = $("[property='og:title']").attr("content") || null;
  price =
    $("[property='product:price:amount']").attr("content") ||
    $("[property='og:price']").attr("content") ||
    null;

  console.log(source);
  console.log(img);
  console.log(title);
  console.log(price);
};
main();
