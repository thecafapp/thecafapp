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
  const auth = firebaseApp.auth();
  try {
    const user = await auth.verifyIdToken(req.headers["x-firebase-token"]);
    if (!user) {
      return res.status(401).json({ error: "unauthorized" });
    }
    if (req.method == "GET") {
      const thisUser = await usersCollection.findOne({
        uid: user.uid,
      });
      client.close();
      return res
        .setHeader("Cache-Control", "max-age=150, public")
        .status(200)
        .json({ balance: Number(thisUser.balance) || null });
    } else if (req.method == "POST") {
      if (req.query.balance) {
        await usersCollection.updateOne(
          { uid: user.uid },
          {
            $set: {
              name: user.name.replace(" (student)", ""),
              balance: req.query.balance,
            },
          },
          {
            upsert: true,
          }
        );
        client.close();
        return res.status(200).json({ balance: req.query.balance });
      } else {
        return res.status(400).json({
          error:
            "You must provide a unique consistent UID, food name, and rating.",
        });
      }
    } else {
      return res.status(405).send();
    }
  } catch {
    return res.status(401).json({ error: "unauthorized" });
  }
}
