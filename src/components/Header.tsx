'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Bell, Lightbulb, LogIn, LogOut, Search, Settings, User, Wallet } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import type { NotificationItem } from '@/lib/wellness';
import { useSettings } from '@/components/SettingsProvider';

type HeaderProps = {
  notifications: NotificationItem[];
  onOpenAddAsset: () => void;
};

export default function Header({ notifications, onOpenAddAsset }: HeaderProps) {
  const { session, isLoading: isAuthLoading, signOut } = useAuth();
  const { defaultCurrency, setDefaultCurrency } = useSettings();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const settingsPanelRef = useRef<HTMLDivElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);

  const displayName = useMemo(() => {
    if (!session?.user) return 'Guest';
    return (
      session.user.user_metadata?.full_name ||
      session.user.user_metadata?.name ||
      session.user.email ||
      'Signed In'
    );
  }, [session]);

  const displaySubLabel = session ? 'Signed in' : 'Not signed in';

  const handleSignOut = async () => {
    await signOut();
  };

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setIsNotificationsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsNotificationsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isNotificationsOpen]);

  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (settingsPanelRef.current?.contains(target) || settingsButtonRef.current?.contains(target)) return;
      setIsSettingsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSettingsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSettingsOpen]);

  const notificationCount = notifications.length;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Wealth Wellness Hub
              </h1>
              <p className="text-xs text-gray-500">Your Financial Health Monitor</p>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <button
              type="button"
              onClick={onOpenAddAsset}
              aria-label="Add asset"
              className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl border-0 hover:bg-gray-200 transition-all text-sm text-gray-500"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Search assets</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setIsNotificationsOpen((open) => !open)}
                aria-haspopup="dialog"
                aria-expanded={isNotificationsOpen}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <div
                  ref={panelRef}
                  className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-xl p-4 z-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <span className="text-xs text-gray-400">
                      {notificationCount > 0 ? `${notificationCount} items` : 'All clear'}
                    </span>
                  </div>
                  {notificationCount === 0 ? (
                    <div className="text-sm text-gray-500">All wellness scores are healthy.</div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-auto pr-1">
                      {notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-xl border p-3 ${
                            item.severity === 'alert'
                              ? 'border-red-200 bg-red-50'
                              : 'border-amber-200 bg-amber-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 rounded-lg p-2 ${
                                item.severity === 'alert'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-amber-100 text-amber-600'
                              }`}
                            >
                              {item.severity === 'alert' ? (
                                <AlertTriangle className="w-4 h-4" />
                              ) : (
                                <Lightbulb className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-gray-900">{item.metric}</p>
                                <span
                                  className={`text-xs font-semibold ${
                                    item.severity === 'alert' ? 'text-red-600' : 'text-amber-600'
                                  }`}
                                >
                                  {item.score}/100
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                              {item.recommendation && (
                                <p className="text-xs text-gray-700 mt-2">{item.recommendation}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                ref={settingsButtonRef}
                onClick={() => setIsSettingsOpen((open) => !open)}
                aria-haspopup="dialog"
                aria-expanded={isSettingsOpen}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              {isSettingsOpen && (
                <div
                  ref={settingsPanelRef}
                  className="absolute right-0 mt-3 w-72 rounded-2xl border border-gray-200 bg-white shadow-xl p-4 z-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Settings</h3>
                    <span className="text-xs text-gray-400">Display</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500" htmlFor="default-currency">
                      Default currency
                    </label>
                    <select
                      id="default-currency"
                      value={defaultCurrency}
                      onChange={(event) => setDefaultCurrency(event.target.value)}
                      className="w-full appearance-none px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                    >
                      <option value="USD">🇺🇸 USD - US Dollar</option>
                      <option value="SGD">🇸🇬 SGD - Singapore Dollar</option>
                      <option value="EUR">🇪🇺 EUR - Euro</option>
                      <option value="GBP">🇬🇧 GBP - British Pound</option>
                      <option value="CAD">🇨🇦 CAD - Canadian Dollar</option>
                      <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                      <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                      <option value="INR">🇮🇳 INR - Indian Rupee</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Values are displayed in the selected currency.
                    </p>
                  </div>
                </div>
              )}
            </div>
            {session ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            ) : (
              <Link
                href="/auth"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors ${
                  isAuthLoading ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign in
              </Link>
            )}
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{displaySubLabel}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
