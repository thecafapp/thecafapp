import { config } from "dotenv";
config({ path: "./.env.local" });
import { MongoClient } from "mongodb";
import fetch from "node-fetch";
const client = new MongoClient(process.env.CAFMONGO);
export const handler = async () => {
  let masterObject = {};
  const cafFetch = await fetch(`${process.env.CAFAPI}/menu`);
  if (!cafFetch.ok) {
    console.log("caf API internal error");
    return { message: "caf API internal error" };
  }
  const cafJson = await cafFetch.json();
  if (cafJson.error || !cafJson.meals) {
    console.log("not uploaded because no meals found");
    return { message: "not uploaded because no meals found" };
  }
  const mealName = cafJson.meals[0].name.toLowerCase();
  const dateString = new Date(cafJson.meals[0].start);
  const date = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Chicago"
  })
    .format(dateString)
    .replaceAll("/", "-");
  const distanceFromMealEnd = cafJson.meals[0].end - Date.now();
  console.log("distance from meal end is " + (distanceFromMealEnd / 60000).toFixed(1) + "min");
  if (distanceFromMealEnd > 0 && distanceFromMealEnd <= 300000) {
    console.log("close to meal end");
    const dbName = "info";
    await client.connect();
    const db = client.db(dbName);
    const foodsCollection = db.collection("foods");
    const ratingsCollection = db.collection("ratings");
    const foods = await foodsCollection.find().project({ _id: 0 }).toArray();
    const ratings = await ratingsCollection
      .find()
      .project({ uid: 0, expiresAt: 0 })
      .toArray();
    const existingFileReq = await fetch(
      `${process.env.CAFBUCKETGETURL}-${date}.json`
    );
    if (existingFileReq.ok) {
      masterObject = await existingFileReq.json();
    } else {
      masterObject = {};
    }
    masterObject[mealName] = {
      menu: cafJson.meals[0].menu,
      foodRatings: foods,
      mealRatings: ratings,
    };
    const file = Buffer.from(JSON.stringify(masterObject), "utf8");
    // fetch url from a preauthed request in Oracle Console
    const bucketUpload = await fetch(
      `${process.env.CAFBUCKETPUTURL}/cafdata-${date}.json`,
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
    if (bucketUpload.ok) {
      console.log("uploaded to Oracle");
      return { message: "uploaded to Oracle" };
    } else {
      console.error("upload failed at Oracle up step");
      console.error(bucketUpload);
      return {
        message: "upload failed at Oracle up step",
      };
    }
  } else {
    console.log("not uploaded because not close to meal end");
    return {
      message: "not uploaded because not close to meal end",
    };
  }
};

// handler();

// listing URL: https://objectstorage.us-ashburn-1.oraclecloud.com/p/nyWTgMiuwyM7ad_-U0mT0LZIRCpLijIJ-atkcnVtIs5ny9ceQ7IGr5YTXp_LwlOh/n/idosm4hvvvj8/b/cafapp-data-bucket/o?fields=timeCreated
