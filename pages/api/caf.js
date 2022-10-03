// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const parser = require("jsdom");
const { JSDOM } = parser;
export default async function handler(req, res) {
  const json = { meals: [], date: "" };
  const result = await fetch("https://www.mc.edu/offices/food/caf");
  const data = await result.text();
  const dom = new JSDOM(data);
  const page = dom.window.document.querySelector("article.content");
  const menu = page.querySelector(".items").querySelectorAll(".item");
  const menuDate = page.querySelector("h3").textContent.trim();
  const generateDate = (time) => {
    return (
      new Date(
        menuDate +
          ", " +
          time +
          " " +
          new Date(Date.now()).getFullYear() +
          "CST"
      ) - 3600000
    );
  };
  json.date = new Date(
    menuDate + ", 0:00" + new Date(Date.now()).getFullYear() + "CST"
  );
  menu.forEach((meal) => {
    let items = [];
    const time = meal.querySelector("p").textContent.trim();
    meal.querySelectorAll("html-blob ul").forEach((item) => {
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
  res
    .setHeader("Cache-Control", "max-age=30000, public")
    .status(200)
    .json(json);
}
