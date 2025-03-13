const unirest = require("unirest");
const cheerio = require("cheerio");

const selectRandom = () => {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)  AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
  ];
  var randomNumber = Math.floor(Math.random() * userAgents.length);
  return userAgents[randomNumber];
};
let user_agent = selectRandom();
let header = {
  "User-Agent": `${user_agent}`,
};

const getOrganicData = () => {
  return unirest
    .get("https://www.google.com/search?q=javascript&gl=us&hl=en")
    .headers(header)
    .then((response) => {
      let $ = cheerio.load(response.body);
      console.log(response.status);
      let titles = [];
      let links = [];
      let snippets = [];
      let displayedLinks = [];

      $(".g .yuRUbf h3").each((i, el) => {
        titles[i] = $(el).text();
      });
      $(".yuRUbf a").each((i, el) => {
        links[i] = $(el).attr("href");
      });
      $(".g .VwiC3b ").each((i, el) => {
        snippets[i] = $(el).text();
      });
      $(".g .yuRUbf .NJjxre .tjvcx").each((i, el) => {
        displayedLinks[i] = $(el).text();
      });

      const organicResults = [];

      for (let i = 0; i < titles.length; i++) {
        organicResults[i] = {
          title: titles[i],
          links: links[i],
          snippet: snippets[i],
          displayedLink: displayedLinks[i],
        };
      }
      console.log(organicResults);
    });
};

getOrganicData();
