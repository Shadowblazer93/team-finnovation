import { NextResponse } from 'next/server';

const GOLDAPI_ENDPOINT = 'https://www.goldapi.io/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.trim();
  const apiKey = process.env.GOLDAPI_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Missing GoldAPI key.' },
      { status: 500 }
    );
  }

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: 'Missing commodity symbol.' },
      { status: 400 }
    );
  }

  const response = await fetch(`${GOLDAPI_ENDPOINT}/${symbol}/USD`, {
    headers: {
      'x-access-token': apiKey,
      Accept: 'application/json',
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch commodity price (${response.status}). ${details}`,
      },
      { status: 502 }
    );
  }

  const payload = await response.json();
  const price = typeof payload?.price === 'number' ? payload.price : 0;
  const percentChange = typeof payload?.chp === 'number' ? payload.chp : 0;

  return NextResponse.json({
    success: true,
    data: {
      symbol,
      price,
      percentChange,
    },
  });
}
