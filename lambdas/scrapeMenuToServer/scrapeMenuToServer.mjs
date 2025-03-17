/*************************************\
 * THE CAF APP | MC -> MONGO SCRAPER *
 *      (c) 2024 Micah Lindley       *
 *       All rights reserved         *
\*************************************/

import { config } from "dotenv";
config({ path: "./.env.local" });
import fetch from "node-fetch";
import { MongoClient } from "mongodb";
const mongo = new MongoClient(process.env.CAFMONGO);
import parser from "jsdom";
import isDST from "./isDST.mjs";
// JSDOM is used to parse the HTML from the MC Cafeteria website
const { JSDOM } = parser;
// Import custom ignorelist for items that should not be displayed
const ignoreItems = ["*seafood night*", "menu not available", "tbd", "closed", ".", "chef's choice"];
/**
   * Generates a date object from a time and date string
   * @param {String} time - time string in the format "HH:MM AM/PM"
   * @param {String} date - date string in any standard date format (e.g. "January 1")
   * @returns {Date}
   */
const generateDate = (time, date) => {
  return (
    new Date(`${time}, ${date} ${new Date().getFullYear()} ${(isDST() ? "CDT" : "CST")}`) - 0
  );
};

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

class Mealtime {
  name = "";
  menu = [];
  start = 0;
  end = 0;
  closed = false;
  times = "";
  date;
  dayType;

  constructor(referenceDate = new Date()) {
    this.date = referenceDate;
    // Determine whether or not the meal should be treated as a weekday or weekend
    this.dayType =
      this.date.getDay() > 0 && this.date.getDay() < 6 ? "Weekday" : "Weekend";
  }

  mealExists(name) {
    if (!!mealTimes[this.dayType][name]) {
      return true;
    } else {
      return false;
    }
  }

  defineFromName(name) {
    this.name = name.trim();

    // Get the start and end times for the meal based on the day of the week and its name
    const mt = mealTimes[this.dayType][this.name];
    if (!this.mealExists(this.name)) {
      return false;
    }
    this.times = mt.start + " - " + mt.end;
    this.start = generateDate(
      mt.start,
      this.date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        timeZone: "America/Chicago",
      }));
    this.end = generateDate(
      mt.end,
      this.date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        timeZone: "America/Chicago",
      }));
  }

  setClosed(isClosed) {
    this.closed = isClosed;
  }

  addFood(foodName) {
    this.menu.push(foodName.trim().toLowerCase());
  }

  get json() {
    return {
      name: this.name,
      menu: this.closed ? [] : this.menu,
      times: this.times,
      start: this.start,
      end: this.end,
      closed: this.closed
    };
  }
}

/* This is the main scraper function.  It:
   1) Gets the current date and time in CST.
   3) Gets the menu for the current day.
   4) Filters out items that are on the ignore list.
   5) Creates a JSON object with the meals for the day.
   6) Stores that object in the MongoDB database
 */
const scrapeFromMcEdu = async (referenceDate = new Date()) => {
  // Initialize the JSON object that will eventually hold the day's information and be stored in Mongo
  const json = { meals: [], date: "", updatedAt: new Date() };
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
      referenceDate.toLocaleString("en-US", { timeZone: "America/Chicago" })
    );
    // Set the current date in an easily-readable format
    const currentDate = date.toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
    // Set the returned object's date to the current readable date
    json.date = currentDate;
    // Get the main content of the MC Cafeteria website
    const page = dom.window.document.querySelector("article.content");
    // Get every menu on the page
    // The MC Cafeteria website includes multiple menus for different dates, so we need to filter out the one for the current date.
    const allDates = page.querySelectorAll(".menu-date");
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
    menu.forEach((m) => {
      const meal = new Mealtime(referenceDate);
      // Check if the meal has a name, if it doesn't then it's not valid and should be skipped
      if (!!m.querySelector("h3").textContent) {
        // Set the name and times using the Mealtime class
        const name = m.querySelector("h3").textContent;
        if (meal.mealExists(name)) {
          meal.defineFromName(name);
          // Loop through each food category
          // Food categories are defined by <ul> or <ol> elements and are grouped by which station of the cafeteria they are served at
          for (const item of m.querySelectorAll(".item ul, .item ol")) {
            // Loop through each food *item* and add it to the items array
            for (const food of item.querySelectorAll("li")) {
              // Check if the food item should actually be added to the list
              // The MC Cafeteria website includes a lot of items that are not actually served, so we need to filter those out
              // Also filter out blank/empty items just in case
              if (
                food.textContent.trim().length > 0 &&
                !meal.menu.includes(food.textContent.trim()) &&
                !ignoreItems.includes(food.textContent.trim().toLowerCase())
              ) {
                // Push the item to the items array where it'll later be added to the JSON object
                meal.addFood(food.textContent);
              }
            }
          }
          // If by some chance the meal is breakfast, turn off the shim for that
          if (meal.name === "Breakfast") needsBreakfast = false;
          // Add the meal to the JSON object
          json.meals.push(meal.json);
        }
      }
      // This is the end of the meal loop.  For a normal day it will run twice (lunch and dinner)
    });

    // This is the breakfast shim.  For some reason, the MC Cafeteria website doesn't include breakfast on the menu most of the time.
    // This is a workaround to make sure that breakfast is included in the JSON object if it's a weekday.
    // To be honest this really needs to be cleaned up quite a bit - the date formatting specifically.
    const breakfast = new Mealtime(referenceDate);
    breakfast.defineFromName("Breakfast");
    if (breakfast.dayType === "Weekday") {
      if (needsBreakfast) json.meals.unshift(breakfast.json);
    }
    // Upload the JSON object to the MongoDB database
    const dbName = "info";
    await mongo.connect();
    const db = mongo.db(dbName);
    const menuCollection = db.collection("menu");
    await menuCollection.replaceOne({ date: json.date }, json, {
      upsert: true,
    });
    console.log("Uploaded to MongoDB successfully");
    return { status: true, error: null };
  } catch (err) {
    console.log(err);
    return { status: false, error: err.message };
  }
};

export const handler = async () => {
  let tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const today = await scrapeFromMcEdu();
  const tomorrow = await scrapeFromMcEdu(tomorrowDate);
  return {
    today: today.status ? "Uploaded" : `Failed: ${today.error}`,
    tomorrow: tomorrow.status ? "Uploaded" : `Failed: ${tomorrow.error}`,
  };
}