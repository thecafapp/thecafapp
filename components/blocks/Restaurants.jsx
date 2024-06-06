import { useEffect, useState, useRef } from "react";
import Restaurant from "../Restaurant";
import s from "../../styles/Restaurants.module.css";

/**
 * @desc Block that provides a horizontally-scrolling list of available restaurants that are not the cafeteria, sorted by whether or not the location is open.
 */
export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const restaurantsRef = useRef(null);
  const restaurantScroll = (e) => {
    restaurantsRef.current.scrollBy(e.deltaY, 0);
  };
  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((info) => {
        setRestaurants(info.restaurants);
      });
  }, []);
  return (
    <>
      <h3 className={s.title}>Other Dining</h3>
      <div className={s.wrapper}>
        <div
          className={s.restaurants}
          onWheel={restaurantScroll}
          ref={restaurantsRef}
        >
          {restaurants
            .sort((a) => {
              if (a.hours.current == true) {
                return -1;
              } else {
                return 1;
              }
            })
            .map((rr, i) => (
              <Restaurant restaurant={rr} key={i} />
            ))}
        </div>
      </div>
      <p className={s.notice}>
        <b>Notice:</b> this section may vary on breaks and holidays
      </p>
    </>
  );
}
