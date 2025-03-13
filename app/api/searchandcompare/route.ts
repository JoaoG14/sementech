export const maxDuration = 15;
import axios from "axios";

const searchApiPassword = process.env.SEARCH_API_PASSWORD;

export async function POST(request: Request) {
  const { imageUrl, searchTitle } = await request.json();
  let offersData: any;

  console.log("searching for: " + imageUrl + " " + searchTitle);

  const offersResponse = await axios
    .post("https://joaogabrielalves.com/search", {
      imageUrl: imageUrl,
      searchQuery: searchTitle,
      password: searchApiPassword,
    })
    .then(function (response) {
      offersData = response.data;
    })
    .catch(function (error) {
      console.error(error);
    });

  console.log(offersData);

  let ourPick: any = offersData[0];
  let similarOffers: any = offersData[1];
  let mildlySimilarOffers: any = offersData[2];
  let allOffers: any = offersData[3];

  return Response.json([
    ourPick,
    similarOffers,
    mildlySimilarOffers,
    allOffers,
  ]);
}
