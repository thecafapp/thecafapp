import { MongoClient } from "mongodb";
export default async function handler(req, res) {
  const client = new MongoClient(process.env.CAFMONGO);
  const dbName = "info";
  await client.connect();
  const db = client.db(dbName);
  const badgesCollection = db.collection("badges");
  if (req.method == "GET") {
    if (req.query.ids) {
      let split = req.query.ids.split(",");
      split.forEach((item, i) => {
        split[i] = Number(item);
      });
      const badges = await badgesCollection
        .find({
          id: { $in: split },
        })
        .toArray();
      res.status(200).json(badges);
    } else {
      res.status(400).json({
        error: "You must provide a comma separated list of badge IDs.",
      });
    }
  } else {
    res.status(404).json({ error: "Method not found" });
  }
}
