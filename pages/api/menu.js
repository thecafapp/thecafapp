import { MongoClient } from "mongodb";
import isDST from "../../utils/isDST";

export default async function handler(req, res) {
  const client = new MongoClient(process.env.CAFMONGO);
  const dbName = "info";
  await client.connect();
  const db = client.db(dbName);
  const menuCollection = db.collection("menu");
  if (req.query.shim) {
    const mealEnd = Date.now() + 900000;
    json.meals = [
      {
        name: "Dinner",
        start: Date.now() - 120000,
        end: mealEnd,
        times: "7:00PM - 9:45PM",
        menu: [
          "Spaghetti",
          "Italian Pasta",
          "Spinach",
          "Salad",
          "Breakfast Bar",
        ],
      },
    ];
    res.status(200).json(json);
    return;
  }
  try {
    let menuDate = "";
    if (req.query?.date) {
      if (!req.query?.date.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
        return res.status(400).json({
          error:
            "Invalid date format.  Specify a date in the format YYYY-MM-DD",
        });
      } else {
        menuDate = req.query.date;
      }
    } else {
      // Timezone offset from UTC in minutes
      // should be 300 for CDT and 360 for CST
      const offset = isDST() ? 300 : 360;
      const date = new Date(new Date().getTime() - offset * 60 * 1000);
      menuDate = date.toISOString().split("T")[0];
    }
    const menu = await menuCollection.findOne({
      date: menuDate,
    });
    if (!menu) {
      return res
        .setHeader("Cache-Control", "max-age=500")
        .status(404)
        .json({ error: "No menu for the current mealtime" });
    }
    await client.close();
    menu.meals = menu.meals.filter((item) => item.end > Date.now());
    if (menu.meals.length === 0) {
      return res
        .setHeader("Cache-Control", "max-age=500")
        .status(200)
        .json(menu);
    }
    const currentMealEnd = menu.meals[0].end;
    let cacheAge = Math.floor((currentMealEnd - Date.now()) / 1000) - 200;
    cacheAge = cacheAge < 900 ? cacheAge : 900;
    return res
      .setHeader("Cache-Control", `max-age=${cacheAge}, public`)
      .status(200)
      .json(menu);
  } catch (e) {
    console.error(e);
    res
      .setHeader("Cache-Control", "max-age=120, public")
      .status(500)
      .json(
        "Encountered a server error. Please report this to hi@micahlindley.com"
      );
  }
}
