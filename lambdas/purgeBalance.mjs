import { config } from "dotenv";
config({ path: "./.env.local" });
import Prompt from "prompt-sync";
const prompt = Prompt({ sigint: true });
import { MongoClient } from "mongodb";
const client = new MongoClient(process.env.CAFMONGO);
export const handler = async () => {
  const confirm = prompt(
    "Are you sure you want to continue purging the balances for all users? (y/n) "
  );
  if (confirm !== "y") return;
  await client.connect();
  const db = client.db("info");
  const meta = db.collection("db-meta");
  const dbMeta = await meta.findOne({ purge_key: { $exists: true } });
  const purgeKey = dbMeta.purge_key;
  const purgeInput = prompt("Enter the purge key from db-meta: ");
  if (purgeInput !== purgeKey) {
    throw new Error("Invalid purge key, please try again.");
    return;
  }
  console.warn("DELETING ALL USER BALANCES.");
  const users = db.collection("users");
  await users.updateMany(
    { points: { $exists: true } },
    { $unset: { balance: 1 } }
  );
  console.log("Deleted all user balance values.");
  return;
};

handler();
