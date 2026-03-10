'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import WealthOverview from '@/components/WealthOverview';
import AssetAllocation from '@/components/charts/AssetAllocation';
import WealthTrend from '@/components/charts/WealthTrend';
import WellnessMetrics from '@/components/WellnessMetrics';
import AssetsCategoryTabs from '@/components/AssetsCategoryTabs';
import Recommendations from '@/components/Recommendations';
import ScenarioAnalysis from '@/components/ScenarioAnalysis';
import LiquidityPanel from '@/components/LiquidityPanel';
import BehavioralResilience from '@/components/BehavioralResilienceEnhanced';
import AddAssetModal from '@/components/AddAssetModal';
import EditAssetModal from '@/components/EditAssetModal';
import AssetBrowser from '@/components/AssetBrowser';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { buildHealthIndicators, buildNotificationsFromIndicators } from '@/lib/wellness';
import { Asset, AssetCategory } from '@/types';
import { useAuth } from '@/components/AuthProvider';

export default function Dashboard() {
  const { session, isLoading: authLoading } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const lastUpdated = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const refreshAssetPrices = async (currentAssets: Asset[], userId: string) => {
    const assetsToUpdate = currentAssets.filter(asset =>
      (asset.category === 'stocks' || asset.category === 'crypto' || asset.category === 'commodities') &&
        asset.symbol
    );

    if (assetsToUpdate.length === 0) return;

    setIsSyncing(true);

    const updates = await Promise.all(
      assetsToUpdate.map(async asset => {
        const symbol = asset.symbol ?? '';
        const endpoint =
          asset.category === 'stocks'
            ? `/api/stocks/quote?symbol=${encodeURIComponent(symbol)}`
            : asset.category === 'commodities'
            ? `/api/commodities/quote?symbol=${encodeURIComponent(symbol)}`
            : `/api/crypto/quote?symbol=${encodeURIComponent(symbol)}`;

        try {
          const response = await fetch(endpoint);
          const result = await response.json();
          if (!response.ok || result.success === false) return null;

          const price = typeof result.data?.price === 'number' ? result.data.price : null;
          const percentChange =
            typeof result.data?.percentChange === 'number' ? result.data.percentChange : null;

          if (price === null) return null;

          const quantity = asset.quantity ?? 0;
          const value = quantity > 0 ? price * quantity : asset.value;
          const changePercent = percentChange ?? asset.changePercent;
          const change24h = value * (changePercent / 100);

          return {
            id: asset.id,
            unitPrice: price,
            value,
            changePercent,
            change24h,
          };
        } catch (error) {
          return null;
        }
      })
    );

    const filteredUpdates = updates.filter(Boolean) as Array<{
      id: string;
      unitPrice: number;
      value: number;
      changePercent: number;
      change24h: number;
    }>;

    if (filteredUpdates.length === 0) {
      setIsSyncing(false);
      return;
    }

    await Promise.all(
      filteredUpdates.map(update =>
        supabase
          .from('assets')
          .update({
            unit_price: update.unitPrice,
            value: update.value,
            change_percent: update.changePercent,
            change_24h: update.change24h,
          })
          .eq('id', update.id)
          .eq('user_id', userId)
      )
    );

    setAssets(prev =>
      prev.map(asset => {
        const update = filteredUpdates.find(item => item.id === asset.id);
        if (!update) return asset;
        return {
          ...asset,
          unitPrice: update.unitPrice,
          value: update.value,
          changePercent: update.changePercent,
          change24h: update.change24h,
          lastUpdated: new Date(),
        };
      })
    );

    setIsSyncing(false);
  };

  useEffect(() => {
    const fetchAssets = async (userId: string) => {
      setAssetsLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        setAssets([]);
        setAssetsLoading(false);
        return;
      }

      const mappedAssets: Asset[] = data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category as AssetCategory,
        value: item.value,
        currency: item.currency ?? 'USD',
        change24h: item.change_24h ?? 0,
        changePercent: item.change_percent ?? 0,
        lastUpdated: new Date(item.updated_at ?? item.created_at ?? Date.now()),
        platform: item.platform ?? undefined,
        quantity: item.quantity ?? undefined,
        symbol: item.symbol ?? undefined,
        logoUrl: item.logo_url ?? undefined,
        unitPrice: item.unit_price ?? undefined,
      }));

      setAssets(mappedAssets);
      setAssetsLoading(false);
      void refreshAssetPrices(mappedAssets, userId);
    };

    if (session?.user?.id) {
      fetchAssets(session.user.id);
    } else {
      setAssets([]);
      setAssetsLoading(false);
    }
  }, [session]);

  const handleAssetAdded = (asset: Asset) => {
    setAssets(prev => [asset, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!session?.user?.id) return false;

    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', session.user.id);

    if (error) return false;

    setAssets(prev => prev.filter(asset => asset.id !== assetId));
    return true;
  };

  const handleAssetUpdated = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(asset => (asset.id === updatedAsset.id ? updatedAsset : asset)));
    setIsEditModalOpen(false);
    setSelectedAsset(null);
  };

  const { healthIndicators } = buildHealthIndicators(assets);
  const notifications = buildNotificationsFromIndicators(healthIndicators);

  if (!session && !authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          notifications={notifications}
          onOpenAddAsset={() => setIsAddModalOpen(true)}
        />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">Sign in to view your dashboard</h2>
            <p className="text-sm text-gray-500 mt-2">
              Access your wealth overview, analytics, and recommendations.
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        notifications={notifications}
        onOpenAddAsset={() => setIsAddModalOpen(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here&apos;s your complete wealth overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-60"
              onClick={() => {
                if (!session?.user?.id) return;
                void refreshAssetPrices(assets, session.user.id);
              }}
              disabled={isSyncing || !session?.user?.id}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync All'}
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <section className="mb-4">
          <WealthOverview assets={assets} />
        </section>

        <div className="flex items-center justify-end mb-8">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-base font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Asset
          </button>
        </div>

        <section className="mb-8">
          <AssetsCategoryTabs
            assets={assets}
            isLoading={assetsLoading}
            onOpenAssetMenu={(asset) => {
              setSelectedAsset(asset);
              setIsEditModalOpen(true);
            }}
          />
        </section>

        {/* Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AssetAllocation assets={assets} />
          <WealthTrend />
        </section>

        {/* Wellness Metrics */}
        <section className="mb-8">
          <WellnessMetrics assets={assets} />
        </section>

        {/* Liquidity and Behavioral Resilience */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LiquidityPanel assets={assets} />
          <BehavioralResilience userId={session?.user?.id} />
        </section>

        {/* Asset Browser - Portfolio-Based Recommendations */}
        <section className="mb-8">
          <AssetBrowser 
            assets={assets} 
            onAddAsset={() => setIsAddModalOpen(true)} 
          />
        </section>

        {/* Recommendations and Scenarios */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Recommendations assets={assets} />
          <ScenarioAnalysis />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-gray-400">
          <p>Wealth Wellness Hub © 2026 | Your Financial Health Monitor</p>
          <p className="mt-1">Data refreshed every 15 minutes • Powered by AI-driven insights</p>
        </footer>
      </main>
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
        }}
        onAssetAdded={handleAssetAdded}
        userId={session?.user?.id}
      />
      <EditAssetModal
        asset={selectedAsset}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAsset(null);
        }}
        onAssetUpdated={handleAssetUpdated}
        onDeleteAsset={handleDeleteAsset}
        userId={session?.user?.id}
      />
    </div>
  );
}
