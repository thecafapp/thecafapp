import isDST from "../../utils/isDST";

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
      image:
        "/_next/image?url=%2Fassets%2Frestaurants%2Fchick-fil-a.jpg&w=640&q=75",
      logo: "/assets/restaurants/logos/ChickFilA-logo.png",
      location: "Lower Alumni",
      link: "https://goo.gl/maps/h86wkkoe8XtnvoKg8",
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
      image:
        "/_next/image?url=%2Fassets%2Frestaurants%2Feinsteins.jpg&w=640&q=75",
      logo: "/assets/restaurants/logos/Einsteins-logo.png",
      location: "Lower Alumni",
      link: "https://goo.gl/maps/nTg1dEP7Xikz7Bv3A",
      color: "#6f5e00",
    },
    {
      name: "Brick Street Burgers",
      hours: {
        "M-T": {
          open: "11:00 AM",
          close: "9:00 PM",
        },
        F: {
          open: "11:00 AM",
          close: "3:00 PM",
        },
        "S-S": {
          open: null,
          close: null,
          current: false,
        },
      },
      image:
        "/_next/image?url=%2Fassets%2Frestaurants%2Fbrickstreet.jpg&w=640&q=75",
      logo: "/assets/restaurants/logos/BrickStreet-logo.png",
      location: "Jefferson Street",
      link: "https://maps.app.goo.gl/om4myduo71yDiaq38",
      color: "#001a6f",
    },
    {
      name: "Starbucks",
      hours: {
        "M-T": {
          open: "7:30 AM",
          close: "9:00 PM",
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
      image:
        "/_next/image?url=%2Fassets%2Frestaurants%2Fstarbucks.jpg&w=640&q=75",
      logo: "/assets/restaurants/logos/Starbucks-logo.png",
      link: "https://goo.gl/maps/BYP1dH3bNZihewrv8",
      location: "Speed Library",
      color: "#004302",
    },
  ];
  const generateDate = (time) => {
    return (
      new Date(
        new Date().toDateString("en-US", { timeZone: "CST" }) +
        ", " +
        time +
        " CST"
      ) - (isDST() ? 3600000 : 0) // set to 3600000 for Daylight Savings, 0 for not
    );
  };
  const json = { restaurants: [] };
  const date = new Date(new Date().toLocaleString("en-US", {}));
  const dow = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "CST",
    })
  ).getDay();
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
      if (date.getTime() >= open && date.getTime() <= close) {
        hours.current = true;
      } else {
        hours.current = false;
      }
    }
    rr.hours = hours;
    json.restaurants.push(rr);
  });
  res.setHeader("Cache-Control", "max-age=600, public").status(200).json(json);
}
