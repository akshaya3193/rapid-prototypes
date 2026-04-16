# BSE Corporate Announcements Scraper

A full-stack web application built to search, view, and bulk-download corporate announcements and their associated PDF attachments from the Bombay Stock Exchange (BSE) India.

## Features

* **Search by Scrip Code & Date:** Easily fetch corporate announcements for any specific company using its BSE Scrip Code and a custom date range.
* **View Details:** See the date, category, headline, and sub-headline of each announcement in a clean, tabular format.
* **Individual PDF Downloads:** Download the PDF attachment for any specific announcement directly.
* **Bulk ZIP Download:** Download all PDF attachments from your search results in a single, compressed ZIP file. The zipping process is handled entirely in the browser to ensure reliability and prevent server timeouts, complete with a live progress indicator.
* **Smart Proxying:** BSE India employs strict CORS policies and Web Application Firewalls (WAF) that block standard programmatic requests. This application includes a custom Node.js backend proxy that handles the necessary headers, User-Agents, and fallback logic (checking both `AttachLive` and `AttachHis` directories) to reliably fetch the data and PDFs.

## Tech Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, JSZip (for client-side zipping), Lucide React (icons).
* **Backend:** Node.js, Express, Axios (for proxying requests to BSE).
* **Build Tool:** Vite (configured with Express middleware for local development and static serving for production).

## Prerequisites

To run this application locally, you will need:
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* npm (comes with Node.js)

## Getting Started

1. **Extract the project** (if downloaded as a ZIP) and open your terminal in the project directory.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Open the app:**
   Open your web browser and navigate to `http://localhost:3000`.

## How it Works

1. **Frontend Request:** The React frontend sends a request to the local Express backend (`/api/announcements` or `/api/pdf/:filename`).
2. **Backend Proxy:** The Express backend uses `axios` to forward the request to the official BSE India APIs and servers. It injects specific `User-Agent` and `Referer` headers to bypass BSE's firewall restrictions.
3. **PDF Fallback Logic:** When fetching PDFs, the backend first tries the `AttachLive` directory. If BSE returns a 404 (Not Found) or 403 (Forbidden), it automatically falls back to the `AttachHis` (historical) directory.
4. **Client-Side Zipping:** When "Download All PDFs" is clicked, the frontend fetches the PDFs in small chunks via the backend proxy and uses `jszip` to compress them directly in the browser, providing real-time progress updates to the user.

## Scripts

* `npm run dev`: Starts the full-stack development server using `tsx`.
* `npm run build`: Builds the React frontend for production.
* `npm run start`: Runs the compiled production server.


## AI Assistance
This project was scaffolded using Google Gemini AI Studio to generate the boilerplate for Express proxy and react table structures.
I reviewed, modified, manually audited and structured the generated code, with iterative prompting implemented historical directory fallback logic, improved:
- readability
- modularity
- error handling for network timeouts