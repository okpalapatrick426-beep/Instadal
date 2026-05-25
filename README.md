# Instadal 🛺

> Instant Delivery Always — food, groceries, ice cream & pharmacy delivered across Awka.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Supabase (auth, database, realtime)
- **Hosting**: Vercel

## Local Development

```bash
npm install
npm run dev
```

Create a `.env` file in the root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

No `vercel.json` needed — HashRouter handles client-side routing without SPA rewrite rules.

## Supabase Setup

Run `instadal_schema.sql` in the Supabase SQL editor to create all tables and RLS policies.

Enable **Phone (OTP)** auth under Authentication → Providers. Configure a Twilio or Africa's Talking account for Nigerian SMS delivery.

## Roles

| Role | Access |
|------|--------|
| Customer | Browse, order, track |
| Partner | Manage shop, receive orders, manage staff |
| Rider | Accept deliveries, update location, view earnings |
| Admin | Full platform control, approve shops, trigger payouts |
