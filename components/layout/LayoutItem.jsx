import React, { forwardRef } from 'react';
import s from "../../styles/LayoutItem.module.css";

export default forwardRef(({ id, name, ...props }, ref) => {
  return (
    <div {...props} className={s.item} ref={ref}><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" /></svg> {name}</div>
  )
});