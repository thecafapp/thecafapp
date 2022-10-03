// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export default async function handler(req, res) {
  const restaurants = [
    {
      name: "Chick-Fil-A",
      hours: {
        "M-T": {
          open: "10:30 AM",
          close: "6:00 PM",
        },
        F: {
          open: "10:30 AM",
          close: "3:00 PM",
        },
        "S-S": {
          open: null,
          close: null,
          current: false,
        },
      },
      image: "/assets/restaurants/chick-fil-a.jpg",
      color: "#a00000",
    },
    {
      name: "Einstein's",
      hours: {
        "M-T": {
          open: "7:30 AM",
          close: "3:00 PM",
        },
        F: {
          open: "7:30 AM",
          close: "2:00 PM",
        },
        "S-S": {
          open: null,
          close: null,
          current: false,
        },
      },
      image: "/assets/restaurants/einsteins.jpg",
      color: "#6f5e00",
    },
    {
      name: "Starbucks",
      hours: {
        "M-T": {
          open: "7:30 AM",
          close: "3:00 PM",
        },
        F: {
          open: "7:30 AM",
          close: "3:00 PM",
        },
        "S-S": {
          open: null,
          close: null,
          current: false,
        },
      },
      image: "/assets/restaurants/starbucks.jpg",
      color: "#004302",
    },
    {
      name: "Corner Grill",
      hours: {
        "M-T": {
          open: "4:30 AM",
          close: "8:30 PM",
        },
        F: {
          open: null,
          close: null,
          current: false,
        },
        "S-S": {
          open: null,
          close: null,
          current: false,
        },
      },
      image: "/assets/restaurants/corner.jpg",
      color: "#000c43",
    },
  ];
  const generateDate = (time) => {
    return (
      new Date(new Date().toDateString() + ", " + time + " " + "CST") - 3600000
    );
  };
  const json = { restaurants: [] };
  const dow = new Date().getDay();
  restaurants.forEach((rr, i) => {
    let hours = {};
    if (rr.hours) {
      if (dow >= 1 && dow <= 4) {
        hours = rr.hours["M-T"];
      } else if (dow == 5) {
        hours = rr.hours.F;
      } else {
        hours = rr.hours["S-S"];
      }
    }
    if (hours.open) {
      let open = generateDate(hours.open);
      let close = generateDate(hours.close);
      console.log(rr.name);
      if (new Date() >= open && new Date() <= close) {
        hours.current = true;
      } else {
        hours.current = false;
      }
    }
    rr.hours = hours;
    json.restaurants.push(rr);
  });
  res
    .setHeader("Cache-Control", "max-age=30000, public")
    .status(200)
    .json(json);
}
