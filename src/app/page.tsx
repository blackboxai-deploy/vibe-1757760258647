"use client";

import { useState } from 'react';
import { LoginPage } from '@/components/LoginPage';
import { TradingDashboard } from '@/components/TradingDashboard';

interface LoginCredentials {
  username: string;
  password: string;
  server: string;
  brokerType: 'MT4' | 'MT5' | 'OANDA' | 'INTERACTIVE_BROKERS' | 'ALPACA' | 'BINANCE' | 'DEMO';
  accountType: 'DEMO' | 'LIVE';
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userCredentials, setUserCredentials] = useState<LoginCredentials | null>(null);

  const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate login process
      if (credentials.brokerType === 'DEMO') {
        // Demo mode - always succeed
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading
        setUserCredentials(credentials);
        setIsLoggedIn(true);
        return true;
      }
      
      // Real broker login
      const response = await fetch('/api/bot/configure-broker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `broker_${Date.now()}`,
          name: credentials.brokerType,
          type: credentials.brokerType,
          apiKey: credentials.password, // In real implementation, this would be API key
          serverUrl: credentials.server,
          accountId: credentials.username,
          testMode: credentials.accountType === 'DEMO',
          maxLeverage: 100,
          minOrderSize: 0.01,
          supportedSymbols: ['BTC/USD', 'EUR/USD', 'GBP/USD'],
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setUserCredentials(credentials);
        setIsLoggedIn(true);
        return true;
      } else {
        setError(result.message || 'Login failed');
        return false;
      }
    } catch (err) {
      setError('Connection error - please check your credentials and try again');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipToDemo = () => {
    const demoCredentials: LoginCredentials = {
      username: 'demo_user',
      password: 'demo_pass',
      server: 'demo-server.tradingbot.com',
      brokerType: 'DEMO',
      accountType: 'DEMO',
    };
    
    setUserCredentials(demoCredentials);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserCredentials(null);
    setError('');
  };

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSkipToDemo={handleSkipToDemo}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <div>
      {/* Header with logout */}
      <div className="bg-slate-900 border-b border-slate-700 px-6 py-3">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">Smart Trading Bot</h1>
            <div className="text-sm text-slate-400">
              Connected as: <span className="text-green-400">{userCredentials?.username}</span>
              {userCredentials?.accountType === 'DEMO' && 
                <span className="ml-2 px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded">DEMO</span>
              }
              {userCredentials?.accountType === 'LIVE' && 
                <span className="ml-2 px-2 py-1 bg-red-600 text-red-100 text-xs rounded">LIVE</span>
              }
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
      
      <TradingDashboard />
    </div>
  );
}