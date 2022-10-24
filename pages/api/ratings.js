import { MongoClient } from "mongodb";
export default async function handler(req, res) {
  const client = new MongoClient(process.env.CAFMONGO);
  const dbName = "info";
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("ratings");
  if (req.method == "GET") {
    if (req.query.id) {
      const ratings = await collection.find({}).toArray();
      let avg = 0,
        numItems = 0,
        alreadyRated = false;
      ratings.forEach((rating) => {
        numItems++;
        avg += rating.rating;
        if (rating.uid == req.query.id) {
          alreadyRated = true;
        }
      });
      avg = avg / numItems;
      if (numItems == 0) {
        avg = 0;
      }
      res
        .setHeader("Cache-Control", "max-age=30, public")
        .status(200)
        .json({ average: avg.toFixed(1), numItems, alreadyRated });
    } else {
      res
        .status(400)
        .json({ error: "You must provide a unique consistent UID." });
    }
  } else if (req.method == "POST") {
    const body = JSON.parse(req.body);
    console.log(body);
    if (req.query.id && body.rating) {
      collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 1);
      await collection.insertOne({
        uid: req.query.id,
        rating: body.rating,
        expireAt: expiry,
      });
      res.status(200).json({ status: "success" });
    } else {
      res.status(400).json({
        error: "You must provide a unique consistent UID and a rating.",
      });
    }
  }
}
