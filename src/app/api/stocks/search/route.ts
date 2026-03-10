import { NextResponse } from 'next/server';

const FINNHUB_SEARCH_ENDPOINT = 'https://finnhub.io/api/v1/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() ?? '';
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Missing Finnhub API key.' },
      { status: 500 }
    );
  }

  if (!search) {
    return NextResponse.json({ success: true, data: [] });
  }

  const url = new URL(FINNHUB_SEARCH_ENDPOINT);
  url.searchParams.set('q', search);
  url.searchParams.set('token', apiKey);

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      {
        success: false,
        error: `Failed to search stocks (${response.status}). ${details}`,
      },
      { status: 502 }
    );
  }

  const payload = await response.json();
  const results = Array.isArray(payload?.result) ? payload.result : [];

  const data = results
    .filter((item: { symbol?: string; description?: string }) => item?.symbol)
    .slice(0, 50)
    .map((item: { symbol: string; description?: string }) => ({
      symbol: item.symbol,
      name: item.description ?? item.symbol,
      priceUsd: null,
      percentChange: null,
    }));

  return NextResponse.json({ success: true, data });
}
