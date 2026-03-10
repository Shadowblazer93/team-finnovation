'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Asset, AssetCategory } from '@/types';

const categories: AssetCategory[] = [
  'real_estate',
  'stocks',
  'bonds',
  'private_equity',
  'crypto',
  'cash',
  'commodities',
];

const categoryLabels: Record<AssetCategory, string> = {
  real_estate: 'Real Estate',
  stocks: 'Stocks',
  bonds: 'Bonds',
  private_equity: 'Private Equity',
  crypto: 'Crypto',
  cash: 'Cash',
  commodities: 'Commodities',
  alternatives: 'Alternatives',
};

type AssetFormState = {
  name: string;
  value: string;
  quantity: string;
  currency: string;
  platform: string;
  change24h: string;
  changePercent: string;
};

type CryptoCoin = {
  id: number;
  name: string;
  symbol: string;
  logoUrl: string | null;
  priceUsd: number;
  percentChange24h: number;
};

type StockOption = {
  symbol: string;
  name: string;
  priceUsd: number | null;
  percentChange: number | null;
};

type CommodityOption = {
  symbol: string;
  name: string;
  priceUsd: number | null;
  percentChange: number | null;
};

const commodityOptions: CommodityOption[] = [
  { symbol: 'XAU', name: 'Gold', priceUsd: null, percentChange: null },
  { symbol: 'XAG', name: 'Silver', priceUsd: null, percentChange: null },
  { symbol: 'XPT', name: 'Platinum', priceUsd: null, percentChange: null },
  { symbol: 'XPD', name: 'Palladium', priceUsd: null, percentChange: null },
];

type AddAssetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded: (asset: Asset) => void;
  userId?: string | null;
  initialCategory?: AssetCategory;
};

const defaultFormState: AssetFormState = {
  name: '',
  value: '',
  quantity: '',
  currency: 'USD',
  platform: '',
  change24h: '0',
  changePercent: '0',
};

export default function AddAssetModal({
  isOpen,
  onClose,
  onAssetAdded,
  userId,
  initialCategory = 'stocks',
}: AddAssetModalProps) {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>(initialCategory);
  const [forms, setForms] = useState<Record<AssetCategory, AssetFormState>>(() =>
    categories.reduce((acc, category) => {
      acc[category] = { ...defaultFormState };
      return acc;
    }, {} as Record<AssetCategory, AssetFormState>)
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cryptoSearch, setCryptoSearch] = useState('');
  const [cryptoCoins, setCryptoCoins] = useState<CryptoCoin[]>([]);
  const [isCryptoLoading, setIsCryptoLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCoin | null>(null);
  const [stockSearch, setStockSearch] = useState('');
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [isStockLoading, setIsStockLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null);
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityOption | null>(null);
  const [isCommodityLoading, setIsCommodityLoading] = useState(false);

  const formState = forms[activeCategory] ?? defaultFormState;

  const title = useMemo(() => categoryLabels[activeCategory], [activeCategory]);
  const isCrypto = activeCategory === 'crypto';
  const isStock = activeCategory === 'stocks';
  const isCommodity = activeCategory === 'commodities';

  useEffect(() => {
    setMessage(null);
  }, [activeCategory]);

  useEffect(() => {
    if (!isCrypto) {
      setSelectedCrypto(null);
      setCryptoSearch('');
    }
  }, [isCrypto]);

  useEffect(() => {
    if (!isStock) {
      setSelectedStock(null);
      setStockSearch('');
      setStockOptions([]);
    }
  }, [isStock]);

  useEffect(() => {
    if (!isCommodity) {
      setSelectedCommodity(null);
    }
  }, [isCommodity]);

  useEffect(() => {
    if (!isOpen || !isCrypto) return;

    const timeout = setTimeout(async () => {
      setIsCryptoLoading(true);
      const params = new URLSearchParams();
      if (cryptoSearch.trim()) params.set('search', cryptoSearch.trim());

      try {
        const response = await fetch(`/api/crypto/coins?${params.toString()}`);
        const result = await response.json();

        if (!response.ok || result.success === false) {
          setMessage(result.error ?? 'Unable to load cryptocurrencies.');
          setCryptoCoins([]);
          setIsCryptoLoading(false);
          return;
        }

        setCryptoCoins(result.data ?? []);
      } catch (error) {
        setMessage('Unable to load cryptocurrencies.');
        setCryptoCoins([]);
      } finally {
        setIsCryptoLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [cryptoSearch, isCrypto, isOpen]);

  useEffect(() => {
    if (!isOpen || !isStock) return;

    const timeout = setTimeout(async () => {
      const trimmed = stockSearch.trim();
      if (!trimmed) {
        setStockOptions([]);
        return;
      }

      setIsStockLoading(true);
      const params = new URLSearchParams();
      params.set('search', trimmed);

      try {
        const response = await fetch(`/api/stocks/search?${params.toString()}`);
        const result = await response.json();

        if (!response.ok || result.success === false) {
          setMessage(result.error ?? 'Unable to load stocks.');
          setStockOptions([]);
          setIsStockLoading(false);
          return;
        }

        setStockOptions(result.data ?? []);
      } catch (error) {
        setMessage('Unable to load stocks.');
        setStockOptions([]);
      } finally {
        setIsStockLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [stockSearch, isStock, isOpen]);

  if (!isOpen) return null;

  const updateForm = (field: keyof AssetFormState, value: string) => {
    setForms(prev => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!userId) {
      setMessage('Please sign in to add assets.');
      return;
    }

    const changePercent = Number(formState.changePercent) || 0;

    if (isCrypto) {
      if (!selectedCrypto) {
        setMessage('Please select a cryptocurrency.');
        return;
      }
      const quantity = Number(formState.quantity);
      if (Number.isNaN(quantity) || quantity <= 0) {
        setMessage('Please enter a valid quantity.');
        return;
      }
    } else if (isStock) {
      if (!selectedStock) {
        setMessage('Please select a stock.');
        return;
      }
      if (!selectedStock.priceUsd && selectedStock.priceUsd !== 0) {
        setMessage('Unable to load a stock price.');
        return;
      }
      const quantity = Number(formState.quantity);
      if (Number.isNaN(quantity) || quantity <= 0) {
        setMessage('Please enter a valid quantity.');
        return;
      }
    } else if (isCommodity) {
      if (!selectedCommodity) {
        setMessage('Please select a commodity.');
        return;
      }
      if (!selectedCommodity.priceUsd && selectedCommodity.priceUsd !== 0) {
        setMessage('Unable to load a commodity price.');
        return;
      }
      const quantity = Number(formState.quantity);
      if (Number.isNaN(quantity) || quantity <= 0) {
        setMessage('Please enter a valid quantity.');
        return;
      }
    } else {
      const value = Number(formState.value);
      if (!formState.name.trim() || Number.isNaN(value)) {
        setMessage('Please provide a valid name and value.');
        return;
      }
    }

    setIsSubmitting(true);

    const quantity = Number(formState.quantity) || null;
    const unitPrice = isCrypto
      ? selectedCrypto?.priceUsd ?? null
      : isStock
      ? selectedStock?.priceUsd ?? null
      : isCommodity
      ? selectedCommodity?.priceUsd ?? null
      : null;
    const value = unitPrice && quantity
      ? unitPrice * quantity
      : Number(formState.value);
    const computedChangePercent = isCrypto
      ? selectedCrypto?.percentChange24h ?? 0
      : isStock
      ? selectedStock?.percentChange ?? 0
      : isCommodity
      ? selectedCommodity?.percentChange ?? 0
      : changePercent;
    const computedChange24h = value
      ? (value * computedChangePercent) / 100
      : Number(formState.change24h) || 0;

    const { data, error } = await supabase
      .from('assets')
      .insert({
        user_id: userId,
        name: isCrypto
          ? selectedCrypto?.name
          : isStock
          ? selectedStock?.name
          : isCommodity
          ? selectedCommodity?.name
          : formState.name.trim(),
        category: activeCategory,
        value,
        currency: formState.currency.trim() || 'USD',
        platform: formState.platform.trim() || null,
        change_24h: computedChange24h,
        change_percent: computedChangePercent,
        quantity: isCrypto || isStock || isCommodity ? quantity : null,
        symbol: isCrypto
          ? selectedCrypto?.symbol
          : isStock
          ? selectedStock?.symbol
          : isCommodity
          ? selectedCommodity?.symbol
          : null,
        logo_url: isCrypto ? selectedCrypto?.logoUrl : null,
        unit_price: isCrypto || isStock || isCommodity ? unitPrice : null,
      })
      .select()
      .single();

    if (error || !data) {
      setMessage(error?.message ?? 'Unable to save asset.');
      setIsSubmitting(false);
      return;
    }

    const mappedAsset: Asset = {
      id: data.id,
      name: data.name,
      category: data.category,
      value: data.value,
      currency: data.currency ?? 'USD',
      change24h: data.change_24h ?? 0,
      changePercent: data.change_percent ?? 0,
      lastUpdated: new Date(data.updated_at ?? data.created_at ?? Date.now()),
      platform: data.platform ?? undefined,
      quantity: data.quantity ?? undefined,
      symbol: data.symbol ?? undefined,
      logoUrl: data.logo_url ?? undefined,
      unitPrice: data.unit_price ?? undefined,
    };

    onAssetAdded(mappedAsset);
    setForms(prev => ({
      ...prev,
      [activeCategory]: { ...defaultFormState },
    }));
    setSelectedCrypto(null);
    setSelectedStock(null);
    setSelectedCommodity(null);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add {title}</h2>
            <p className="text-sm text-gray-500">Track what you own by category.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {isCrypto ? (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Cryptocurrency</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={cryptoSearch}
                  onChange={event => setCryptoSearch(event.target.value)}
                  placeholder="Search by name or symbol"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mt-3 max-h-52 overflow-y-auto rounded-xl border border-gray-200">
                {isCryptoLoading ? (
                  <div className="p-4 text-sm text-gray-500">Loading coins...</div>
                ) : cryptoCoins.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No matches found.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {cryptoCoins.map(coin => (
                      <li key={coin.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCrypto(coin);
                            updateForm('name', coin.name);
                            updateForm('currency', 'USD');
                            updateForm('changePercent', coin.percentChange24h.toFixed(2));
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                            selectedCrypto?.id === coin.id ? 'bg-gray-50' : ''
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            {coin.logoUrl ? (
                              <img src={coin.logoUrl} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200" />
                            )}
                            <span className="text-gray-900 font-medium">{coin.name}</span>
                            <span className="text-xs text-gray-500 uppercase">{coin.symbol}</span>
                          </span>
                          <span className="text-gray-600">${coin.priceUsd.toFixed(2)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : isStock ? (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Stock</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={stockSearch}
                  onChange={event => setStockSearch(event.target.value)}
                  placeholder="Search by company or ticker"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mt-3 max-h-52 overflow-y-auto rounded-xl border border-gray-200">
                {isStockLoading ? (
                  <div className="p-4 text-sm text-gray-500">Loading stocks...</div>
                ) : stockOptions.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">No matches found.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {stockOptions.map(stock => (
                      <li key={stock.symbol}>
                        <button
                          type="button"
                          onClick={async () => {
                            setSelectedStock(stock);
                            updateForm('currency', 'USD');
                            try {
                              const quoteResponse = await fetch(
                                `/api/stocks/quote?symbol=${encodeURIComponent(stock.symbol)}`
                              );
                              const quoteResult = await quoteResponse.json();
                              if (quoteResponse.ok && quoteResult.success !== false) {
                                setSelectedStock(prev =>
                                  prev
                                    ? {
                                        ...prev,
                                        priceUsd: quoteResult.data?.price ?? null,
                                        percentChange: quoteResult.data?.percentChange ?? null,
                                      }
                                    : prev
                                );
                              } else {
                                setMessage(quoteResult.error ?? 'Unable to load stock price.');
                              }
                            } catch (error) {
                              setMessage('Unable to load stock price.');
                            }
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                            selectedStock?.symbol === stock.symbol ? 'bg-gray-50' : ''
                          }`}
                        >
                          <span className="flex flex-col">
                            <span className="text-gray-900 font-medium">{stock.name}</span>
                            <span className="text-xs text-gray-500 uppercase">{stock.symbol}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : isCommodity ? (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Commodity</label>
              <select
                value={selectedCommodity?.symbol ?? ''}
                onChange={async event => {
                  const symbol = event.target.value;
                  const commodity = commodityOptions.find(option => option.symbol === symbol) ?? null;
                  if (!commodity) return;

                  setIsCommodityLoading(true);
                  setSelectedCommodity(commodity);
                  updateForm('currency', 'USD');

                  try {
                    const response = await fetch(
                      `/api/commodities/quote?symbol=${encodeURIComponent(symbol)}`
                    );
                    const result = await response.json();

                    if (!response.ok || result.success === false) {
                      setMessage(result.error ?? 'Unable to load commodity price.');
                      setIsCommodityLoading(false);
                      return;
                    }

                    setSelectedCommodity({
                      ...commodity,
                      priceUsd: result.data?.price ?? null,
                      percentChange: result.data?.percentChange ?? null,
                    });
                  } catch (error) {
                    setMessage('Unable to load commodity price.');
                  } finally {
                    setIsCommodityLoading(false);
                  }
                }}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>
                  Select commodity
                </option>
                {commodityOptions.map(option => (
                  <option key={option.symbol} value={option.symbol}>
                    {option.name}
                  </option>
                ))}
              </select>
              {isCommodityLoading && (
                <p className="mt-2 text-xs text-gray-500">Loading price...</p>
              )}
            </div>
          ) : (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Asset name</label>
              <input
                type="text"
                value={formState.name}
                onChange={event => updateForm('name', event.target.value)}
                placeholder={`e.g. ${title} holding`}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {isCrypto ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={formState.quantity}
                  onChange={event => updateForm('quantity', event.target.value)}
                  placeholder="0.25"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Price (USD)</label>
                <input
                  type="text"
                  value={selectedCrypto ? `$${selectedCrypto.priceUsd.toFixed(2)}` : '—'}
                  readOnly
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Est. value</label>
                <input
                  type="text"
                  value={
                    selectedCrypto && formState.quantity
                      ? `$${(selectedCrypto.priceUsd * Number(formState.quantity)).toFixed(2)}`
                      : '—'
                  }
                  readOnly
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">24h change %</label>
                <input
                  type="text"
                  value={selectedCrypto ? `${selectedCrypto.percentChange24h.toFixed(2)}%` : '—'}
                  readOnly
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                />
              </div>
            </>
          ) : isStock ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formState.quantity}
                  onChange={event => updateForm('quantity', event.target.value)}
                  placeholder="10"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Price (USD)</label>
                <input
                  type="text"
                  value={selectedStock?.priceUsd != null ? `$${selectedStock.priceUsd.toFixed(2)}` : '—'}
                  readOnly
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Est. value</label>
                <input
                  type="text"
                  value={
                    selectedStock?.priceUsd != null && formState.quantity
                      ? `$${(selectedStock.priceUsd * Number(formState.quantity)).toFixed(2)}`
                      : '—'
                  }
                  readOnly
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">24h change %</label>
                <input
                  type="text"
                  value={
                    selectedStock?.percentChange != null
                      ? `${selectedStock.percentChange.toFixed(2)}%`
                      : '—'
                  }
                  readOnly
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                />
              </div>
            </>
          ) : isCommodity ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.quantity}
                  onChange={event => updateForm('quantity', event.target.value)}
                  placeholder="10"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Price (USD)</label>
                <input
                  type="text"
                  value={selectedCommodity?.priceUsd != null ? `$${selectedCommodity.priceUsd.toFixed(2)}` : '—'}
                  readOnly
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Est. value</label>
                <input
                  type="text"
                  value={
                    selectedCommodity?.priceUsd != null && formState.quantity
                      ? `$${(selectedCommodity.priceUsd * Number(formState.quantity)).toFixed(2)}`
                      : '—'
                  }
                  readOnly
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">24h change %</label>
                <input
                  type="text"
                  value={
                    selectedCommodity?.percentChange != null
                      ? `${selectedCommodity.percentChange.toFixed(2)}%`
                      : '—'
                  }
                  readOnly
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">Value</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.value}
                  onChange={event => updateForm('value', event.target.value)}
                  placeholder="100000"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Currency</label>
                <input
                  type="text"
                  value={formState.currency}
                  onChange={event => updateForm('currency', event.target.value.toUpperCase())}
                  placeholder="USD"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Platform</label>
            <input
              type="text"
              value={formState.platform}
              onChange={event => updateForm('platform', event.target.value)}
              placeholder="Broker or custodian"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {!isCrypto && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700">24h change</label>
                <input
                  type="number"
                  step="0.01"
                  value={formState.change24h}
                  onChange={event => updateForm('change24h', event.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">24h change %</label>
                <input
                  type="number"
                  step="0.01"
                  value={formState.changePercent}
                  onChange={event => updateForm('changePercent', event.target.value)}
                  placeholder="0"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {message && (
            <div className="md:col-span-2 rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2 text-sm text-indigo-700">
              {message}
            </div>
          )}

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : `Add ${title}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
