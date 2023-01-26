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
    if (memos.length > 0) {
      res
        .setHeader("Cache-Control", "max-age=120, public")
        .status(200)
        .json(memos[0]);
    } else {
      res.status(404).json({ memo_id: -1 });
    }
  } else if (req.method == "POST") {
    const meta = await collection
      .find({ last_id: { $exists: true } })
      .toArray();
    const password = meta[0].password;
    const memo_id = meta[0].last_id;
    if (req.headers["x-password"] == password) {
      let body = JSON.parse(req.body);
      if (!body.memo_text || !body.memo_title || !memo.expiresAt) {
        res.status(400).send();
      }
      body.expiresAt = new Date(body.expiresAt);
      body.memo_id = memo_id + 1;
      console.log(body);
      await collection.updateOne(
        { last_id: memo_id },
        { $set: { last_id: memo_id + 1 } }
      );
      await collection.insertOne(body);
      res.status(201).send();
    } else {
      res.status(401).send();
    }
  }
}
