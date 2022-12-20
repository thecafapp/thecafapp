import { MongoClient } from "mongodb";
export default async function handler(req, res) {
  const client = new MongoClient(process.env.CAFMONGO);
  const dbName = "info";
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("db-meta");
  if (req.method == "GET") {
    const memos = await collection
      .find({ memo_text: { $exists: true } })
      .toArray();
    res
      .setHeader("Cache-Control", "max-age=120, public")
      .status(200)
      .json(memos[0]);
  }
}
