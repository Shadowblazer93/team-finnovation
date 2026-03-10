# Wealth Wellness Hub

Video Pitch : https://youtu.be/VKDw6-p5UPg

## Project Description
Wealth Wellness Hub is a secure, integrated wealth wallet that unifies fragmented financial data into a real-time financial health view. Investors often manage assets across bank deposits, portfolios, private holdings, and digital wallets, which obscures their true financial picture and limits holistic decision-making. Our solution aggregates those sources, normalizes the data, and surfaces actionable insights using analytics and behavioral finance signals. The app presents a consolidated net worth and asset allocation view, highlights diversification gaps, and models scenario outcomes to help users understand resilience and risk. It also delivers tailored recommendations based on portfolio composition and behavioral tendencies, enabling smarter, long-term decisions. By bringing scattered assets into a single, intuitive hub, Wealth Wellness Hub turns fragmented data into financial intelligence for both clients and advisors.

## Key Features
- Unified wealth dashboard with allocation and trend insights
- Scenario analysis and resilience indicators
- Recommendations based on portfolio and behavior
- Secure data aggregation and API-driven updates

## Tech Stack
- Next.js (App Router), TypeScript, Tailwind CSS
- Supabase for data storage and API integration

## Getting Started
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

Build with public Next.js env vars (inlined at build time):
```bash
docker build \
	--build-arg NEXT_PUBLIC_SUPABASE_URL=YOUR_URL \
	--build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY \
	-t wealth-wellness-hub .
```

Run with runtime secrets and API keys:
```bash
docker run --rm -p 3000:3000 \
	-e NEXT_PUBLIC_SUPABASE_URL=YOUR_URL \
	-e NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY \
	-e SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY \
	-e COINMARKETCAP_API_KEY=YOUR_CMC_KEY \
	-e FINNHUB_API_KEY=YOUR_FINNHUB_KEY \
	-e GOLDAPI_KEY=YOUR_GOLDAPI_KEY \
	wealth-wellness-hub
```

Alternatively, put them in a local env file and use:
```bash
docker run --rm -p 3000:3000 --env-file .env.production wealth-wellness-hub
```