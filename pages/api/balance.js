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
  const usersCollection = db.collection("users");
  if (req.method == "GET") {
    if (req.query.id) {
      const id = decodeURIComponent(req.query.id);
      const auth = firebaseApp.auth();
      auth.getUser(req.query.id).then(async (user) => {
        if (!user) res.status(401).json({ error: "Unknown user UID" });
        const thisUser = await usersCollection.findOne({
          uid: id,
        });
        client.close();
        res
          .setHeader("Cache-Control", "max-age=150, public")
          .status(200)
          .json({ balance: thisUser.balance });
      });
    } else {
      client.close();
      res
        .setHeader("Cache-Control", "max-age=150, public")
        .status(404)
        .json({ error: "You didn't include the food name querystring." });
    }
  } else if (req.method == "POST") {
    const body = JSON.parse(req.body);
    if (req.query.balance && body.token) {
      const auth = firebaseApp.auth();
      auth
        .verifyIdToken(body.token)
        .then(async (user) => {
          await usersCollection.updateOne(
            { uid: id },
            {
              $set: {
                uid: user.uid,
                name: user.name.replace(" (student)", ""),
                balance: balance,
              },
            },
            {
              upsert: true,
            }
          );
          client.close();
          res.status(200).json({ status: "success" });
        })
        .catch(() => {
          res.status(401).json({ error: "Auth error" });
        });
    } else {
      res.status(400).json({
        error:
          "You must provide a unique consistent UID, food name, and rating.",
      });
    }
  }
}
