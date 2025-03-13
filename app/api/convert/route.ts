import axios from "axios";

export async function POST(request: Request) {
  const { urlToRedirect } = await request.json();
  let newUrl = urlToRedirect;

  try {
    const convertResponse = await axios
      .post("https://joaogabrielalves.com/redirect", {
        urlToRedirect: urlToRedirect,
      })
      .then(function (response) {
        newUrl = response.data;
      })
      .catch(function (error) {
        console.error(error);
      });
    console.log(convertResponse);
  } catch {
    return Response.json(newUrl);
  }

  return Response.json(newUrl);
}
