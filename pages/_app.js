import "../styles/globals.css";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.CAFANALYID}`}
      />

      <Script strategy="afterInteractive">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.CAFANALYID}', {
        page_path: window.location.pathname,
        });
    `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
