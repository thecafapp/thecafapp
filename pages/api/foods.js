import { MongoClient } from "mongodb";
import firebaseAdmin from "firebase-admin";
const firebaseApp = firebaseAdmin.initializeApp(
  {
    credential: firebaseAdmin.credential.cert({
      type: "service_account",
      project_id: "thecaf-dotme",
      private_key_id: "cf90b96c985183503d6e95b91ef09d985702709b",
      private_key: process.env.FIREBASE_PRIVATE_KEY,
      client_email: process.env.FIREBASE_EMAIL,
      client_id: "103347218908101696305",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-c3key%40thecaf-dotme.iam.gserviceaccount.com",
    }),
  },
  String(Math.random())
);
export default async function handler(req, res) {
  const client = new MongoClient(process.env.CAFMONGO);
  const dbName = "info";
  await client.connect();
  const db = client.db(dbName);
  const foodsCollection = db.collection("foods");
  const usersCollection = db.collection("users");
  if (req.method == "GET") {
    if (req.query.name) {
      const foods = await foodsCollection
        .find({ name: decodeURIComponent(req.query.name) })
        .toArray();
      if (foods.length > 0) {
        client.close();
        res
          .setHeader("Cache-Control", "max-age=300, public")
          .status(200)
          .json(foods[0]);
      } else {
        client.close();
        res
          .setHeader("Cache-Control", "max-age=300, public")
          .status(404)
          .json({ error: "No matching foods." });
      }
    } else {
      let foods = await foodsCollection
        .find({ ratings: { $gte: 10 } })
        .sort({ rating: -1 })
        .limit(5)
        .toArray();
      client.close();
      if (!foods) foods = [];
      res
        .setHeader("Cache-Control", "max-age=1800, public")
        .status(200)
        .json({ topFoods: foods });
    }
  } else if (req.method == "POST") {
    const body = JSON.parse(req.body);
    if (req.query.id && req.query.name && body.rating) {
      const name = decodeURIComponent(req.query.name);
      const auth = firebaseApp.auth();
      auth.getUser(req.query.id).then(async (user) => {
        if (!user) res.status(401).json({ error: "Unknown user UID" });
        const food = await foodsCollection.findOne({
          name: name,
        });
        await foodsCollection.updateOne(
          {
            name: name,
          },
          {
            $set: {
              rating:
                ((food?.rating || 0) + body.rating) /
                (food?.rating != null ? 2 : 1),
            },
            $inc: {
              ratings: 1,
            },
          },
          {
            upsert: true,
          }
        );
        await usersCollection.updateOne(
          { uid: req.query.id },
          {
            $inc: { points: 1 },
            $set: {
              uid: req.query.id,
              name: user.displayName.replace(" (student)", ""),
            },
          },
          {
            upsert: true,
          }
        );
        client.close();
        res.status(200).json({ status: "success" });
      });
    } else {
      res.status(400).json({
        error:
          "You must provide a unique consistent UID, food name, and rating.",
      });
    }
  }
}
