// CACHE PLEASE
const parser = require("jsdom");
const { JSDOM } = parser;
const { ignoreItems } = require("../../public/ignore-items.json");
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
    return (
      new Date(`${time}, ${date} ${new Date().getFullYear()} CST`) - 0 // set to 3600000 for Daylight Savings Time, 0 for not
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
    const dayType =
      date.getDay() > 0 && date.getDay() < 6 ? "Weekday" : "Weekend";
    const menu = Array.from(allDates)
      .filter((day) => day.getAttribute("id") === currentDate)[0]
      .querySelectorAll(".menu-location");
    menu.forEach((meal) => {
      let items = [];
      const mealName = meal.querySelector("h3").textContent.trim();
      meal.querySelectorAll(".item ul, .item ol").forEach((item) => {
        item.querySelectorAll("li").forEach((food) => {
          if (
            food.textContent.trim().length > 0 &&
            food.textContent.trim() != "Menu Not Available" &&
            food.textContent.trim() != "TBD" &&
            food.textContent.trim() != "Closed" &&
            !items.includes(food.textContent.trim()) &&
            !ignoreItems.includes(food.textContent.trim())
          ) {
            items.push(food.textContent.trim());
          }
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
    if (
      dayType === "Weekday" &&
      date <
        generateDate(
          mealTimes.Weekday.Breakfast.end,
          new Date().toLocaleString("en-US", { month: "long", day: "numeric" })
        )
    ) {
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
    json.meals = json.meals.filter((item) => {
      if (item.end > Date.now()) return true;
      else return false;
    });
    const currentMealEnd = json.meals[0].end;
    let cacheAge = Math.floor((currentMealEnd - Date.now()) / 1000) - 200;
    cacheAge = cacheAge < 900 ? cacheAge : 900;
    res
      .setHeader("Cache-Control", `max-age=${cacheAge}, public`)
      .status(200)
      .json(json);
  } catch (err) {
    console.log(err);
    res.setHeader("Cache-Control", "max-age=120, public").status(500);
  }
}
