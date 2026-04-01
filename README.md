# Global Currency "Jetsetter"

A travel-focused currency converter web app that helps users see how their money stretches across multiple countries at the same time.

## Project Overview

Global Currency "Jetsetter" is a responsive web application built using JavaScript, HTML, and CSS.  
It allows users to enter an amount, choose a base currency, and select multiple target currencies to compare exchange values together in one view.

This project is designed to make currency conversion more useful for travelers by showing side-by-side comparisons instead of only one-to-one conversion.

## Purpose

The main purpose of this project is to create a practical travel utility that demonstrates:

- Public API integration using `fetch()`
- Dynamic UI rendering with JavaScript
- Responsive interface design
- Use of array higher-order functions for filtering, searching, and sorting
- Clean and user-friendly frontend development

## Public API Used

This project uses the **Frankfurter Exchange Rates API**:

- Website: https://frankfurter.dev/
- API Base URL: `https://api.frankfurter.dev/v1/`

The API provides:

- Latest exchange rates
- Historical exchange rates
- Time-series exchange rate data
- Currency list data

Frankfurter supports latest rates, base-currency changes, symbols filtering, time-series data, and a currencies endpoint, which matches this project well. :contentReference[oaicite:2]{index=2}

## Core Features

### Main Features
- Convert from one base currency to multiple target currencies at once
- Multi-select target currency option
- Base currency toggle
- “Last Updated” exchange rate timestamp
- Clean financial-style user interface
- Flag icons for currencies
- Responsive design for mobile, tablet, and desktop

### Planned Interactive Features
These features are included to align with future milestones:

- **Searching**  
  Search currencies by code or country/currency name

- **Filtering**  
  Filter selected currencies or displayed results

- **Sorting**  
  Sort results by:
  - currency code
  - converted value
  - alphabetical order

These operations will be implemented using **array higher-order functions** such as:
- `map()`
- `filter()`
- `sort()`
- `find()`

## Bonus / Advanced Feature

### 7-Day Historical Sparkline
A simple mini chart will be shown for each selected target currency to display how the exchange rate changed over the last 7 days.

This will be built using:
- Frankfurter time-series endpoint
- CSS-based mini bar chart / sparkline
- Dynamic rendering from fetched historical data

Frankfurter’s time-series endpoint supports fetching rates across a date range, which makes the 7-day sparkline feasible. :contentReference[oaicite:3]{index=3}

## Tech Stack

- **HTML5** – structure
- **CSS3** – styling and responsive layout
- **JavaScript (Vanilla JS)** – logic, API integration, DOM manipulation
- **Fetch API** – to request exchange rate data
- **Optional:** Tailwind CSS or Bootstrap for styling improvements

## How the App Will Work

1. User enters an amount
2. User selects a base currency
3. User selects multiple target currencies
4. App fetches the latest exchange rates from the API
5. Converted values are displayed in separate result cards
6. Each card also shows:
   - target currency name
   - flag/icon
   - converted amount
   - last updated date
   - 7-day sparkline

## API Endpoints Planned

### Get all currencies
`GET https://api.frankfurter.dev/v1/currencies`

Used to populate:
- base currency dropdown
- target currency multi-select

### Get latest exchange rates
`GET https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR,EUR,JPY`

Used for:
- live conversion
- last updated date

### Get historical time-series data
`GET https://api.frankfurter.dev/v1/2026-03-16..2026-03-23?base=USD&symbols=EUR`

Used for:
- 7-day sparkline charts

Frankfurter documents all three patterns: currencies list, latest rates with `base` and `symbols`, and date-range time-series. :contentReference[oaicite:4]{index=4}

## Folder Structure

```bash
jetsetter/
│── index.html
│── style.css
│── script.js
│── README.md
