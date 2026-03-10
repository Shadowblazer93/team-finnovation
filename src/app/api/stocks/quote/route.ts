import { NextResponse } from 'next/server';

const FINNHUB_QUOTE_ENDPOINT = 'https://finnhub.io/api/v1/quote';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.trim();
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Missing Finnhub API key.' },
      { status: 500 }
    );
  }

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: 'Missing stock symbol.' },
      { status: 400 }
    );
  }

  const url = new URL(FINNHUB_QUOTE_ENDPOINT);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('token', apiKey);

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch quote (${response.status}). ${details}`,
      },
      { status: 502 }
    );
  }

  const payload = await response.json();
  const price = typeof payload?.c === 'number' ? payload.c : 0;
  const percentChange = typeof payload?.dp === 'number' ? payload.dp : 0;
  const change = typeof payload?.d === 'number' ? payload.d : 0;

  return NextResponse.json({
    success: true,
    data: {
      symbol,
      price,
      change,
      percentChange,
    },
  });
}
