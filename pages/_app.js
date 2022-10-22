import "../styles/globals.css";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  useEffect(() => {}, []);
  return <Component {...pageProps} />;
}

export default MyApp;
