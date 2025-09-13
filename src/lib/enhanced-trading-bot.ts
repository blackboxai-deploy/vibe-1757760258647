// Enhanced AI Trading Bot with Broker Integration

import { BotState, BotConfig, BotStatus, Position, Trade, BotAction } from '@/types/trading';
import { BrokerConfig, OrderRequest } from '@/types/broker';
import { AdvancedAIAnalyzer, AIAnalysisResult } from './advanced-ai-analysis';
import { SmartTradingEngine, SmartAnalysisResult } from './smart-trading-engine';
import { brokerManager, marketDataProvider } from './broker-integration';
import { MarketAnalyzer } from './market-analysis';
import { RiskManager } from './risk-management';

export class EnhancedTradingBot {
  private state: BotState;
  private aiAnalyzer: AdvancedAIAnalyzer;
  private marketAnalyzer: MarketAnalyzer;
  private riskManager: RiskManager;
  private smartEngine: SmartTradingEngine;
  private intervalId?: ReturnType<typeof setInterval>;
  private brokerConfig?: BrokerConfig;
  private isConnectedToBroker: boolean = false;

  constructor() {
    this.state = this.initializeState();
    this.aiAnalyzer = new AdvancedAIAnalyzer();
    this.marketAnalyzer = new MarketAnalyzer();
    this.riskManager = new RiskManager();
    this.smartEngine = new SmartTradingEngine();
  }

  private initializeState(): BotState {
    const config: BotConfig = {
      initialCapital: 50,
      targetProfit: 100,
      maxRiskPerTrade: 0.01, // Ultra-conservative 1% risk per trade
      maxDailyLoss: 0.05, // Ultra-safe 5% max daily loss
      riskRewardRatio: 3.0, // Enhanced 3:1 risk-reward ratio
    };

    const status: BotStatus = {
      isRunning: false,
      currentBalance: config.initialCapital,
      totalProfit: 0,
      targetReached: false,
      tradesCount: 0,
      winRate: 0,
      maxDrawdown: 0,
      lastAction: 'Ultra-smart AI bot initialized with advanced algorithms',
    };

    return {
      config,
      status,
      positions: [],
      trades: [],
      marketData: {
        symbol: 'BTC/USD',
        price: 0,
        volume: 0,
        timestamp: new Date(),
        high24h: 0,
        low24h: 0,
        change24h: 0,
      },
      analysis: {
        trend: 'NEUTRAL',
        strength: 50,
        signals: {
          rsi: 'NEUTRAL',
          macd: 'NEUTRAL',
          bollinger: 'NEUTRAL',
          trend: 'NEUTRAL',
        },
        confidence: 0,
        recommendation: 'HOLD',
      },
      indicators: {
        rsi: 50,
        macd: { macd: 0, signal: 0, histogram: 0 },
        bollingerBands: { upper: 0, middle: 0, lower: 0 },
        sma20: 0,
        ema20: 0,
        atr: 0,
        volume: 0,
      },
      riskMetrics: {
        currentRisk: 0,
        maxRisk: config.maxRiskPerTrade,
        positionSize: 0,
        stopLossDistance: 0,
        takeProfitDistance: 0,
        riskRewardRatio: config.riskRewardRatio,
        volatility: 0,
      },
      actions: [],
    };
  }

  async configureBroker(config: BrokerConfig): Promise<boolean> {
    try {
      this.brokerConfig = config;
      brokerManager.addBroker('main', config);
      
      const connected = await brokerManager.connectToBroker('main');
      this.isConnectedToBroker = connected;
      
      if (connected) {
        const accountInfo = await brokerManager.getAccountInfo();
        if (accountInfo) {
          this.state.status.currentBalance = accountInfo.balance;
          this.state.config.initialCapital = accountInfo.balance;
          this.addAction('BROKER_CONNECTED', `Connected to ${config.name} - Balance: $${accountInfo.balance}`, true);
        }
      } else {
        this.addAction('BROKER_ERROR', `Failed to connect to ${config.name}`, false);
      }
      
      return connected;
    } catch (error) {
      this.addAction('BROKER_ERROR', `Broker configuration failed: ${error}`, false);
      return false;
    }
  }

  async start(): Promise<boolean> {
    try {
      if (this.state.status.targetReached) {
        this.addAction('START', 'Cannot start: Target already reached. Reset required.', false);
        return false;
      }

      if (this.brokerConfig && !this.isConnectedToBroker) {
        const connected = await this.configureBroker(this.brokerConfig);
        if (!connected) {
          this.addAction('START', 'Cannot start: Broker connection required', false);
          return false;
        }
      }

      this.state.status.isRunning = true;
      this.state.status.startTime = new Date();
      this.addAction('START', 'Enhanced AI trading bot started successfully', true);

      // Start the ultra-smart trading loop with optimal cycles
      this.intervalId = setInterval(() => {
        this.runSmartTradingCycle();
      }, 1500); // Run every 1.5 seconds for maximum responsiveness

      return true;
    } catch (error) {
      this.addAction('START', `Failed to start bot: ${error}`, false);
      return false;
    }
  }

  async stop(): Promise<boolean> {
    try {
      this.state.status.isRunning = false;
      
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = undefined;
      }

      // Close all open positions
      await this.closeAllPositions('Manual stop');
      
      this.addAction('STOP', 'Enhanced trading bot stopped successfully', true);
      return true;
    } catch (error) {
      this.addAction('STOP', `Failed to stop bot: ${error}`, false);
      return false;
    }
  }

  private async runSmartTradingCycle(): Promise<void> {
    try {
      // Check if target is reached
      if (this.state.status.totalProfit >= this.state.config.targetProfit) {
        this.state.status.targetReached = true;
        await this.stop();
        this.addAction('TARGET_REACHED', `Target profit of ${this.state.config.targetProfit} reached!`, true);
        return;
      }

      // Update market data from broker or enhanced simulation
      await this.updateSmartMarketData();
      
      // Update smart trading engine with latest data
      this.smartEngine.updateMarketData(this.state.marketData);
      
      // Perform ultra-smart analysis
      const smartAnalysis = await this.smartEngine.analyzeMarket(this.state.marketData);
      
      // Update state with smart analysis results
      this.updateStateWithSmartAnalysis(smartAnalysis);

      // Manage existing positions with smart insights
      await this.manageSmartPositions(smartAnalysis);

      // Check for new trading opportunities with smart engine
      if (await this.shouldOpenSmartPosition(smartAnalysis)) {
        await this.openSmartPosition(smartAnalysis);
      }

      this.updateSmartBotMetrics();
      
    } catch (error) {
      console.error('Smart trading cycle error:', error);
      this.addAction('UPDATE', `Smart trading cycle error: ${error}`, false);
    }
  }

  private async updateEnhancedMarketData(): Promise<void> {
    try {
      if (this.isConnectedToBroker) {
        // Get real market data from broker
        const broker = brokerManager.getActiveBroker();
        if (broker) {
          const realData = await broker.getMarketData(this.state.marketData.symbol);
          this.state.marketData = {
            symbol: realData.symbol,
            price: realData.close,
            volume: realData.volume,
            timestamp: realData.timestamp,
            high24h: realData.high,
            low24h: realData.low,
            change24h: ((realData.close - realData.open) / realData.open) * 100,
          };
          return;
        }
      }
      
      // Fallback to enhanced simulation with more realistic price movement
      this.generateEnhancedSimulatedData();
    } catch (error) {
      console.error('Market data update error:', error);
      this.generateEnhancedSimulatedData();
    }
  }

  private generateEnhancedSimulatedData(): void {
    const basePrice = 45000; // Base BTC price
    const timeOfDay = new Date().getHours();
    
    // Adjust volatility based on time of day (higher during trading hours)
    let volatilityMultiplier = 1.0;
    if (timeOfDay >= 8 && timeOfDay <= 16) { // Trading hours
      volatilityMultiplier = 1.5;
    } else if (timeOfDay >= 20 || timeOfDay <= 6) { // Asian session
      volatilityMultiplier = 1.2;
    }
    
    const volatility = 0.015 * volatilityMultiplier; // Enhanced volatility
    const randomWalk = (Math.random() - 0.5) * 2 * volatility;
    
    // Add some trend persistence
    const previousChange = this.state.marketData.change24h || 0;
    const trendPersistence = previousChange * 0.1; // 10% trend continuation
    
    const totalChange = randomWalk + trendPersistence;
    const currentPrice = this.state.marketData.price || basePrice;
    const newPrice = currentPrice * (1 + totalChange);

    this.state.marketData = {
      ...this.state.marketData,
      price: newPrice,
      volume: Math.floor(Math.random() * 2000000) + 500000, // 500K - 2.5M volume
      timestamp: new Date(),
      change24h: totalChange * 100,
    };

    // Update high/low
    if (newPrice > this.state.marketData.high24h || this.state.marketData.high24h === 0) {
      this.state.marketData.high24h = newPrice;
    }
    if (newPrice < this.state.marketData.low24h || this.state.marketData.low24h === 0) {
      this.state.marketData.low24h = newPrice;
    }
  }

  private async performAIAnalysis(economicEvents: any[], newsItems: any[]): Promise<void> {
    try {
      // Update technical indicators
      this.state.indicators = await this.marketAnalyzer.calculateIndicators(this.state.marketData);
      
      // Convert market data to broker format for AI analysis
      const marketDataFeed = {
        symbol: this.state.marketData.symbol,
        bid: this.state.marketData.price * 0.9999,
        ask: this.state.marketData.price * 1.0001,
        spread: this.state.marketData.price * 0.0002,
        volume: this.state.marketData.volume,
        timestamp: this.state.marketData.timestamp,
        high: this.state.marketData.high24h,
        low: this.state.marketData.low24h,
        open: this.state.marketData.price * 0.998,
        close: this.state.marketData.price,
      };

      // Create trading sessions
      const sessions = [
        {
          name: 'London',
          startTime: '08:00',
          endTime: '17:00',
          timezone: 'GMT',
          isActive: true,
          volatility: 'MEDIUM' as const,
        },
        {
          name: 'New York',
          startTime: '13:00',
          endTime: '22:00',
          timezone: 'GMT',
          isActive: true,
          volatility: 'HIGH' as const,
        },
      ];

      // Perform advanced AI analysis
      const aiResult = await this.aiAnalyzer.performAdvancedAnalysis(
        marketDataFeed,
        this.state.indicators,
        sessions,
        newsItems,
        economicEvents
      );

      // Convert AI analysis to standard format
      this.state.analysis = {
        trend: aiResult.prediction.direction === 'BULLISH' ? 'BULLISH' : 
               aiResult.prediction.direction === 'BEARISH' ? 'BEARISH' : 'NEUTRAL',
        strength: aiResult.confidence * 100,
        signals: {
          rsi: this.convertAISignal(aiResult.prediction.direction, aiResult.confidence),
          macd: this.convertAISignal(aiResult.prediction.direction, aiResult.confidence),
          bollinger: this.convertAISignal(aiResult.prediction.direction, aiResult.confidence),
          trend: this.convertAISignal(aiResult.prediction.direction, aiResult.confidence),
        },
        confidence: aiResult.confidence * 100,
        recommendation: this.convertToRecommendation(aiResult.prediction.direction, aiResult.confidence),
      };

      // Update risk metrics with AI insights
      this.state.riskMetrics = this.riskManager.calculateRiskMetrics(
        this.state.marketData,
        this.state.indicators,
        this.state.status.currentBalance
      );

      // Adjust risk based on AI assessment
      if (aiResult.riskLevel === 'HIGH' || aiResult.riskLevel === 'EXTREME') {
        this.state.riskMetrics.currentRisk *= 0.5; // Reduce risk
        this.state.riskMetrics.positionSize *= 0.5;
      }

    } catch (error) {
      console.error('AI Analysis error:', error);
    }
  }

  private convertAISignal(direction: string, confidence: number): 'BUY' | 'SELL' | 'NEUTRAL' {
    if (confidence < 0.6) return 'NEUTRAL';
    return direction === 'BULLISH' ? 'BUY' : direction === 'BEARISH' ? 'SELL' : 'NEUTRAL';
  }

  private convertToRecommendation(direction: string, confidence: number): any {
    if (confidence >= 0.8) {
      return direction === 'BULLISH' ? 'STRONG_BUY' : direction === 'BEARISH' ? 'STRONG_SELL' : 'HOLD';
    } else if (confidence >= 0.6) {
      return direction === 'BULLISH' ? 'BUY' : direction === 'BEARISH' ? 'SELL' : 'HOLD';
    } else {
      return 'HOLD';
    }
  }

  private async shouldOpenEnhancedPosition(): Promise<{ shouldOpen: boolean; analysis?: AIAnalysisResult }> {
    // More conservative position opening - only with high confidence
    const hasOpenPositions = this.state.positions.some(p => p.status === 'OPEN');
    
    if (hasOpenPositions) {
      return { shouldOpen: false }; // Only one position at a time
    }

    // Require higher confidence for opening positions
    const analysis = this.state.analysis;
    const highConfidence = analysis.confidence > 75; // Increased from 70
    const strongRecommendation = analysis.recommendation === 'STRONG_BUY' || analysis.recommendation === 'STRONG_SELL';
    const goodRiskReward = this.state.riskMetrics.riskRewardRatio >= 2.0;

    // Additional safety checks
    const notMaxDrawdown = this.state.status.maxDrawdown < 0.15; // Max 15% drawdown
    const accountHealth = this.state.status.currentBalance > this.state.config.initialCapital * 0.9; // Not lost more than 10%

    return {
      shouldOpen: highConfidence && strongRecommendation && goodRiskReward && notMaxDrawdown && accountHealth,
      analysis: undefined // We don't have the full AI analysis here, but could pass it
    };
  }

  private async openEnhancedPosition(_aiAnalysis?: AIAnalysisResult): Promise<void> {
    try {
      const analysis = this.state.analysis;
      const isLong = analysis.recommendation === 'STRONG_BUY';
      
      // Enhanced position sizing with AI insights
      let positionSize = this.state.riskMetrics.positionSize;
      
      // Adjust position size based on confidence
      const confidenceMultiplier = Math.min(1.5, analysis.confidence / 100 * 2);
      positionSize *= confidenceMultiplier;
      
      // Create position
      const position: Position = {
        id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: this.state.marketData.symbol,
        type: isLong ? 'LONG' : 'SHORT',
        entryPrice: this.state.marketData.price,
        currentPrice: this.state.marketData.price,
        quantity: positionSize,
        stopLoss: this.calculateEnhancedStopLoss(isLong),
        takeProfit: this.calculateEnhancedTakeProfit(isLong),
        unrealizedPnL: 0,
        timestamp: new Date(),
        status: 'OPEN',
      };

      // Place order with broker if connected
      if (this.isConnectedToBroker) {
        await this.placeRealOrder(position);
      }

      this.state.positions.push(position);
      this.addAction(
        'OPEN_POSITION',
        `Opened ${position.type} position at $${position.entryPrice.toFixed(2)} (Confidence: ${analysis.confidence.toFixed(1)}%)`,
        true
      );

    } catch (error) {
      this.addAction('OPEN_POSITION', `Failed to open position: ${error}`, false);
    }
  }

  private calculateEnhancedStopLoss(isLong: boolean): number {
    const currentPrice = this.state.marketData.price;
    const atr = this.state.riskMetrics.stopLossDistance || currentPrice * 0.02;
    
    // Dynamic stop loss based on volatility and market conditions
    const volatilityMultiplier = Math.max(0.8, Math.min(2.0, this.state.riskMetrics.volatility / 2));
    const adjustedDistance = atr * volatilityMultiplier;

    if (isLong) {
      return currentPrice - adjustedDistance;
    } else {
      return currentPrice + adjustedDistance;
    }
  }

  private calculateEnhancedTakeProfit(isLong: boolean): number {
    const currentPrice = this.state.marketData.price;
    const stopDistance = Math.abs(currentPrice - (isLong ? this.calculateEnhancedStopLoss(true) : this.calculateEnhancedStopLoss(false)));
    
    // Enhanced risk-reward ratio
    const riskRewardRatio = Math.max(2.5, this.state.riskMetrics.riskRewardRatio);
    const takeProfitDistance = stopDistance * riskRewardRatio;

    if (isLong) {
      return currentPrice + takeProfitDistance;
    } else {
      return currentPrice - takeProfitDistance;
    }
  }

  private async placeRealOrder(position: Position): Promise<void> {
    try {
      const broker = brokerManager.getActiveBroker();
      if (!broker) return;

      const orderRequest: OrderRequest = {
        symbol: position.symbol,
        type: position.type === 'LONG' ? 'BUY' : 'SELL',
        volume: position.quantity,
        stopLoss: position.stopLoss,
        takeProfit: position.takeProfit,
        comment: `AI Bot - Confidence: ${this.state.analysis.confidence.toFixed(1)}%`,
      };

      const ticket = await broker.placeOrder(orderRequest);
      if (ticket) {
        // Store the broker ticket ID for tracking
        (position as any).brokerTicket = ticket;
        this.addAction('BROKER_ORDER', `Order placed with broker. Ticket: ${ticket}`, true);
      }
    } catch (error) {
      this.addAction('BROKER_ERROR', `Failed to place broker order: ${error}`, false);
    }
  }

  private async manageEnhancedPositions(): Promise<void> {
    for (const position of this.state.positions) {
      if (position.status === 'OPEN') {
        // Update position current price
        position.currentPrice = this.state.marketData.price;
        position.unrealizedPnL = this.calculateUnrealizedPnL(position);

        // Enhanced position management with trailing stops
        await this.updateTrailingStop(position);

        // Check exit conditions
        if (this.shouldCloseEnhancedPosition(position)) {
          await this.closePosition(position.id, 'Enhanced exit condition met');
        }
      }
    }
  }

  private async updateTrailingStop(position: Position): Promise<void> {
    const currentPrice = this.state.marketData.price;
    const atr = this.state.indicators.atr || position.entryPrice * 0.02;
    
    // Trailing stop logic
    const trailDistance = atr * 2;
    
    if (position.type === 'LONG') {
      const newStopLoss = currentPrice - trailDistance;
      if (newStopLoss > position.stopLoss) {
        position.stopLoss = newStopLoss;
        this.addAction('UPDATE_SL', `Trailing stop updated for ${position.type} position to ${newStopLoss.toFixed(2)}`, true);
      }
    } else {
      const newStopLoss = currentPrice + trailDistance;
      if (newStopLoss < position.stopLoss) {
        position.stopLoss = newStopLoss;
        this.addAction('UPDATE_SL', `Trailing stop updated for ${position.type} position to ${newStopLoss.toFixed(2)}`, true);
      }
    }
  }

  private shouldCloseEnhancedPosition(position: Position): boolean {
    const currentPrice = this.state.marketData.price;
    
    // Standard stop loss and take profit checks
    if (position.type === 'LONG') {
      if (currentPrice <= position.stopLoss || currentPrice >= position.takeProfit) {
        return true;
      }
    } else {
      if (currentPrice >= position.stopLoss || currentPrice <= position.takeProfit) {
        return true;
      }
    }

    // Enhanced exit conditions based on AI analysis
    const analysisChanged = this.hasAnalysisSignificantlyChanged(position);
    if (analysisChanged) {
      this.addAction('UPDATE', 'Market analysis changed significantly - considering early exit', true);
      return true;
    }

    // Time-based exit (don't hold positions too long)
    const positionAge = Date.now() - position.timestamp.getTime();
    const maxHoldTime = 30 * 60 * 1000; // 30 minutes max
    
    if (positionAge > maxHoldTime) {
      return true;
    }

    return false;
  }

  private hasAnalysisSignificantlyChanged(position: Position): boolean {
    // Check if market analysis has changed significantly since position opening
    const currentRecommendation = this.state.analysis.recommendation;
    const positionDirection = position.type;
    
    // If we're long but now have strong sell signal (or vice versa)
    if ((positionDirection === 'LONG' && currentRecommendation === 'STRONG_SELL') ||
        (positionDirection === 'SHORT' && currentRecommendation === 'STRONG_BUY')) {
      return true;
    }
    
    // If confidence has dropped significantly
    if (this.state.analysis.confidence < 40) {
      return true;
    }
    
    return false;
  }

  private async closePosition(positionId: string, reason: string): Promise<void> {
    const position = this.state.positions.find(p => p.id === positionId);
    if (!position || position.status !== 'OPEN') return;

    // Close with broker if connected
    if (this.isConnectedToBroker && (position as any).brokerTicket) {
      try {
        const broker = brokerManager.getActiveBroker();
        if (broker) {
          await broker.closeOrder((position as any).brokerTicket);
          this.addAction('BROKER_CLOSE', `Broker order closed. Ticket: ${(position as any).brokerTicket}`, true);
        }
      } catch (error) {
        this.addAction('BROKER_ERROR', `Failed to close broker order: ${error}`, false);
      }
    }

    position.status = 'CLOSED';
    position.currentPrice = this.state.marketData.price;
    
    const profit = this.calculateRealizedPnL(position);
    
    // Create trade record
    const trade: Trade = {
      id: `trade_${Date.now()}`,
      symbol: position.symbol,
      type: position.type,
      entryPrice: position.entryPrice,
      exitPrice: position.currentPrice,
      quantity: position.quantity,
      profit,
      duration: Math.floor((new Date().getTime() - position.timestamp.getTime()) / 60000),
      timestamp: new Date(),
      reason,
    };

    this.state.trades.push(trade);
    this.state.status.currentBalance += profit;
    this.state.status.totalProfit = this.state.status.currentBalance - this.state.config.initialCapital;
    this.state.status.tradesCount++;

    this.addAction(
      'CLOSE_POSITION',
      `Closed ${position.type} position. P&L: $${profit.toFixed(2)} (Reason: ${reason})`,
      true
    );
  }

  private async closeAllPositions(reason: string): Promise<void> {
    const openPositions = this.state.positions.filter(p => p.status === 'OPEN');
    for (const position of openPositions) {
      await this.closePosition(position.id, reason);
    }
  }

  private calculateUnrealizedPnL(position: Position): number {
    const currentPrice = position.currentPrice;
    const entryPrice = position.entryPrice;
    const quantity = position.quantity;

    if (position.type === 'LONG') {
      return (currentPrice - entryPrice) * quantity;
    } else {
      return (entryPrice - currentPrice) * quantity;
    }
  }

  private calculateRealizedPnL(position: Position): number {
    return this.calculateUnrealizedPnL(position);
  }

  // New smart methods
  private async updateSmartMarketData(): Promise<void> {
    try {
      if (this.isConnectedToBroker) {
        // Get real market data from broker
        const broker = brokerManager.getActiveBroker();
        if (broker) {
          const realData = await broker.getMarketData(this.state.marketData.symbol);
          this.state.marketData = {
            symbol: realData.symbol,
            price: realData.close,
            volume: realData.volume,
            timestamp: realData.timestamp,
            high24h: realData.high,
            low24h: realData.low,
            change24h: ((realData.close - realData.open) / realData.open) * 100,
          };
          return;
        }
      }
      
      // Enhanced simulation with more realistic patterns
      this.generateUltraRealisticData();
    } catch (error) {
      console.error('Smart market data update error:', error);
      this.generateUltraRealisticData();
    }
  }

  private generateUltraRealisticData(): void {
    const basePrice = 45000;
    const currentPrice = this.state.marketData.price || basePrice;
    
    // Time-based volatility
    const now = new Date();
    const hour = now.getHours();
    let volatilityMultiplier = 1.0;
    
    // London session (8-17 GMT)
    if (hour >= 8 && hour <= 17) volatilityMultiplier = 1.8;
    // NY session (13-22 GMT) 
    else if (hour >= 13 && hour <= 22) volatilityMultiplier = 2.2;
    // Asian session (22-8 GMT)
    else if (hour >= 22 || hour <= 8) volatilityMultiplier = 1.3;
    // Weekend/Low activity
    else volatilityMultiplier = 0.8;

    // Market regime simulation
    const marketRegime = Math.random();
    let priceChange = 0;
    
    if (marketRegime < 0.3) {
      // Trending market (30% chance)
      const trendDirection = Math.random() > 0.5 ? 1 : -1;
      priceChange = (Math.random() * 0.02 + 0.005) * trendDirection * volatilityMultiplier;
    } else if (marketRegime < 0.8) {
      // Ranging market (50% chance)
      priceChange = (Math.random() - 0.5) * 0.01 * volatilityMultiplier;
    } else {
      // Breakout market (20% chance)
      const breakoutDirection = Math.random() > 0.5 ? 1 : -1;
      priceChange = (Math.random() * 0.03 + 0.01) * breakoutDirection * volatilityMultiplier;
    }

    // Add some noise and momentum persistence
    const previousChange = this.state.marketData.change24h || 0;
    const momentum = previousChange * 0.15; // 15% momentum continuation
    const noise = (Math.random() - 0.5) * 0.005; // Small random noise
    
    const totalChange = priceChange + momentum + noise;
    const newPrice = currentPrice * (1 + totalChange);

    // Realistic volume based on price movement
    const priceMovementAbs = Math.abs(totalChange);
    const baseVolume = 800000;
    const volumeMultiplier = 1 + (priceMovementAbs * 50); // Higher volume with larger moves
    const newVolume = Math.floor(baseVolume * volumeMultiplier * volatilityMultiplier);

    this.state.marketData = {
      ...this.state.marketData,
      price: newPrice,
      volume: newVolume,
      timestamp: new Date(),
      change24h: totalChange * 100,
    };

    // Update high/low
    if (newPrice > this.state.marketData.high24h || this.state.marketData.high24h === 0) {
      this.state.marketData.high24h = newPrice;
    }
    if (newPrice < this.state.marketData.low24h || this.state.marketData.low24h === 0) {
      this.state.marketData.low24h = newPrice;
    }
  }

  private updateStateWithSmartAnalysis(smartAnalysis: SmartAnalysisResult): void {
    // Convert smart analysis to standard format
    this.state.analysis = {
      trend: smartAnalysis.direction,
      strength: smartAnalysis.strength,
      signals: {
        rsi: smartAnalysis.signal === 'STRONG_BUY' || smartAnalysis.signal === 'BUY' ? 'BUY' :
             smartAnalysis.signal === 'STRONG_SELL' || smartAnalysis.signal === 'SELL' ? 'SELL' : 'NEUTRAL',
        macd: smartAnalysis.signal === 'STRONG_BUY' || smartAnalysis.signal === 'BUY' ? 'BUY' :
              smartAnalysis.signal === 'STRONG_SELL' || smartAnalysis.signal === 'SELL' ? 'SELL' : 'NEUTRAL',
        bollinger: smartAnalysis.signal === 'STRONG_BUY' || smartAnalysis.signal === 'BUY' ? 'BUY' :
                   smartAnalysis.signal === 'STRONG_SELL' || smartAnalysis.signal === 'SELL' ? 'SELL' : 'NEUTRAL',
        trend: smartAnalysis.signal === 'STRONG_BUY' || smartAnalysis.signal === 'BUY' ? 'BUY' :
               smartAnalysis.signal === 'STRONG_SELL' || smartAnalysis.signal === 'SELL' ? 'SELL' : 'NEUTRAL',
      },
      confidence: smartAnalysis.confidence,
      recommendation: smartAnalysis.signal,
    };

    // Update risk metrics with smart analysis insights
    this.state.riskMetrics = {
      ...this.state.riskMetrics,
      positionSize: smartAnalysis.positionSize,
      stopLossDistance: Math.abs(smartAnalysis.entryPrice - smartAnalysis.stopLoss),
      takeProfitDistance: Math.abs(smartAnalysis.entryPrice - smartAnalysis.takeProfit),
      riskRewardRatio: Math.abs(smartAnalysis.entryPrice - smartAnalysis.takeProfit) / 
                       Math.abs(smartAnalysis.entryPrice - smartAnalysis.stopLoss),
    };
  }

  private async shouldOpenSmartPosition(smartAnalysis: SmartAnalysisResult): Promise<boolean> {
    // Ultra-conservative position opening with smart analysis
    const hasOpenPositions = this.state.positions.some(p => p.status === 'OPEN');
    
    if (hasOpenPositions) {
      return false; // Only one position at a time for safety
    }

    // Ultra-strict requirements for opening positions
    const ultraHighConfidence = smartAnalysis.confidence >= 85; // Increased from 75
    const strongSignal = smartAnalysis.signal === 'STRONG_BUY' || smartAnalysis.signal === 'STRONG_SELL';
    const lowRisk = smartAnalysis.riskLevel === 'VERY_LOW' || smartAnalysis.riskLevel === 'LOW';
    const goodProbability = smartAnalysis.probability >= 0.8;
    
    // Account health checks
    const notMaxDrawdown = this.state.status.maxDrawdown < 0.1; // Max 10% drawdown
    const accountHealth = this.state.status.currentBalance > this.state.config.initialCapital * 0.95; // Not lost more than 5%
    
    // Market condition checks
    const sufficientData = this.smartEngine['priceHistory'].length >= 50;
    
    const shouldOpen = ultraHighConfidence && strongSignal && lowRisk && goodProbability && 
                      notMaxDrawdown && accountHealth && sufficientData;

    if (!shouldOpen) {
      let reason = 'Waiting for optimal conditions: ';
      const reasons = [];
      if (!ultraHighConfidence) reasons.push(`Confidence ${smartAnalysis.confidence}% < 85%`);
      if (!strongSignal) reasons.push(`Signal: ${smartAnalysis.signal}`);
      if (!lowRisk) reasons.push(`Risk: ${smartAnalysis.riskLevel}`);
      if (!goodProbability) reasons.push(`Probability: ${(smartAnalysis.probability * 100).toFixed(1)}%`);
      if (!notMaxDrawdown) reasons.push(`Drawdown: ${(this.state.status.maxDrawdown * 100).toFixed(1)}%`);
      if (!accountHealth) reasons.push('Account health concern');
      if (!sufficientData) reasons.push('Insufficient market data');
      
      this.addAction('ANALYSIS', reason + reasons.join(', '), true);
    }

    return shouldOpen;
  }

  private async openSmartPosition(smartAnalysis: SmartAnalysisResult): Promise<void> {
    try {
      const isLong = smartAnalysis.signal === 'STRONG_BUY' || smartAnalysis.signal === 'BUY';
      
      // Use smart analysis for position parameters
      const position: Position = {
        id: `smart_pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: this.state.marketData.symbol,
        type: isLong ? 'LONG' : 'SHORT',
        entryPrice: smartAnalysis.entryPrice,
        currentPrice: smartAnalysis.entryPrice,
        quantity: smartAnalysis.positionSize,
        stopLoss: smartAnalysis.stopLoss,
        takeProfit: smartAnalysis.takeProfit,
        unrealizedPnL: 0,
        timestamp: new Date(),
        status: 'OPEN',
      };

      // Place order with broker if connected
      if (this.isConnectedToBroker) {
        await this.placeRealOrder(position);
      }

      this.state.positions.push(position);
      
      this.addAction(
        'OPEN_POSITION',
        `Smart ${position.type} position opened: Entry ${position.entryPrice.toFixed(2)}, ` +
        `SL ${position.stopLoss.toFixed(2)}, TP ${position.takeProfit.toFixed(2)} ` +
        `(Confidence: ${smartAnalysis.confidence.toFixed(1)}%, Risk: ${smartAnalysis.riskLevel})`,
        true
      );

    } catch (error) {
      this.addAction('OPEN_POSITION', `Failed to open smart position: ${error}`, false);
    }
  }

  private async manageSmartPositions(smartAnalysis: SmartAnalysisResult): Promise<void> {
    for (const position of this.state.positions) {
      if (position.status === 'OPEN') {
        // Update position current price
        position.currentPrice = this.state.marketData.price;
        position.unrealizedPnL = this.calculateUnrealizedPnL(position);

        // Smart trailing stop management
        await this.updateSmartTrailingStop(position, smartAnalysis);

        // Enhanced exit condition checking
        if (await this.shouldCloseSmartPosition(position, smartAnalysis)) {
          await this.closePosition(position.id, 'Smart exit condition triggered');
        }
      }
    }
  }

  private async updateSmartTrailingStop(position: Position, smartAnalysis: SmartAnalysisResult): Promise<void> {
    const currentPrice = this.state.marketData.price;
    const entryPrice = position.entryPrice;
    
    // Calculate profit percentage
    const profitPercent = position.type === 'LONG' 
      ? (currentPrice - entryPrice) / entryPrice
      : (entryPrice - currentPrice) / entryPrice;

    // Only update trailing stop if we're in profit
    if (profitPercent > 0.01) { // At least 1% profit
      const atr = Math.abs(smartAnalysis.entryPrice - smartAnalysis.stopLoss) / 2;
      const trailDistance = atr * (1 + profitPercent * 2); // Wider trail as profit increases
      
      if (position.type === 'LONG') {
        const newStopLoss = currentPrice - trailDistance;
        if (newStopLoss > position.stopLoss) {
          const oldStopLoss = position.stopLoss;
          position.stopLoss = newStopLoss;
          this.addAction('UPDATE_SL', 
            `Smart trailing stop: ${oldStopLoss.toFixed(2)} → ${newStopLoss.toFixed(2)} ` +
            `(Profit: ${(profitPercent * 100).toFixed(1)}%)`, true);
        }
      } else {
        const newStopLoss = currentPrice + trailDistance;
        if (newStopLoss < position.stopLoss) {
          const oldStopLoss = position.stopLoss;
          position.stopLoss = newStopLoss;
          this.addAction('UPDATE_SL', 
            `Smart trailing stop: ${oldStopLoss.toFixed(2)} → ${newStopLoss.toFixed(2)} ` +
            `(Profit: ${(profitPercent * 100).toFixed(1)}%)`, true);
        }
      }
    }
  }

  private async shouldCloseSmartPosition(position: Position, smartAnalysis: SmartAnalysisResult): Promise<boolean> {
    const currentPrice = this.state.marketData.price;
    
    // Standard stop loss and take profit checks
    if (position.type === 'LONG') {
      if (currentPrice <= position.stopLoss || currentPrice >= position.takeProfit) {
        return true;
      }
    } else {
      if (currentPrice >= position.stopLoss || currentPrice <= position.takeProfit) {
        return true;
      }
    }

    // Smart exit conditions
    const positionAge = Date.now() - position.timestamp.getTime();
    const maxHoldTime = smartAnalysis.timeframe * 60 * 1000; // Convert minutes to milliseconds
    
    // Time-based exit
    if (positionAge > maxHoldTime) {
      this.addAction('ANALYSIS', `Position held for ${Math.floor(positionAge / 60000)} minutes - time limit reached`, true);
      return true;
    }

    // Smart analysis reversal detection
    const positionDirection = position.type;
    const currentSignal = smartAnalysis.signal;
    
    if ((positionDirection === 'LONG' && (currentSignal === 'STRONG_SELL' || currentSignal === 'SELL')) ||
        (positionDirection === 'SHORT' && (currentSignal === 'STRONG_BUY' || currentSignal === 'BUY'))) {
      this.addAction('ANALYSIS', `Smart exit: Market analysis reversed (Signal: ${currentSignal})`, true);
      return true;
    }

    // Risk level escalation
    if (smartAnalysis.riskLevel === 'EXTREME' || smartAnalysis.riskLevel === 'HIGH') {
      this.addAction('ANALYSIS', `Smart exit: Risk level escalated to ${smartAnalysis.riskLevel}`, true);
      return true;
    }

    // Confidence drop
    if (smartAnalysis.confidence < 50) {
      this.addAction('ANALYSIS', `Smart exit: Confidence dropped to ${smartAnalysis.confidence.toFixed(1)}%`, true);
      return true;
    }

    return false;
  }

  private updateSmartBotMetrics(): void {
    // Enhanced metrics calculation
    if (this.state.trades.length > 0) {
      const winningTrades = this.state.trades.filter(t => t.profit > 0).length;
      this.state.status.winRate = (winningTrades / this.state.trades.length) * 100;
      
      // Record results in smart engine for learning
      this.state.trades.forEach(trade => {
        this.smartEngine.recordTradeResult(trade, trade.profit > 0);
      });
    }

    // Update max drawdown
    const currentDrawdown = Math.max(0, (this.state.config.initialCapital - this.state.status.currentBalance) / this.state.config.initialCapital);
    if (currentDrawdown > this.state.status.maxDrawdown) {
      this.state.status.maxDrawdown = currentDrawdown;
    }

    // Get performance metrics from smart engine
    const smartMetrics = this.smartEngine.getPerformanceMetrics();
    
    // Add smart metrics to actions log
    if (this.state.trades.length > 0 && this.state.trades.length % 5 === 0) { // Every 5 trades
      this.addAction('ANALYSIS', 
        `Smart metrics: Win rate ${smartMetrics.winRate.toFixed(1)}%, ` +
        `Profit factor ${smartMetrics.profitFactor.toFixed(2)}, ` +
        `Learning rate ${(smartMetrics.learningRate * 100).toFixed(1)}%`, true);
    }
  }

  private updateBotMetrics(): void {
    this.updateSmartBotMetrics();
  }

  private addAction(type: BotAction['type'], details: string, success: boolean, error?: string): void {
    this.state.actions.unshift({
      type,
      timestamp: new Date(),
      details,
      success,
      error,
    });

    // Keep only last 50 actions
    if (this.state.actions.length > 50) {
      this.state.actions = this.state.actions.slice(0, 50);
    }

    this.state.status.lastAction = details;
  }

  // Public getters
  getState(): BotState {
    return { ...this.state };
  }

  getStatus(): BotStatus {
    return { ...this.state.status };
  }

  getBrokerConnection(): boolean {
    return this.isConnectedToBroker;
  }

  async getBrokerAccountInfo(): Promise<any> {
    if (!this.isConnectedToBroker) return null;
    return await brokerManager.getAccountInfo();
  }

  reset(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    
    this.state = this.initializeState();
    this.addAction('RESET', 'Enhanced trading bot reset to initial state', true);
  }
}

// Export enhanced singleton instance
export const enhancedTradingBot = new EnhancedTradingBot();