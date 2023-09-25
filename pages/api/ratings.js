import { MongoClient } from "mongodb";
import firebaseAdmin from "firebase-admin";
const firebaseApp = firebaseAdmin.initializeApp({
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
});
export default async function handler(req, res) {
  const client = new MongoClient(process.env.CAFMONGO);
  const dbName = "info";
  await client.connect();
  const db = client.db(dbName);
  const ratingsCollection = db.collection("ratings");
  const usersCollection = db.collection("users");
  if (req.method == "GET") {
    if (req.query.id) {
      const ratings = await ratingsCollection.find({}).toArray();
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
      client.close();
      res
        .setHeader("Cache-Control", "max-age=30, public")
        .status(200)
        .json({ average: avg.toFixed(1), numItems, alreadyRated });
    } else {
      client.close();
      res
        .status(400)
        .json({ error: "You must provide a unique consistent UID." });
    }
  } else if (req.method == "POST") {
    const body = JSON.parse(req.body);
    if (req.query.id && body.rating && body.expires && body.token) {
      ratingsCollection
        .findOne({
          uid: req.query.id,
        })
        .then(async (document) => {
          if (!document) {
            const auth = firebaseApp.auth();
            auth.getUser(req.query.id).then(async (user) => {
              if (!user) res.status(401).json({ error: "Unknown user UID" });
              ratingsCollection.createIndex(
                { expireAt: 1 },
                { expireAfterSeconds: 0 }
              );
              const expiry = new Date(body.expires);
              await ratingsCollection.insertOne({
                uid: req.query.id,
                rating: body.rating,
                expireAt: expiry,
                time: Date.now(),
              });
              await usersCollection.updateOne(
                { uid: req.query.id },
                {
                  $inc: { points: 10 },
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
            client.close();
            res.status(403).json({ status: "illegal" });
          }
        });
    } else {
      client.close();
      res.status(400).json({
        error:
          "You must provide a unique consistent UID, expiry, and a rating.",
      });
    }
  }
}
