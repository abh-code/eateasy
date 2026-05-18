# EatEasy — Meal & Brewery Discovery Web Application

## Description

EatEasy is a full stack web application built for INST 377 that helps users discover new recipes, find local craft breweries, and pair cocktails with their meals all in one place. Users can search for meals by ingredient, get a random meal suggestion from around the world, find breweries in any U.S. city, and browse cocktail recipes by ingredient. Any meal or cocktail can be saved to a personal favorites list powered by a Supabase database on the backend.

Built by Amar Hassan | INST 377 | Spring 2026 | University of Maryland

## Target Browsers

EatEasy was designed and tested on the following platforms. On desktop it supports Chrome 120+, Firefox 120+, Safari 17+, and Edge 120+. On mobile it supports iOS Safari on iOS 16 and above as well as Chrome for Android on Android 12 and above. The layout is fully responsive down to 375px wide viewports. Internet Explorer is not supported.

## Link to Developer Manual

The Developer Manual is located in the bottom half of this README file below.

---

# Developer Manual

## Audience

This document is written for future developers who will be taking over or extending the EatEasy codebase. It assumes familiarity with general web development concepts, Node.js, and REST APIs, but does not assume any prior knowledge of how this specific system is built or structured.

---

## How to Install the Application and All Dependencies

To get started you will need Node.js version 18 or higher and npm version 9 or higher installed on your machine, both of which can be downloaded from nodejs.org. You will also need a Supabase account which is free at supabase.com, and a Vercel account for deployment at vercel.com.

Start by cloning the repository and installing dependencies.

```bash
git clone https://github.com/abh-code/eateasy.git
cd eateasy
npm install
```

Next you need to set up your environment variables. Copy the example file and fill it in with your Supabase credentials.

```bash
cp .env.example .env
```

Open the .env file and replace the placeholder values with your actual Supabase project URL and anon key, which you can find in your Supabase project under Settings then API.

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
PORT=3000
```

Finally you need to set up the database. Log into supabase.com, open your project, click SQL Editor in the left sidebar, and paste in the contents of docs/supabase_setup.sql. Click Run and you should see a success message. This creates the favorites table that the application reads from and writes to.

---

## How to Run the Application on a Server

To run the application locally in development mode with automatic restarts on file changes, use the following command.

```bash
npm run dev
```

Then open your browser to http://localhost:3000. To run the application in production mode without automatic restarts, use this instead.

```bash
npm start
```

---

## How to Run Tests

The test suite is written as a plain Node.js script with no additional testing framework required. Before running tests you need the server to be running in a separate terminal window. Then run the following command.

```bash
npm test
```

The test script at tests/api.test.js sends real HTTP requests to localhost:3000 and checks that every API endpoint returns the correct status codes and data shapes. Results are printed to the console with a pass and fail count at the end. Tests involving the favorites endpoints may show failures if Supabase credentials are not configured in the .env file, which is expected behavior in environments without a database connection.

---

## API Endpoints

All endpoints are served from the Express server in server.js. In production the base URL is your Vercel deployment URL.

**GET /api/meals/random**

Returns a single random meal from TheMealDB. The response is a meals array containing one object with fields like idMeal, strMeal, strCategory, strArea, strInstructions, strMealThumb, strYoutube, and up to 20 ingredient and measure fields.

**GET /api/meals**

Searches meals by ingredient. Requires an ingredient query parameter such as /api/meals?ingredient=chicken. Returns a meals array of basic meal objects. Returns a 400 status if the ingredient parameter is missing.

**GET /api/meals/:id**

Fetches the full detail object for a single meal by its TheMealDB ID. Returns the same full meal object shape as the random endpoint.

**GET /api/breweries**

Returns up to 10 breweries in a given U.S. city. Requires a city query parameter such as /api/breweries?city=Baltimore. Returns an array of brewery objects with fields including name, brewery_type, street, city, state, phone, and website_url. Returns a 400 status if the city parameter is missing.

**GET /api/cocktails**

Searches cocktails by ingredient. Requires an ingredient query parameter such as /api/cocktails?ingredient=vodka. Returns a drinks array of basic cocktail objects. Returns a 400 status if the ingredient parameter is missing.

**GET /api/cocktails/:id**

Fetches the full detail object for a single cocktail by its TheCocktailDB ID. Returns a drinks array containing one object with fields like strDrink, strCategory, strAlcoholic, strGlass, strInstructions, strDrinkThumb, and up to 15 ingredient and measure fields.

**GET /api/favorites**

Returns all saved favorites from Supabase ordered by most recent first. Accepts an optional type query parameter to filter by meal or cocktail. Returns an array of favorite objects with id, type, item_id, item_name, item_image, and created_at fields.

**POST /api/favorites**

Saves a new favorite to the Supabase database. Requires a JSON body with type, item_id, and item_name fields. The item_image field is optional. Returns a 400 status if any required fields are missing and a 500 status if the Supabase insert fails.

**DELETE /api/favorites/:id**

Removes a favorite from the database by its Supabase UUID. Returns a success confirmation on success and a 500 status if the delete fails.

---

## Project File Structure

The project is organized as follows. The server.js file at the root is the main Express server containing all API route logic. The public folder contains all frontend assets including six HTML pages, a single CSS stylesheet at public/css/style.css, and four JavaScript files at public/js/ for each interactive page. The docs folder contains the Supabase SQL setup script. The tests folder contains the API test script. The vercel.json file at the root configures how Vercel builds and routes the application.

---

## Deploying to Vercel

Push the repository to a public GitHub repo. Log into vercel.com and click Add New Project. Import your GitHub repository. Before clicking Deploy, scroll down to the Environment Variables section and add SUPABASE_URL and SUPABASE_ANON_KEY with your Supabase credentials. Click Deploy and Vercel will handle the rest using the vercel.json configuration file. Your app will go live at a URL like https://eateasy.vercel.app.

---

## Known Bugs and Limitations

The favorites feature requires Supabase credentials to be set. Without them the favorites page will display an error but all other pages will work normally. TheMealDB's free tier occasionally returns null for ingredient searches if the term does not exactly match their database. Open Brewery DB city searches are case sensitive and require U.S. city names spelled correctly, so typos will return empty results. There is currently no user authentication, meaning all favorites are stored globally and visible to anyone using the application. This is a known scope limitation for this version of the project.

---

## Roadmap for Future Development

The most impactful next step would be adding Supabase Auth so each user has their own private favorites list. Beyond that, the application could be extended to support saving breweries as favorites, building a weekly meal plan from saved meals, storing recent search history as quick access chips, and adding pagination to meal and cocktail result sets which are currently capped. A longer term goal would be adding a service worker and web manifest to support Progressive Web App installation on mobile devices.

---

EatEasy | INST 377 | Spring 2026 | Amar Hassan | University of Maryland
