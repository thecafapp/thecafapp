import { config } from "dotenv";
config({ path: "./.env.local" });
import { MongoClient } from "mongodb";

async function mainFn() {
  const client = new MongoClient(process.env.CAFMONGO);
  const dbName = "info";
  const db = client.db(dbName);
  const foodsCollection = db.collection("foods");
  const agg = [
    {
      $group: {
        _id: "$name",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $match: {
        _id: {
          $ne: null,
        },
        count: {
          $gt: 1,
        },
      },
    },
    { $sort: { count: -1 } },
  ];
  const cursor = foodsCollection.aggregate(agg);
  const result = await cursor.toArray();
  result.forEach(async (dupe) => {
    let newDoc = {
      name: dupe._id,
      rating: 0,
      ratings: 0,
    };
    for (let i = 0; i < dupe.count; i++) {
      const dupes = await foodsCollection.find({ name: dupe._id }).toArray();
      dupes.forEach((doc) => {
        newDoc.rating =
          doc.rating * doc.ratings + newDoc.rating * newDoc.ratings;
        newDoc.rating /= newDoc.ratings + doc.ratings;
        newDoc.ratings += doc.ratings;
      });
      await foodsCollection.updateOne(
        { _id: dupes[0]._id },
        {
          $set: {
            rating: newDoc.rating,
            ratings: newDoc.ratings,
          },
        }
      );
      dupes.forEach(async (doc, i) => {
        if (i > 0) {
          await foodsCollection.deleteOne({ _id: doc._id });
        }
      });
    }
  });
  console.log("done, Ctrl+C to exit");
}

mainFn();
