export const maxDuration = 20;
import { MongoClient } from "mongodb";
import firebaseAdmin from "firebase-admin";
const firebaseApp = firebaseAdmin.initializeApp(
  {
    credential: firebaseAdmin.credential.cert({
      type: "service_account",
      project_id: "thecaf-dotme",
      private_key_id: "5d24fb90d04cf25e5252d26f388584a9817eb81d",
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
  const metaCollection = db.collection("db-meta");
  const auth = firebaseApp.auth();
  if (req.method == "DELETE") {
    if (req.query.id) {
      await auth.deleteUser(req.query.id);
      await usersCollection.deleteOne({ uid: req.query.id });
      await client.close();
      await firebaseApp.delete();
      res.status(200).json({ status: "success", error: null });
    } else {
      await client.close();
      await firebaseApp.delete();
      res.status(400).json({
        error: "You must provide a correct UID.",
        status: "failure",
      });
    }
  } else if (req.method == "PUT") {
    if (req.query.password) {
      const meta = await metaCollection
        .find({ last_id: { $exists: true } })
        .toArray();
      const password = meta[0].password;
      await client.close();
      await firebaseApp.delete();
      if (req.query.password === password) {
        res.status(200).json({ status: "success", error: null });
      } else {
        res.status(401).json({
          error: "Invalid administrator password.",
          status: "failure",
        });
      }
    } else {
      res.status(301).json({
        error: "Missing password in query string.",
        status: "failure",
      });
    }
  } else if (req.method == "POST") {
    console.log("\n\n", req.headers, "\n\n");
    if (!req.headers["x-firebase-token"]) {
      await client.close();
      await firebaseApp.delete();
      res.status(400).json({
        error: "You must provide a Firebase token.",
        status: "failure",
      });
    }
    const user = await auth.verifyIdToken(req.headers["x-firebase-token"]);
    const isAdmin = await usersCollection.findOne({
      admin: true,
      uid: user.uid,
    });
    await client.close();
    await firebaseApp.delete();
    if (!!isAdmin) {
      res.status(200).json({ status: "success" });
    } else {
      res.status(401).json({
        error: "You are not a Caf App administrator.",
        status: "failure",
      });
    }
  } else if (req.method == "OPTIONS") {
    res.status(200).send();
  }
}
