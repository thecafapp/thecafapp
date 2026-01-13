import Head from "next/head";
import "../styles/globals.css";
import { GoogleAnalytics } from "nextjs-google-analytics";
import { generateCssVariables } from "../utils/generateCSSVariables";
const theme = process.env.NEXT_PUBLIC_SCHOOL_THEME || {};
const lightVars = generateCssVariables(theme.light);
const darkVars = generateCssVariables(theme.dark);

const styleTag = `
    :root {
      ${lightVars}
    }
    @media (prefers-color-scheme: dark) {
      :root {
        ${darkVars}
      }
    }
  `;

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <style dangerouslySetInnerHTML={{ __html: styleTag }}></style>
      </Head>
      <GoogleAnalytics trackPageViews />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
