import { NextResponse } from 'next/server';

const CMC_QUOTE_ENDPOINT = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.trim();
  const apiKey = process.env.COINMARKETCAP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Missing CoinMarketCap API key.' },
      { status: 500 }
    );
  }

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: 'Missing crypto symbol.' },
      { status: 400 }
    );
  }

  const url = new URL(CMC_QUOTE_ENDPOINT);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('convert', 'USD');

  const response = await fetch(url.toString(), {
    headers: {
      'X-CMC_PRO_API_KEY': apiKey,
      Accept: 'application/json',
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch crypto quote (${response.status}). ${details}`,
      },
      { status: 502 }
    );
  }

  const payload = await response.json();
  const dataKey = Object.keys(payload?.data ?? {})[0];
  const quote = dataKey ? payload.data[dataKey]?.[0]?.quote?.USD : null;
  const price = typeof quote?.price === 'number' ? quote.price : 0;
  const percentChange =
    typeof quote?.percent_change_24h === 'number' ? quote.percent_change_24h : 0;

  return NextResponse.json({
    success: true,
    data: {
      symbol,
      price,
      percentChange,
    },
  });
}
