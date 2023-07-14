import { MongoClient } from "mongodb";
export default async function handler(req, res) {
  const client = new MongoClient(process.env.CAFMONGO);
  const dbName = "info";
  await client.connect();
  const db = client.db(dbName);
  const badgesCollection = db.collection("badges");
  const usersCollection = db.collection("users");
  const metaCollection = db.collection("db-meta");
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
      client.close();
      res
        .setHeader("Cache-Control", "max-age=300, public")
        .status(200)
        .json(badges);
    } else if (req.query.all) {
      const badges = await badgesCollection
        .find({ id: { $exists: true } })
        .toArray();
      client.close();
      res
        .setHeader("Cache-Control", "max-age=600, public")
        .status(200)
        .json(badges);
    }
  } else if (req.method === "POST") {
    if (req.query.badge && req.query.user) {
      const meta = await metaCollection
        .find({ last_id: { $exists: true } })
        .toArray();
      const password = meta[0].password;
      if (req.headers["x-password"] === password) {
        await usersCollection.findOneAndUpdate(
          { uid: req.query.user },
          { $push: { badges: Number(req.query.badge) } }
        );
        res.status(200).send();
      } else {
        res.status(401).send();
      }
    } else {
      res.status(400).send();
    }
  } else if (req.method === "PUT") {
    let body = JSON.parse(req.body);
    if (body.color && body.name && body.id && body.icon) {
      const meta = await metaCollection
        .find({ last_id: { $exists: true } })
        .toArray();
      const password = meta[0].password;
      if (req.headers["x-password"] === password) {
        await badgesCollection.insertOne(body);
        res.status(200).send();
      } else {
        res.status(401).send();
      }
    } else {
      res.status(400).send();
    }
  } else {
    res.status(404).json({ error: "Method not found" });
  }
}
