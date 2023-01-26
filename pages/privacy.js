import Head from "next/head";
import s from "../styles/Home.module.css";
import a from "../styles/Admin.module.css";
import Link from "next/link";

export default function Privacy() {
  return (
    <div className={s.container}>
      <Head>
        <title>Privacy | The Caf at MC</title>
        <meta
          name="description"
          content="Admin page to submit alerts to TheCaf.me"
        />
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
              TheCaf.me stores as little user data as possible. The only thing
              stored in our private database is your display name (from your
              Google account), your point value, and your unique ID (also
              connected to Google). This information is only stored and accessed
              on TheCaf.me and is not sold to third parties.
              <br />
              <br />
              Google grants us access to your email, profile picture, and other
              personal data. We do not share or transmit that data anywhere
              except on TheCaf.me.
              <br />
              <br />
              If you'd like your data to be deleted, log into TheCaf.me, click
              your profile picture, and select the Delete Account button. We
              will do our best to scrub all personal info from our servers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
