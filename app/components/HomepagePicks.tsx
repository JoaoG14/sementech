import React from "react";
import PocketBase from "pocketbase";
import SelectedOffer from "./SelectedOffer";

const HomepagePicks = async () => {
  const url = "https://pexinxas.pockethost.io/";
  const client = new PocketBase(url);

  //Autheticate PocketBase

  const adminUser = String(process.env.POCKETBASE_USER);
  const adminPassword = String(process.env.POCKETBASE_PASSWORD);

  const authData = await client.admins.authWithPassword(
    adminUser,
    adminPassword
  );

  const selectedPicks = await client.collection("selectedOffers").getFullList({
    sort: "+created",
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 max-w-[920px] mx-auto">
      {selectedPicks
        ? selectedPicks.map((pick) => {
            return (
              <SelectedOffer
                key={pick.id}
                selectedOfferInfo={{
                  originalUrl: pick.originalUrl,
                  originalImg: pick.originalImg,
                  originalPrice: pick.originalPrice,
                  offerUrl: pick.offerUrl,
                  offerImg: pick.offerImg,
                  offerPrice: pick.offerPrice,
                }}
              />
            );
          })
        : null}
    </div>
  );
};

export default HomepagePicks;
