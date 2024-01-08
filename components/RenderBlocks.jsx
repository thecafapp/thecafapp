import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
const Timer = dynamic(() => import("./blocks/Timer"), {
  ssr: false,
});
const Divider = dynamic(() => import("./blocks/Divider"), {
  ssr: false,
});
const Meals = dynamic(() => import("./blocks/Meals"), {
  ssr: false,
});
const Vote = dynamic(() => import("./blocks/Vote"), {
  ssr: false,
});
const Memo = dynamic(() => import("./blocks/Memo"), {
  ssr: false,
});
const Restaurants = dynamic(() => import("./blocks/Restaurants"), {
  ssr: false,
});
const Leaderboard = dynamic(() => import("./blocks/Leaderboard"), {
  ssr: false,
});
const PointTracker = dynamic(() => import("./blocks/PointTracker"), {
  ssr: false,
});
const TopFoods = dynamic(() => import("./blocks/TopFoods"), {
  ssr: false,
});
export default function RenderBlocks({
  renderLayout = [
    "Timer",
    "Meals",
    "Divider",
    "Vote",
    "Divider",
    "Memo",
    "Restaurants",
    "Divider",
    "Leaderboard",
    "PointTracker",
    "Divider",
    "TopFoods",
    "Divider",
  ],
  cafData,
  shimData = false,
  memo,
  showMemo,
  closeMemo,
  menuError,
}) {
  const componentList = {
    Timer,
    Divider,
    Meals,
    Vote,
    Memo,
    Leaderboard,
    Restaurants,
    PointTracker,
    TopFoods,
  };
  const [toRender, setToRender] = useState([]);
  useEffect(() => {
    let tempArray = [];
    renderLayout.forEach((blockName) => {
      if (componentList[blockName]) {
        tempArray.push({ component: componentList[blockName] });
        switch (blockName) {
          case "Timer": {
            tempArray[tempArray.length - 1].props = {
              meal: cafData?.meals[0] || null,
              error: menuError,
            };
            break;
          }
          case "Meals": {
            tempArray[tempArray.length - 1].props = {
              cafData: cafData,
            };
            break;
          }
          case "Vote": {
            tempArray[tempArray.length - 1].props = {
              currentMealtime: cafData.meals[0],
            };
            break;
          }
          case "Memo": {
            tempArray[tempArray.length - 1].props = {
              memo: memo,
              closeMemo: closeMemo,
              showMemo: showMemo,
            };
            break;
          }
        }
        setToRender(tempArray);
      }
    });
  }, [cafData, memo, showMemo]);
  return (
    <div>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        {toRender.map((Component, index) => (
          <Component.component
            key={index}
            {...Component.props}
          ></Component.component>
        ))}
      </ErrorBoundary>
    </div>
  );
}
