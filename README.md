# Affordmed URL Shortener (Frontend)

## Project Overview
A responsive React web application for shortening URLs, viewing statistics, and tracking clicks. Built as part of the Affordmed Campus Hiring Frontend assessment.

**Features:**
- Shorten up to **5 URLs at once**
- Optional **custom shortcodes** and **validity period**
- Displays **shortened URL**, **expiry**, and **click counts**
- Polished UI with **animations and Material UI**
- Client-side **data persistence** using `localStorage`
- Integrated **logging middleware** as per pre-test requirements

---

## Prerequisites
- Node.js (v16+ recommended)  
- npm (comes with Node.js)  
- Git (for version control)

---

## Installation
1. Clone the repository:

```bash
git clone https://github.com/PadmajeetDoddannavar/R22EQ020.git
cd url-shortener-frontend
Install dependencies:

bash
Copy code
npm install
Start the development server:

bash
Copy code
npm start
Open your browser at http://localhost:3000

Project Structure
bash
Copy code
/url-shortener-frontend
 ├─ /public
 ├─ /src
 │   ├─ /pages
 │   │   ├─ ShortenerPage.jsx
 │   │   ├─ StatisticsPage.jsx
 │   │   └─ RedirectPage.jsx
 │   ├─ App.js
 │   └─ index.js
 ├─ package.json
 └─ .gitignore
Usage
Enter one or more long URLs to shorten them.

Optionally specify:

Validity period (minutes)

Custom shortcode

Click the shortened URL to redirect to the original URL.

View statistics and click tracking on the Statistics page.

Expired URLs are automatically indicated.

Technologies Used
React – Frontend framework

Material UI – Styling components

Framer Motion – Animations and transitions

localStorage – Client-side data persistence

Deployment
Run npm run build for production build

Deploy using any static hosting service like Netlify or Vercel

Notes
The app runs exclusively on http://localhost:3000

All logging is done using the custom logging middleware

Client-side validation ensures URLs and shortcodes are unique and valid
