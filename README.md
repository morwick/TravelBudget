# TravelBudget SPA - Cloud Sync Edition

A Single Page Application (SPA) designed to help you manage your holiday expenses with ease. Now powered by **Supabase** for permanent storage and cross-device synchronization, and optimized for **Vercel** deployment.

## Features
- **Dashboard**: Track Total budget, expenses, and remaining funds with a dynamic progress bar.
- **Admin Mode**: Secure content management (CRUD) for categories and transactions.
- **Cloud Persistence**: Integrated with **Supabase (PostgreSQL)** to keep your data safe and synced across all devices.
- **Vercel Ready**: Pure client-side application that runs perfectly on serverless platforms.
- **Print Friendly**: Generate a clean report for your trip documentation.

## Tech Stack
- **HTML5 & Vanilla JS**: Core application structure and logic.
- **Tailwind CSS**: Modern styling via CDN.
- **Supabase**: Real-time database for data persistence.
- **Lucide Icons**: Premium iconography.

## Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/travel-budget-spa.git
   ```
2. Open `index.html` in a web browser (Note: Requires internet connection for Supabase).

## Deployment to Vercel
1. Push your code to GitHub.
2. Link your repository to a new project in [Vercel](https://vercel.com).
3. Vercel will deploy it as a static site. No backend configuration needed!

## Configuration
Before deploying, ensure you have set up your **Supabase** project:
1. Create a table named `travel_data` in Supabase.
2. Update the `SUPABASE_URL` and `SUPABASE_KEY` in `assets/js/script.js`.

---
*Created for Smart Travelers!*
