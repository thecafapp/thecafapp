const parser = require("jsdom");
const { JSDOM } = parser;
export default async function handler(req, res) {
  const json = { meals: [], date: "" };
  const generateDate = (time, date) => {
    return (
      new Date(`${date},${time} ${new Date().getFullYear()} CST`) - 3600000 // set to 3600000 for Daylight Savings Time, 0 for not
    );
  };
  if (req.query.shim) {
    json.meals = [
      {
        name: "Lunch",
        start: generateDate("11:00 AM", "August 4"),
        end: generateDate("3:00 PM", "August 4"),
        times: "11:00AM - 3:00PM",
        menu: [
          "Spaghetti",
          "Italian Pasta",
          "Spinach",
          "Salad",
          "Breakfast Bar",
        ],
      },
    ];
    res.setHeader("Cache-Control", "max-age=60, public").status(200).json(json);
    return;
  }
  const result = await fetch("https://www.mc.edu/offices/food/caf");
  const data = await result.text();
  const dom = new JSDOM(data);
  try {
    const page = dom.window.document.querySelector("article.content");
    const menu = page.querySelector(".items").querySelectorAll(".item");
    const menuDate = page.querySelector("h3").textContent.trim();
    json.date = generateDate(Date.now(), menuDate);
    menu.forEach((meal) => {
      let items = [];
      const time = meal.querySelector("p").textContent.trim();
      meal
        .querySelectorAll(
          meal.querySelectorAll("span ul").length > 0 ? "span ul" : "ul"
        )
        .forEach((item) => {
          item.querySelectorAll("li").forEach((food) => {
            items.push(food.textContent.trim());
          });
        });
      json.meals.push({
        name: meal.querySelector("h4").textContent.trim(),
        start: generateDate(time.split("-")[0].trim()),
        end: generateDate(time.split("-")[1].trim()),
        times: time,
        menu: items,
      });
    });
    res.setHeader("Cache-Control", "max-age=60, public").status(200).json(json);
  } catch {
    res
      .setHeader("Cache-Control", "max-age=60, public")
      .status(200)
      .json({ error: true });
  }
}
