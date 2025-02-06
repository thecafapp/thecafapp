import { useEffect, useState, useRef, useCallback } from "react";
import Restaurant from "../Restaurant";
import s from "../../styles/Restaurants.module.css";

/**
 * @desc Block that provides a horizontally-scrolling list of available restaurants that are not the cafeteria, sorted by whether or not the location is open.
 */
export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const restaurantsRef = useRef(null);
  const restaurantScroll = useCallback(
    (e) => {
      if (e.deltaX === 0) {
        e.preventDefault();
        e.target.scrollLeft += e.deltaY * 10;
      }
    },
    [],
  );
  const divRefCallback = useCallback(
    (node) => {
      if (node == null) {
        return;
      }
      node.addEventListener('wheel', restaurantScroll, { passive: false });
    },
    [restaurantScroll],
  );

  useEffect(() => {
    fetch("/api/restaurants")
      .then((res) => res.json())
      .then((info) => {
        setRestaurants(info.restaurants);
      });
  }, []);
  return (
    <div ref={divRefCallback}>
      <h3 className={s.title}>Other Dining</h3>
      <div className={s.wrapper}>
        <div
          className={s.restaurants}
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
    </div>
  );
}
