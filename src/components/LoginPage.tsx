"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface LoginCredentials {
  username: string;
  password: string;
  server: string;
  brokerType: 'MT4' | 'MT5' | 'OANDA' | 'INTERACTIVE_BROKERS' | 'ALPACA' | 'BINANCE' | 'DEMO';
  accountType: 'DEMO' | 'LIVE';
}

interface LoginPageProps {
  onLogin: (credentials: LoginCredentials) => Promise<boolean>;
  onSkipToDemo: () => void;
  isLoading: boolean;
  error?: string;
}

export function LoginPage({ onLogin, onSkipToDemo, isLoading, error }: LoginPageProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
    server: '',
    brokerType: 'DEMO',
    accountType: 'DEMO',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username && credentials.password && credentials.server) {
      await onLogin(credentials);
    }
  };

  const brokerPresets = {
    MT4: {
      name: 'MetaTrader 4',
      defaultServer: 'your-broker-mt4-server.com',
      description: 'Popular forex trading platform',
      ports: '443, 993',
    },
    MT5: {
      name: 'MetaTrader 5',
      defaultServer: 'your-broker-mt5-server.com',
      description: 'Advanced multi-asset platform',
      ports: '443, 993',
    },
    OANDA: {
      name: 'OANDA',
      defaultServer: 'api-fxtrade.oanda.com',
      description: 'Regulated forex & CFD broker',
      ports: '443',
    },
    INTERACTIVE_BROKERS: {
      name: 'Interactive Brokers',
      defaultServer: 'api.interactivebrokers.com',
      description: 'Professional trading platform',
      ports: '4001, 4002',
    },
    ALPACA: {
      name: 'Alpaca',
      defaultServer: 'paper-api.alpaca.markets',
      description: 'Commission-free stock trading',
      ports: '443',
    },
    BINANCE: {
      name: 'Binance',
      defaultServer: 'api.binance.com',
      description: 'Cryptocurrency exchange',
      ports: '443',
    },
    DEMO: {
      name: 'Demo Mode',
      defaultServer: 'demo-server.tradingbot.com',
      description: 'Safe simulation environment',
      ports: 'N/A',
    },
  };

  const currentBroker = brokerPresets[credentials.brokerType];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2">
            Smart Trading Bot
          </h1>
          <p className="text-slate-400">
            Connect to your broker to start AI-powered trading
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Broker Login</CardTitle>
            <p className="text-sm text-slate-400 text-center">
              Enter your broker credentials to enable live trading
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Display */}
              {error && (
                <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Broker Type Selection */}
              <div className="space-y-2">
                <Label className="text-slate-300">Broker Platform</Label>
                <Select 
                  value={credentials.brokerType} 
                  onValueChange={(value) => {
                    handleInputChange('brokerType', value);
                    handleInputChange('server', brokerPresets[value as keyof typeof brokerPresets].defaultServer);
                  }}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {Object.entries(brokerPresets).map(([key, broker]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <span>{broker.name}</span>
                          {key === 'DEMO' && <Badge variant="outline" className="text-xs">Safe</Badge>}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">{currentBroker.description}</p>
              </div>

              {/* Account Type */}
              <div className="space-y-2">
                <Label className="text-slate-300">Account Type</Label>
                <Select value={credentials.accountType} onValueChange={(value) => handleInputChange('accountType', value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="DEMO">
                      <div className="flex items-center gap-2">
                        <span>Demo Account</span>
                        <Badge variant="outline" className="text-xs text-green-400 border-green-400">Recommended</Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="LIVE">
                      <div className="flex items-center gap-2">
                        <span>Live Account</span>
                        <Badge variant="outline" className="text-xs text-red-400 border-red-400">Real Money</Badge>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Username / Account Number
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Enter your trading account username"
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your account password"
                    className="bg-slate-700 border-slate-600 text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Server */}
              <div className="space-y-2">
                <Label htmlFor="server" className="text-slate-300">
                  Server Address
                </Label>
                <Input
                  id="server"
                  type="text"
                  value={credentials.server}
                  onChange={(e) => handleInputChange('server', e.target.value)}
                  placeholder={currentBroker.defaultServer}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
                <p className="text-xs text-slate-400">
                  Ports: {currentBroker.ports}
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !credentials.username || !credentials.password || !credentials.server}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting to {currentBroker.name}...
                  </div>
                ) : (
                  <>
                    🔗 Connect to {currentBroker.name}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Mode Option */}
        <Card className="bg-green-900/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <h3 className="text-green-400 font-medium">Try Demo Mode First</h3>
              <p className="text-sm text-green-200">
                Test the AI trading bot with virtual funds before risking real money. 
                Perfect for learning and strategy validation.
              </p>
              <Button
                onClick={onSkipToDemo}
                variant="outline"
                className="w-full border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
              >
                🎮 Start Demo Trading (No Risk)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-500">
            🔒 Your credentials are encrypted and never stored on our servers
          </p>
          <p className="text-xs text-slate-500">
            💡 Always start with demo accounts to test the bot safely
          </p>
        </div>

        {/* Quick Start Examples */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Quick Start Examples</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">MT4 Demo:</span>
                <span className="text-slate-300">Usually demo-server.yourbroker.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">OANDA Demo:</span>
                <span className="text-slate-300">api-fxpractice.oanda.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account:</span>
                <span className="text-slate-300">Your login ID or account number</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}