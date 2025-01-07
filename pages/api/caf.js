/*************************************\
 * THE CAF APP | MC -> MONGO SCRAPER *
 *      (c) 2024 Micah Lindley       *
 *       All rights reserved         *
\*************************************/

const isDST = require("../../utils/isDST");

const parser = require("jsdom");
// JSDOM is used to parse the HTML from the MC Cafeteria website
const { JSDOM } = parser;
// Import custom ignorelist for items that should not be displayed
const { ignoreItems } = require("../../public/ignore-items.json");

/* This is the main scraper function.
   1) gets the current date and time in CST.
   2) Checks if it is a weekday or weekend.
   3) Gets the menu for the current day.
   4) Filters out items that are on the ignore list.
   5) Creates a JSON object with the meals for the day.
   6) Stores that object in the MongoDB database
 */
export default async function handler(req, res) {
  // Define hardcoded mealtimes for the MC Cafeteria
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
  // Initialize the JSON object that will eventually hold the day's information and be stored in Mongo
  const json = { meals: [], date: "" };
  // Decide whether or not the API should be shimmed for testing
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
  /**
   * Generates a date object from a time and date string
   * @param {String} time - time string in the format "HH:MM AM/PM"
   * @param {String} date - date string in any standard date format (e.g. "January 1")
   * @returns {Date}
   */
  const generateDate = (time, date) => {
    return (
      new Date(`${time}, ${date} ${new Date().getFullYear()} CST`) - (isDST() ? 3600000 : 0) // set to 3600000 for Daylight Savings Time, 0 for not
    );
  };
  // Fetch the MC Cafeteria website's raw HTML
  // We don't use Playwright or similar browser automation tools for the sake of speed
  const result = await fetch("https://www.mc.edu/offices/food/caf");
  const data = await result.text();
  // Transform the HTML into a virtual traversable DOM in Node
  const dom = new JSDOM(data);
  // This is the primary logic for actually creating the menu.  It's very error-prone which is why it's wrapped in this massive try-catch block
  try {
    // Breakfast is a special case because it's not included on the MC Cafeteria website the majority of the time.
    // By default we shim it if it's both not included on the menu and also before the end time of breakfast.
    let needsBreakfast = true;
    // Get the current date in CST
    const date = new Date(
      new Date().toLocaleString("en-US", { timeZone: "CST" })
    );
    // Set the current date in an easily-readable format
    const currentDate = `${date.getFullYear()}-${(
      "0" + String(date.getMonth() + 1)
    ).slice(-2)}-${("0" + String(date.getDate())).slice(-2)}`;
    // Set the returned object's date to the current readable date
    json.date = currentDate;
    // Get the main content of the MC Cafeteria website
    const page = dom.window.document.querySelector("article.content");
    // Get every menu on the page
    // The MC Cafeteria website includes multiple menus for different dates, so we need to filter out the one for the current date.
    const allDates = page.querySelectorAll(".menu-date");
    // Determine whether or not the meal should be treated as a weekday or weekend
    const dayType =
      date.getDay() > 0 && date.getDay() < 6 ? "Weekday" : "Weekend";
    // Filter out the menus to get the one for the current date
    const todayMeals = Array.from(allDates).filter(
      (day) => day.getAttribute("id") === currentDate
    );
    // If there is no meal for the current date, default to the first meal on the page
    // This can often occur after the last meal is over and the next day's menu is displayed instead
    const meals =
      todayMeals.length > 0 ? todayMeals[0] : Array.from(allDates)[0];
    const menu = meals.querySelectorAll(".menu-location");
    // Loop through each meal and get the foods that will be served
    menu.forEach((meal) => {
      // Initialize the array that will hold the items for the meal
      let items = [];
      // Check if the meal has a name, if it doesn't then it's not valid and should be skipped
      if (!!meal.querySelector("h3").textContent) {
        // Set the name if the meal has one
        const mealName = meal.querySelector("h3").textContent.trim();
        // Loop through each food *category*
        // Food categories are defined by <ul> or <ol> elements and are grouped by which station of the cafeteria they are served at
        meal.querySelectorAll(".item ul, .item ol").forEach((item) => {
          // Loop through each food *item* and add it to the items array
          item.querySelectorAll("li").forEach((food) => {
            // Check if the food item should actually be added to the list
            // The MC Cafeteria website includes a lot of items that are not actually served, so we need to filter those out
            // Also filter out blank/empty items just in case
            if (
              food.textContent.trim().length > 0 &&
              food.textContent.trim() != "Menu Not Available" &&
              food.textContent.trim() != "TBD" &&
              food.textContent.trim() != "Closed" &&
              !items.includes(food.textContent.trim()) &&
              !ignoreItems.includes(food.textContent.trim())
            ) {
              // Push the item to the items array where it'll later be added to the JSON object
              items.push(food.textContent.trim());
            }
          });
        });
        // If by some chance the meal is breakfast, turn off the shim for that
        if (mealName === "Breakfast") needsBreakfast = false;
        // Get the start and end times for the meal based on the day of the week and its name
        const thisMealTimes = mealTimes[dayType][mealName];
        // Add the meal to the JSON object
        json.meals.push({
          name: mealName,
          // Generate the start and end times for the meal as actual Date() objects
          start: generateDate(
            thisMealTimes.start,
            new Date().toLocaleString("en-US", {
              month: "long",
              day: "numeric",
            })
          ),
          end: generateDate(
            thisMealTimes.end,
            new Date().toLocaleString("en-US", {
              month: "long",
              day: "numeric",
            })
          ),
          // Generate the start and end times for the meal as user-friendly strings
          times: thisMealTimes.start + " - " + thisMealTimes.end,
          // Set the menu to the list of generated items
          menu: items,
        });
      }
      // This is the end of the meal loop.  For a normal day it will run twice (lunch and dinner)
    });

    // This is the breakfast shim.  For some reason, the MC Cafeteria website doesn't include breakfast on the menu most of the time.
    // This is a workaround to make sure that breakfast is included in the JSON object if it's before the end time of breakfast.
    // To be honest this really needs to be cleaned up quite a bit - the date formatting specifically.
    if (
      dayType === "Weekday" &&
      date <
      generateDate(
        mealTimes,
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
    // Filter out meals that have already ended (according to the hardcoded mealtimes, no it's not optimal)
    // json.meals = json.meals.filter((item) => {
    //   if (item.end > Date.now()) return true;
    //   else return false;
    // });
    // Get the end time of the current meal
    const currentMealEnd = json.meals[0].end;
    // Set the cache age to the time until the next meal ends
    let cacheAge = Math.floor((currentMealEnd - Date.now()) / 1000) - 200;
    cacheAge = cacheAge < 900 ? cacheAge : 900;
    json.deprecated = true;
    json.deprecationNotice = "You should not use this endpoint.  Instead use /api/menu"
    res
      .setHeader("Cache-Control", `max-age=${cacheAge}, public`)
      .status(200)
      .json(json);
  } catch (err) {
    console.log(err);
    res.setHeader("Cache-Control", "max-age=120, public").status(500);
  }
}
