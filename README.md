# The Caf App

The Caf App is a the easiest way to access hours and the menu from the cafeteria at Mississippi College.

## Using The App

Go to https://thecaf.app/ and log in with your MC Google account!

## App Structure

There are several components to The Caf App.  The below diagram gives a top-down view of how all these components work together.

![](/public/app-structure.png)

### App Frontend

The frontend can be found at the root level of this repository.  It is a [React](https://react.dev) app powered by [Next.js](https://nextjs.org).

### Admin Panel

The code for the admin panel can also be found in this repository as part of the main frontend.

### Serverless Backend

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages, and handle most of the backend logic for the app.  

### Ephermal DB

Most of the data for the app is stored in a free [MongoDB](https://www.mongodb.com/) instance hosted on [Atlas](https://www.mongodb.com/atlas).  This includes users, badges, ratings, and more.

### Firebase Auth

Users are authenticated securely with Google's [Firebase Auth](https://firebase.google.com/products/auth) system, and user data is stored in MongoDB.

### Long-Term Data Storage (coming soon)

A free [AWS Lambda](https://aws.amazon.com/lambda) function found in `/lambdas` controlled by a two-minute cron job will back up all ratings at the end of each meal.  Data is taken from both the serverless API and directly from the MongoDB database, put together into a JSON file that is stored long-term in [Oracle Object Storage](https://www.oracle.com/cloud/storage/object-storage/).

### Data Analysis Frontend (coming soon)

Another separate Next.js project designed specifically for parsing and beautifying the long-term data from Oracle Object Storage will be released soon, enabling easier analysis of what the Caf at MC can improve on.