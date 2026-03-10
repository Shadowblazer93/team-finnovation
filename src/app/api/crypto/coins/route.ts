import { NextResponse } from 'next/server';

const CMC_LISTINGS_ENDPOINT = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
const CMC_INFO_ENDPOINT = 'https://pro-api.coinmarketcap.com/v2/cryptocurrency/info';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() ?? '';
  const apiKey = process.env.COINMARKETCAP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Missing CoinMarketCap API key.' },
      { status: 500 }
    );
  }

  const url = new URL(CMC_LISTINGS_ENDPOINT);
  url.searchParams.set('start', '1');
  url.searchParams.set('limit', '200');
  url.searchParams.set('convert', 'USD');

  const response = await fetch(url.toString(), {
    headers: {
      'X-CMC_PRO_API_KEY': apiKey,
      Accept: 'application/json',
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch cryptocurrencies (${response.status}). ${details}`,
      },
      { status: 502 }
    );
  }

  const result = await response.json();
  const data = Array.isArray(result.data) ? result.data : [];

  const ids = data.map((coin: { id: number }) => coin.id).slice(0, 200);
  const infoUrl = new URL(CMC_INFO_ENDPOINT);
  infoUrl.searchParams.set('id', ids.join(','));

  const infoResponse = await fetch(infoUrl.toString(), {
    headers: {
      'X-CMC_PRO_API_KEY': apiKey,
      Accept: 'application/json',
    },
    next: { revalidate: 300 },
  });

  const infoPayload = infoResponse.ok ? await infoResponse.json() : null;
  const infoData = infoPayload?.data ?? {};

  const filtered = data
    .filter((coin: { name?: string; symbol?: string }) => {
      if (!search) return true;
      const name = coin.name?.toLowerCase() ?? '';
      const symbol = coin.symbol?.toLowerCase() ?? '';
      return name.includes(search) || symbol.includes(search);
    })
    .slice(0, 50)
    .map((coin: {
      id: number;
      name: string;
      symbol: string;
      quote?: { USD?: { price?: number; percent_change_24h?: number } };
    }) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      logoUrl: infoData?.[coin.id]?.logo ?? null,
      priceUsd: coin.quote?.USD?.price ?? 0,
      percentChange24h: coin.quote?.USD?.percent_change_24h ?? 0,
    }));

  return NextResponse.json({ success: true, data: filtered });
}
