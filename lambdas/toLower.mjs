import { MongoClient } from "mongodb";

async function mainFn() {
  const client = new MongoClient(process.env.CAFMONGO);
  const dbName = "info";
  const db = client.db(dbName);
  const foodsCollection = db.collection("foods");
  foodsCollection.updateMany({}, [{ $set: { name: { $toLower: "$name" } } }]);
  console.log("done, Ctrl+C to exit");
}

mainFn();
