const parser = require("jsdom");
const { JSDOM } = parser;
export default async function handler(req, res) {
  const mealTimes = {
    Weekday: {
      Breakfast: {
        start: "7:00 AM",
        end: "9:30 AM",
      },
      Lunch: {
        start: "10:30 AM",
        end: "2:00 PM",
      },
      Dinner: {
        start: "4:30 PM",
        end: "7:00 PM",
      },
    },
    Weekend: {
      Lunch: {
        start: "11:00 AM",
        end: "1:30 PM",
      },
      Dinner: {
        start: "4:30 PM",
        end: "6:30 PM",
      },
    },
  };
  const json = { meals: [], date: "" };
  const generateDate = (time, date) => {
    console.log(`${time}, ${time} ${new Date().getFullYear()} CST`);
    return (
      new Date(`${time}, ${date} ${new Date().getFullYear()} CST`) - 3600000 // set to 3600000 for Daylight Savings Time, 0 for not
    );
  };
  if (req.query.shim) {
    const mealEnd = Date.now() + 900000;
    const cacheAge = Math.floor((mealEnd - Date.now()) / 1000) - 200;
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
    res
      .setHeader("Cache-Control", `max-age=${cacheAge}, public`)
      .status(200)
      .json(json);
    return;
  }
  const result = await fetch("https://www.mc.edu/offices/food/caf");
  const data = await result.text();
  const dom = new JSDOM(data);
  try {
    let needsBreakfast = true;
    const date = new Date();
    const currentDate = `${date.getFullYear()}-${(
      "0" + String(date.getMonth() + 1)
    ).slice(-2)}-${("0" + String(date.getDate())).slice(-2)}`;
    const page = dom.window.document.querySelector("article.content");
    const allDates = page.querySelectorAll(".menu-date");
    const dayType = date.getDay() < 5 ? "Weekday" : "Weekend";
    const menu = Array.from(allDates)
      .filter((day) => day.getAttribute("id") === currentDate)[0]
      .querySelectorAll(".menu-location");
    json.date = generateDate(
      `${new Date().getHours()}:${new Date().getMinutes()}`,
      new Date().toLocaleString("en-US", { month: "long", day: "numeric" })
    );
    menu.forEach((meal) => {
      let items = [];
      const mealName = meal.querySelector("h3").textContent.trim();
      meal.querySelectorAll(".item ul").forEach((item) => {
        item.querySelectorAll("li").forEach((food) => {
          items.push(food.textContent.trim());
        });
      });
      if (mealName === "Breakfast") needsBreakfast = false;
      const thisMealTimes = mealTimes[dayType][mealName];
      json.meals.push({
        name: mealName,
        start: generateDate(
          thisMealTimes.start,
          new Date().toLocaleString("en-US", { month: "long", day: "numeric" })
        ),
        end: generateDate(
          thisMealTimes.end,
          new Date().toLocaleString("en-US", { month: "long", day: "numeric" })
        ),
        times: thisMealTimes.start + " - " + thisMealTimes.end,
        menu: items,
      });
    });
    if (dayType === "Weekday") {
      const breakfast = {
        name: "Breakfast",
        start: generateDate(
          mealTimes.Weekday.Breakfast.start,
          new Date().toLocaleString("en-US", { month: "long", day: "numeric" })
        ),
        end: generateDate(
          mealTimes.Weekday.Breakfast.end,
          new Date().toLocaleString("en-US", { month: "long", day: "numeric" })
        ),
        times: `${mealTimes.Weekday.Breakfast.start} - ${mealTimes.Weekday.Breakfast.end}`,
        menu: [],
      };
      if (needsBreakfast) json.meals.unshift(breakfast);
    }
    const currentMealEnd = json.meals[0].end;
    const cacheAge = Math.floor((currentMealEnd - Date.now()) / 1000) - 200;
    res
      .setHeader("Cache-Control", `max-age=${cacheAge}, public`)
      .status(200)
      .json(json);
  } catch (err) {
    console.log(err);
    res
      .setHeader("Cache-Control", "max-age=120, public")
      .status(200)
      .json({ error: true });
  }
}
