# Griswold Wedding Finance Tracker

A local-first budgeting dashboard that helps a couple preparing for a May 2026 wedding keep track of income, everyday spending, one-off house renovation costs, and progress towards their wedding savings target.

## Features

- **Wedding roadmap** – set a target budget and date, record current savings, and log top-up contributions such as bonuses or pay rises.
- **Income planner** – capture recurring salaries and one-off bonuses month-by-month.
- **Expense tracking** – monitor recurring household costs and one-off renovation spending inside the same view.
- **Monthly outlook** – review income vs. expenses per month and compare the typical surplus to the savings required to stay on track for the wedding.
- **Local storage** – all data is saved in your browser so you can use the tool offline without creating an account.

## Getting started

```bash
npm install
npm run dev
```

Visit the printed URL in your browser to use the planner. Changes to the interface or your data are reflected instantly.

### Available scripts

- `npm run dev` – start the development server.
- `npm run build` – type-check and create an optimised production build in `dist/`.
- `npm run preview` – preview the built app locally.
- `npm run lint` – run ESLint against the TypeScript/React source.
- `npm run test` – run Vitest in the configured JSDOM environment.

## Deployment

The project builds to static assets, making it easy to host on GitHub Pages. Configure your repository to serve the `dist/` directory after running `npm run build`.

## Data storage

All data (income records, expenses, and wedding savings details) is persisted in the browser via `localStorage`. Clearing site data or switching devices will reset the planner, so consider exporting your data manually for safekeeping if required.
