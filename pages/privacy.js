import Head from "next/head";
import s from "../styles/Home.module.css";
import a from "../styles/Admin.module.css";
import Link from "next/link";

export default function Privacy() {
  return (
    <div className={s.container}>
      <Head>
        <title>Privacy | The Caf at MC</title>
        <meta name="description" content="Privacy policy for The Caf App" />
        <link rel="icon" href="/icons/icon.png" />
      </Head>
      <main className={s.main}>
        <header className={s.header}>
          <Link href="/">
            <img src="/back.svg" />
          </Link>
          <h1>Privacy</h1>
        </header>
        <div className={s.content}>
          <div className={a.form}>
            <h2>Peace of mind.</h2>
            <p style={{ lineHeight: "1.3em" }}>
              For your privacy, The Caf App stores as little user data as
              possible. Our secure database holds your display name and user ID
              (from your Google account), your point value, your collected
              badges, and that is it. This information is only stored and
              accessed on The Caf App and is not sold or transferred to third
              parties. Ratings information for food and meals is stored
              long-term in Oracle Cloud, but your user ID is stripped from the
              data, making everything completely anonymous.
              <br />
              <br />
              Google grants us access to your email, profile picture, and other
              personal data. We do not share or transmit that data to third
              parties outside of The Caf App.
              <br />
              <br />
              We use Google Analytics to keep track of usage for The Caf App,
              with data that may include your device type, general geographic
              location, access frequency, and pageviews. This personal data is
              used for internal analysis only and is not used by The Caf App for
              advertising or marketing.
              <br />
              <br />
              If you&apos;d like your data to be deleted, log into The Caf App,
              click your profile picture, and select the Delete Account button.
              We will scrub all personal info from our servers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
