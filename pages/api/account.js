import { MongoClient } from "mongodb";
import firebaseAdmin from "firebase-admin";
const firebaseApp = firebaseAdmin.initializeApp({
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
});
export default async function handler(req, res) {
  const client = new MongoClient(process.env.CAFMONGO);
  const dbName = "info";
  await client.connect();
  const db = client.db(dbName);
  const usersCollection = db.collection("users");
  if (req.method == "DELETE") {
    if (req.query.id) {
      const auth = firebaseApp.auth();
      auth.deleteUser(req.query.id).then(async () => {
        await usersCollection.deleteOne({ uid: req.query.id });
        res.status(200).json({ status: "success" });
      });
    } else {
      res.status(400).json({
        error:
          "You must provide a unique consistent UID, expiry, and a rating.",
      });
    }
  }
}
