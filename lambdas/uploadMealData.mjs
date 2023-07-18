import { config } from "dotenv";
config({ path: "./.env.local" });
import { MongoClient } from "mongodb";
import fetch from "node-fetch";
const client = new MongoClient(process.env.CAFMONGO);
export const handler = async () => {
  let masterObject = {};
  const dbName = "info";
  await client.connect();
  const db = client.db(dbName);
  const foodsCollection = db.collection("foods");
  const ratingsCollection = db.collection("ratings");
  const foods = await foodsCollection.find().project({ _id: 0 }).toArray();
  const ratings = await ratingsCollection.find().project({ uid: 0 }).toArray();
  const cafFetch = await fetch(`https://thecaf.app/api/caf?shim=true`);
  const cafJson = await cafFetch.json();
  masterObject.mealName = cafJson.meals[0].name;
  masterObject.menu = cafJson.meals[0].menu;
  masterObject = {
    ...masterObject,
    foodRatings: foods,
    mealRatings: ratings,
  };
  const file = Buffer.from(JSON.stringify(masterObject), "utf8");
  const date = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(cafJson.meals[0].start))
    .replaceAll("/", "-");
  // fetch url from a preauthed request in Oracle Console
  const bucketUpload = await fetch(
    `${
      process.env.CAFBUCKETURL
    }-${date}-${cafJson.meals[0].name.toLowerCase()}.json`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": file.byteLength,
      },
      body: file,
    }
  );
  await client.close();
  if (await bucketUpload.ok) {
    return { message: "uploaded ok" };
  } else {
    return {
      message: "upload failed",
    };
  }
};

handler();

// listing URL: https://objectstorage.us-ashburn-1.oraclecloud.com/p/nyWTgMiuwyM7ad_-U0mT0LZIRCpLijIJ-atkcnVtIs5ny9ceQ7IGr5YTXp_LwlOh/n/idosm4hvvvj8/b/cafapp-data-bucket/o?fields=timeCreated
