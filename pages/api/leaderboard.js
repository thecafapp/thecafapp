import { MongoClient } from "mongodb";
export default async function handler(req, res) {
  const client = new MongoClient(process.env.CAFMONGO);
  const dbName = "info";
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection("users");
  if (req.method == "GET") {
    if (req.query.id) {
      const user = await collection.findOne({ uid: req.query.id });
      if (user) {
        client.close();
        res
          .setHeader("Cache-Control", "max-age=170, public")
          .status(200)
          .json(user);
      } else {
        client.close();
        res.status(404).json({ error: "User not found" });
      }
    } else {
      const users = await collection
        .find({})
        .sort({ points: -1 })
        .limit(10)
        .toArray();
      if (users.length > 0) {
        client.close();
        res
          .setHeader("Cache-Control", "max-age=300, public")
          .status(200)
          .json({ leaderboard: users });
      } else {
        client.close();
        res.status(404).json({ error: "No users in leaderboard" });
      }
    }
  }
}
