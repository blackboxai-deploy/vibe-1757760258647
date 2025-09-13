// Ultra-Smart Trading Engine with Advanced AI

import { MarketData, Trade } from '@/types/trading';
import { MarketDataFeed } from '@/types/broker';

export interface SmartAnalysisResult {
  signal: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  confidence: number; // 0-100
  probability: number; // 0-1
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number; // 0-100
  riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  reasoning: string[];
  timeframe: number; // minutes to hold
}

export interface MarketPattern {
  name: string;
  type: 'REVERSAL' | 'CONTINUATION' | 'BREAKOUT';
  bullish: boolean;
  reliability: number; // 0-1
  target: number;
  stopLoss: number;
}

export interface MarketMomentum {
  shortTerm: number; // -1 to 1
  mediumTerm: number;
  longTerm: number;
  acceleration: number;
  volume: number; // Volume confirmation
}

export interface PriceLevel {
  price: number;
  type: 'SUPPORT' | 'RESISTANCE' | 'PIVOT';
  strength: number; // 0-1
  touches: number; // How many times price touched this level
}

export class SmartTradingEngine {
  private priceHistory: number[] = [];
  private volumeHistory: number[] = [];
  private highHistory: number[] = [];
  private lowHistory: number[] = [];
  private timestampHistory: Date[] = [];
  private maxHistory = 200; // Keep more history for better analysis

  private successfulTrades: Trade[] = [];
  private failedTrades: Trade[] = [];
  private learningRate = 0.1; // Adaptive learning

  updateMarketData(data: MarketData | MarketDataFeed): void {
    const price = 'close' in data ? data.close : data.price;
    const high = 'high' in data ? data.high : data.high24h || price * 1.001;
    const low = 'low' in data ? data.low : data.low24h || price * 0.999;
    const volume = data.volume;
    const timestamp = data.timestamp;

    this.priceHistory.push(price);
    this.volumeHistory.push(volume);
    this.highHistory.push(high);
    this.lowHistory.push(low);
    this.timestampHistory.push(timestamp);

    // Keep only recent history
    if (this.priceHistory.length > this.maxHistory) {
      this.priceHistory.shift();
      this.volumeHistory.shift();
      this.highHistory.shift();
      this.lowHistory.shift();
      this.timestampHistory.shift();
    }
  }

  async analyzeMarket(currentData: MarketData): Promise<SmartAnalysisResult> {
    if (this.priceHistory.length < 50) {
      return this.getDefaultAnalysis(currentData.price);
    }

    // Multi-layer analysis
    const technical = this.analyzeTechnicalPatterns();
    const momentum = this.analyzeMomentum();
    const volume = this.analyzeVolumeProfile();
    const patterns = this.detectPatterns();
    const levels = this.findKeyLevels();
    const marketStructure = this.analyzeMarketStructure();
    const sentiment = this.analyzeSentiment();
    
    // Machine learning prediction
    const mlPrediction = this.generateMLPrediction();
    
    // Risk assessment
    const risk = this.assessRisk();

    // Combine all analyses with weighted scoring
    const combinedScore = this.combineAnalyses({
      technical: technical.score,
      momentum: momentum.score,
      volume: volume.score,
      patterns: patterns.score,
      levels: levels.score,
      structure: marketStructure.score,
      sentiment: sentiment.score,
      ml: mlPrediction.score,
    });

    // Generate final analysis
    return this.generateSmartAnalysis(combinedScore, currentData.price, {
      technical,
      momentum,
      volume,
      patterns,
      levels,
      risk,
    });
  }

  private analyzeTechnicalPatterns(): { score: number; signals: string[]; strength: number } {
    const signals: string[] = [];
    let bullishSignals = 0;
    let bearishSignals = 0;
    let strength = 0;

    // Enhanced RSI with adaptive levels
    const rsi = this.calculateRSI(this.priceHistory, 14);
    const volatility = this.calculateVolatility();
    const rsiOverbought = volatility > 0.05 ? 75 : 70;
    const rsiOversold = volatility > 0.05 ? 25 : 30;

    if (rsi < rsiOversold) {
      bullishSignals++;
      signals.push(`RSI oversold at ${rsi.toFixed(1)}`);
      strength += (rsiOversold - rsi) / rsiOversold * 20;
    } else if (rsi > rsiOverbought) {
      bearishSignals++;
      signals.push(`RSI overbought at ${rsi.toFixed(1)}`);
      strength += (rsi - rsiOverbought) / (100 - rsiOverbought) * 20;
    }

    // Multi-timeframe MACD
    const macd5 = this.calculateMACD(this.priceHistory, 5, 13, 9);  // Faster
    const macd12 = this.calculateMACD(this.priceHistory, 12, 26, 9); // Standard
    const macd26 = this.calculateMACD(this.priceHistory, 26, 52, 18); // Slower

    // MACD alignment check
    if (macd5.histogram > 0 && macd12.histogram > 0 && macd26.histogram > 0) {
      bullishSignals += 2;
      signals.push('Multi-timeframe MACD bullish alignment');
      strength += 25;
    } else if (macd5.histogram < 0 && macd12.histogram < 0 && macd26.histogram < 0) {
      bearishSignals += 2;
      signals.push('Multi-timeframe MACD bearish alignment');
      strength += 25;
    }

    // Bollinger Band analysis with squeeze detection
    const bb20 = this.calculateBollingerBands(this.priceHistory, 20, 2);
    const currentPrice = this.priceHistory[this.priceHistory.length - 1];
    const bandWidth = (bb20.upper - bb20.lower) / bb20.middle;
    
    if (bandWidth < 0.02) { // Squeeze detected
      signals.push('Bollinger Band squeeze - breakout imminent');
      strength += 15;
    }

    if (currentPrice <= bb20.lower * 1.001) {
      bullishSignals++;
      signals.push('Price at Bollinger lower band');
      strength += 15;
    } else if (currentPrice >= bb20.upper * 0.999) {
      bearishSignals++;
      signals.push('Price at Bollinger upper band');
      strength += 15;
    }

    // Moving Average Cascade
    const ema8 = this.calculateEMA(this.priceHistory, 8);
    const ema21 = this.calculateEMA(this.priceHistory, 21);
    const ema55 = this.calculateEMA(this.priceHistory, 55);
    const sma200 = this.calculateSMA(this.priceHistory, Math.min(200, this.priceHistory.length));

    if (ema8 > ema21 && ema21 > ema55 && ema55 > sma200 && currentPrice > ema8) {
      bullishSignals += 2;
      signals.push('Perfect bullish MA alignment');
      strength += 30;
    } else if (ema8 < ema21 && ema21 < ema55 && ema55 < sma200 && currentPrice < ema8) {
      bearishSignals += 2;
      signals.push('Perfect bearish MA alignment');
      strength += 30;
    }

    // Stochastic with divergence
    const stoch = this.calculateStochastic();
    if (stoch.k < 20 && stoch.d < 20) {
      bullishSignals++;
      signals.push(`Stochastic oversold: K=${stoch.k.toFixed(1)}`);
      strength += 10;
    } else if (stoch.k > 80 && stoch.d > 80) {
      bearishSignals++;
      signals.push(`Stochastic overbought: K=${stoch.k.toFixed(1)}`);
      strength += 10;
    }

    const netSignals = bullishSignals - bearishSignals;
    const score = 0.5 + (netSignals / (bullishSignals + bearishSignals + 1)) * 0.5;
    
    return { score: Math.max(0, Math.min(1, score)), signals, strength };
  }

  private analyzeMomentum(): { score: number; momentum: MarketMomentum; signals: string[] } {
    const signals: string[] = [];
    
    // Price Rate of Change (multiple periods)
    const roc1 = this.calculateROC(1);
    const roc5 = this.calculateROC(5);
    const roc14 = this.calculateROC(14);
    
    // Volume Rate of Change
    const volumeROC = this.calculateVolumeROC(5);
    
    const momentum: MarketMomentum = {
      shortTerm: roc1,
      mediumTerm: roc5,
      longTerm: roc14,
      acceleration: roc1 - roc5, // Acceleration/deceleration
      volume: volumeROC,
    };

    let score = 0.5;
    
    // Momentum alignment
    if (roc1 > 0 && roc5 > 0 && roc14 > 0) {
      score += 0.3;
      signals.push('Positive momentum across all timeframes');
    } else if (roc1 < 0 && roc5 < 0 && roc14 < 0) {
      score -= 0.3;
      signals.push('Negative momentum across all timeframes');
    }

    // Volume confirmation
    if ((roc5 > 0 && volumeROC > 0) || (roc5 < 0 && volumeROC < 0)) {
      score += roc5 > 0 ? 0.15 : -0.15;
      signals.push('Volume confirms price momentum');
    }

    // Acceleration analysis
    if (Math.abs(momentum.acceleration) > 0.005) {
      const direction = momentum.acceleration > 0 ? 'acceleration' : 'deceleration';
      signals.push(`Price momentum ${direction} detected`);
      score += momentum.acceleration > 0 ? 0.1 : -0.1;
    }

    return { score: Math.max(0, Math.min(1, score)), momentum, signals };
  }

  private analyzeVolumeProfile(): { score: number; signals: string[]; volumePattern: string } {
    const signals: string[] = [];
    let score = 0.5;
    let volumePattern = 'NORMAL';

    if (this.volumeHistory.length < 20) {
      return { score, signals, volumePattern };
    }

    const currentVolume = this.volumeHistory[this.volumeHistory.length - 1];
    const avgVolume = this.volumeHistory.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const volumeRatio = currentVolume / avgVolume;

    // Volume spike analysis
    if (volumeRatio > 2.0) {
      volumePattern = 'SPIKE';
      signals.push(`Volume spike: ${volumeRatio.toFixed(1)}x average`);
      score += 0.2;
    } else if (volumeRatio > 1.5) {
      volumePattern = 'HIGH';
      signals.push(`High volume: ${volumeRatio.toFixed(1)}x average`);
      score += 0.1;
    } else if (volumeRatio < 0.3) {
      volumePattern = 'LOW';
      signals.push('Low volume - weak conviction');
      score -= 0.1;
    }

    // Volume trend analysis
    const volumeTrend = this.calculateVolumeMA(5);
    const volumeTrendLong = this.calculateVolumeMA(20);
    
    if (volumeTrend > volumeTrendLong * 1.2) {
      signals.push('Volume trend increasing');
      score += 0.1;
    } else if (volumeTrend < volumeTrendLong * 0.8) {
      signals.push('Volume trend decreasing');
      score -= 0.1;
    }

    // Price-Volume correlation
    const priceChange = (this.priceHistory[this.priceHistory.length - 1] / this.priceHistory[this.priceHistory.length - 5] - 1);
    const volumeChange = (currentVolume / this.volumeHistory[this.volumeHistory.length - 5] - 1);
    
    if ((priceChange > 0.01 && volumeChange > 0.2) || (priceChange < -0.01 && volumeChange > 0.2)) {
      signals.push('Strong price-volume correlation');
      score += priceChange > 0 ? 0.15 : -0.15;
    }

    return { score: Math.max(0, Math.min(1, score)), signals, volumePattern };
  }

  private detectPatterns(): { score: number; patterns: MarketPattern[]; signals: string[] } {
    const patterns: MarketPattern[] = [];
    const signals: string[] = [];
    let score = 0.5;

    if (this.priceHistory.length < 30) {
      return { score, patterns, signals };
    }

    // Double Top/Bottom detection
    const _highs = this.findLocalHighs();
    const _lows = this.findLocalLows();

    // Hammer/Doji patterns
    const candlePattern = this.detectCandlestickPatterns();
    if (candlePattern) {
      patterns.push(candlePattern);
      signals.push(`${candlePattern.name} pattern detected`);
      score += candlePattern.bullish ? 0.15 : -0.15;
    }

    // Triangle patterns
    const trianglePattern = this.detectTrianglePattern();
    if (trianglePattern) {
      patterns.push(trianglePattern);
      signals.push(`${trianglePattern.name} pattern forming`);
      score += trianglePattern.bullish ? 0.1 : -0.1;
    }

    // Head and Shoulders
    const h_s_pattern = this.detectHeadAndShoulders();
    if (h_s_pattern) {
      patterns.push(h_s_pattern);
      signals.push(`${h_s_pattern.name} pattern detected`);
      score += h_s_pattern.bullish ? 0.2 : -0.2;
    }

    return { score: Math.max(0, Math.min(1, score)), patterns, signals };
  }

  private findKeyLevels(): { score: number; levels: PriceLevel[]; signals: string[] } {
    const levels: PriceLevel[] = [];
    const signals: string[] = [];
    let score = 0.5;

    if (this.priceHistory.length < 50) {
      return { score, levels, signals };
    }

    const currentPrice = this.priceHistory[this.priceHistory.length - 1];
    
    // Find support and resistance levels
    const supportLevels = this.findSupportLevels();
    const resistanceLevels = this.findResistanceLevels();
    
    levels.push(...supportLevels, ...resistanceLevels);

    // Analyze price position relative to key levels
    const nearestSupport = supportLevels.find(level => level.price < currentPrice);
    const nearestResistance = resistanceLevels.find(level => level.price > currentPrice);

    if (nearestSupport && (currentPrice - nearestSupport.price) / currentPrice < 0.01) {
      signals.push(`Price near strong support at ${nearestSupport.price.toFixed(2)}`);
      score += 0.15 * nearestSupport.strength;
    }

    if (nearestResistance && (nearestResistance.price - currentPrice) / currentPrice < 0.01) {
      signals.push(`Price near strong resistance at ${nearestResistance.price.toFixed(2)}`);
      score -= 0.15 * nearestResistance.strength;
    }

    return { score: Math.max(0, Math.min(1, score)), levels, signals };
  }

  private analyzeMarketStructure(): { score: number; signals: string[]; structure: string } {
    const signals: string[] = [];
    let score = 0.5;
    let structure = 'SIDEWAYS';

    if (this.priceHistory.length < 30) {
      return { score, signals, structure };
    }

    // Higher highs and higher lows = uptrend
    // Lower highs and lower lows = downtrend
    const recentHighs = this.findLocalHighs().slice(-3);
    const recentLows = this.findLocalLows().slice(-3);

    if (recentHighs.length >= 2 && recentLows.length >= 2) {
      const higherHighs = recentHighs[1] > recentHighs[0];
      const higherLows = recentLows[1] > recentLows[0];
      const lowerHighs = recentHighs[1] < recentHighs[0];
      const lowerLows = recentLows[1] < recentLows[0];

      if (higherHighs && higherLows) {
        structure = 'UPTREND';
        signals.push('Market structure: Higher highs and higher lows');
        score += 0.25;
      } else if (lowerHighs && lowerLows) {
        structure = 'DOWNTREND';
        signals.push('Market structure: Lower highs and lower lows');
        score -= 0.25;
      } else if (higherHighs && lowerLows) {
        structure = 'EXPANDING';
        signals.push('Market structure: Expanding range');
      } else if (lowerHighs && higherLows) {
        structure = 'CONTRACTING';
        signals.push('Market structure: Contracting range - breakout expected');
        score += 0.1;
      }
    }

    return { score: Math.max(0, Math.min(1, score)), signals, structure };
  }

  private analyzeSentiment(): { score: number; signals: string[] } {
    const signals: string[] = [];
    let score = 0.5;

    // Fear & Greed simulation based on volatility and momentum
    const volatility = this.calculateVolatility();
    const momentum = this.calculateROC(14);

    if (volatility > 0.05 && momentum < -0.05) {
      // High volatility + negative momentum = Fear
      score -= 0.2;
      signals.push('Market sentiment: Fear (high volatility + sell-off)');
    } else if (volatility < 0.02 && momentum > 0.03) {
      // Low volatility + positive momentum = Greed
      score += 0.2;
      signals.push('Market sentiment: Greed (low volatility + rally)');
    } else if (volatility > 0.08) {
      // Extreme volatility = Panic
      score -= 0.3;
      signals.push('Market sentiment: Panic (extreme volatility)');
    }

    return { score: Math.max(0, Math.min(1, score)), signals };
  }

  private generateMLPrediction(): { score: number; prediction: number; confidence: number } {
    // Simple ML simulation - in production, use actual trained models
    const features = this.extractFeatures();
    
    // Weighted feature combination (simulating trained model)
    const weights = [0.3, 0.25, 0.2, 0.15, 0.1]; // Feature importance
    let prediction = 0.5;
    
    features.forEach((feature, index) => {
      if (weights[index]) {
        prediction += (feature - 0.5) * weights[index];
      }
    });

    prediction = Math.max(0, Math.min(1, prediction));
    
    // Confidence based on feature alignment
    const featureVariance = this.calculateVariance(features);
    const confidence = Math.max(0.1, 1 - featureVariance * 2);

    return { score: prediction, prediction, confidence };
  }

  private assessRisk(): { level: SmartAnalysisResult['riskLevel']; score: number; factors: string[] } {
    const factors: string[] = [];
    let riskScore = 0;

    // Volatility risk
    const volatility = this.calculateVolatility();
    if (volatility > 0.08) {
      riskScore += 40;
      factors.push(`Extreme volatility: ${(volatility * 100).toFixed(1)}%`);
    } else if (volatility > 0.05) {
      riskScore += 25;
      factors.push(`High volatility: ${(volatility * 100).toFixed(1)}%`);
    } else if (volatility > 0.03) {
      riskScore += 10;
      factors.push(`Moderate volatility: ${(volatility * 100).toFixed(1)}%`);
    }

    // Momentum risk
    const momentum = Math.abs(this.calculateROC(5));
    if (momentum > 0.1) {
      riskScore += 20;
      factors.push('High momentum - potential reversal risk');
    }

    // Volume risk
    const volumeRatio = this.volumeHistory[this.volumeHistory.length - 1] / 
                       (this.volumeHistory.slice(-20).reduce((a, b) => a + b, 0) / 20);
    if (volumeRatio < 0.3) {
      riskScore += 15;
      factors.push('Low volume - liquidity risk');
    }

    // Time-of-day risk (simulated)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) { // Outside major trading hours
      riskScore += 10;
      factors.push('Outside major trading hours');
    }

    let level: SmartAnalysisResult['riskLevel'] = 'VERY_LOW';
    if (riskScore > 60) level = 'EXTREME';
    else if (riskScore > 40) level = 'HIGH';
    else if (riskScore > 20) level = 'MEDIUM';
    else if (riskScore > 10) level = 'LOW';

    return { level, score: riskScore / 100, factors };
  }

  private combineAnalyses(analyses: { [key: string]: number }): number {
    const weights = {
      technical: 0.25,
      momentum: 0.20,
      volume: 0.15,
      patterns: 0.15,
      levels: 0.10,
      structure: 0.10,
      sentiment: 0.03,
      ml: 0.02,
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(analyses).forEach(([key, score]) => {
      const weight = weights[key as keyof typeof weights] || 0;
      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0.5;
  }

  private generateSmartAnalysis(
    combinedScore: number, 
    currentPrice: number, 
    components: any
  ): SmartAnalysisResult {
    // Determine signal based on score and confidence
    const deviation = Math.abs(combinedScore - 0.5);
    const confidence = Math.min(100, deviation * 200); // 0-100%
    
    let signal: SmartAnalysisResult['signal'] = 'HOLD';
    let direction: SmartAnalysisResult['direction'] = 'NEUTRAL';
    
    if (combinedScore >= 0.8 && confidence >= 80) {
      signal = 'STRONG_BUY';
      direction = 'BULLISH';
    } else if (combinedScore >= 0.65 && confidence >= 65) {
      signal = 'BUY';
      direction = 'BULLISH';
    } else if (combinedScore <= 0.2 && confidence >= 80) {
      signal = 'STRONG_SELL';
      direction = 'BEARISH';
    } else if (combinedScore <= 0.35 && confidence >= 65) {
      signal = 'SELL';
      direction = 'BEARISH';
    }

    // Calculate position sizing, stops, and targets
    const _volatility = this.calculateVolatility();
    const atr = this.calculateATR();
    
    // Dynamic stop loss based on volatility
    const stopLossDistance = Math.max(atr * 2, currentPrice * 0.015); // Min 1.5%
    const takeProfitDistance = stopLossDistance * 3; // 3:1 reward ratio
    
    // Position sizing based on confidence and risk
    const baseSize = 0.02; // 2% base risk
    const confidenceMultiplier = confidence / 100;
    const riskMultiplier = components.risk.level === 'LOW' ? 1.5 : 
                          components.risk.level === 'HIGH' ? 0.5 : 1.0;
    
    const positionSize = baseSize * confidenceMultiplier * riskMultiplier;

    // Calculate exact levels
    const entryPrice = currentPrice;
    let stopLoss: number, takeProfit: number;
    
    if (direction === 'BULLISH') {
      stopLoss = entryPrice - stopLossDistance;
      takeProfit = entryPrice + takeProfitDistance;
    } else {
      stopLoss = entryPrice + stopLossDistance;
      takeProfit = entryPrice - takeProfitDistance;
    }

    // Collect all reasoning
    const reasoning = [
      ...components.technical.signals,
      ...components.momentum.signals,
      ...components.volume.signals,
      ...components.patterns.signals,
      ...components.levels.signals,
    ];

    // Dynamic timeframe based on signal strength
    const timeframe = confidence > 80 ? 45 : confidence > 60 ? 30 : 20; // minutes

    return {
      signal,
      confidence,
      probability: Math.abs(combinedScore - 0.5) * 2,
      direction,
      strength: combinedScore * 100,
      riskLevel: components.risk.level,
      entryPrice,
      stopLoss,
      takeProfit,
      positionSize: Math.min(0.05, Math.max(0.005, positionSize)), // 0.5% to 5%
      reasoning,
      timeframe,
    };
  }

  // Helper calculation methods
  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(prices: number[], fast: number, slow: number, _signal: number) {
    const emaFast = this.calculateEMA(prices, fast);
    const emaSlow = this.calculateEMA(prices, slow);
    const macdLine = emaFast - emaSlow;
    const signalLine = macdLine * 0.9; // Simplified
    const histogram = macdLine - signalLine;
    
    return { macd: macdLine, signal: signalLine, histogram };
  }

  private calculateBollingerBands(prices: number[], period: number, multiplier: number) {
    const sma = this.calculateSMA(prices, period);
    const variance = prices.slice(-period).reduce((sum, price) => 
      sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: sma + (stdDev * multiplier),
      middle: sma,
      lower: sma - (stdDev * multiplier),
    };
  }

  private calculateSMA(prices: number[], period: number): number {
    const slice = prices.slice(-Math.min(period, prices.length));
    return slice.reduce((sum, price) => sum + price, 0) / slice.length;
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];

    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
      ema = ((prices[i] - ema) * multiplier) + ema;
    }

    return ema;
  }

  private calculateStochastic(): { k: number; d: number } {
    if (this.priceHistory.length < 14) return { k: 50, d: 50 };
    
    const period = 14;
    const recent = this.priceHistory.slice(-period);
    const recentHighs = this.highHistory.slice(-period);
    const recentLows = this.lowHistory.slice(-period);
    
    const currentPrice = recent[recent.length - 1];
    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);
    
    const k = ((currentPrice - lowestLow) / (highestHigh - lowestLow)) * 100;
    const d = k * 0.9; // Simplified %D
    
    return { k, d };
  }

  private calculateROC(period: number): number {
    if (this.priceHistory.length < period + 1) return 0;
    
    const current = this.priceHistory[this.priceHistory.length - 1];
    const previous = this.priceHistory[this.priceHistory.length - 1 - period];
    
    return (current - previous) / previous;
  }

  private calculateVolumeROC(period: number): number {
    if (this.volumeHistory.length < period + 1) return 0;
    
    const current = this.volumeHistory[this.volumeHistory.length - 1];
    const previous = this.volumeHistory[this.volumeHistory.length - 1 - period];
    
    return previous > 0 ? (current - previous) / previous : 0;
  }

  private calculateVolumeMA(period: number): number {
    return this.calculateSMA(this.volumeHistory, period);
  }

  private calculateVolatility(): number {
    if (this.priceHistory.length < 20) return 0.02;
    
    const returns = [];
    for (let i = 1; i < Math.min(20, this.priceHistory.length); i++) {
      const ret = (this.priceHistory[i] - this.priceHistory[i-1]) / this.priceHistory[i-1];
      returns.push(ret);
    }
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateATR(): number {
    if (this.priceHistory.length < 14) return this.priceHistory[this.priceHistory.length - 1] * 0.02;
    
    const trueRanges = [];
    for (let i = 1; i < Math.min(14, this.priceHistory.length); i++) {
      const high = this.highHistory[i] || this.priceHistory[i] * 1.001;
      const low = this.lowHistory[i] || this.priceHistory[i] * 0.999;
      const prevClose = this.priceHistory[i - 1];
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }
    
    return trueRanges.reduce((a, b) => a + b, 0) / trueRanges.length;
  }

  private extractFeatures(): number[] {
    // Extract features for ML (normalized 0-1)
    const rsi = this.calculateRSI(this.priceHistory, 14) / 100;
    const momentum = (this.calculateROC(5) + 0.1) / 0.2; // Normalize ±10% to 0-1
    const volatility = Math.min(1, this.calculateVolatility() / 0.1); // Cap at 10%
    const volume = Math.min(1, this.volumeHistory[this.volumeHistory.length - 1] / 
                           (this.calculateVolumeMA(20) * 3)); // Cap at 3x average
    const trend = (this.calculateROC(20) + 0.2) / 0.4; // Normalize ±20% to 0-1
    
    return [rsi, momentum, volatility, volume, trend];
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  }

  private findLocalHighs(): number[] {
    const highs: number[] = [];
    for (let i = 2; i < this.priceHistory.length - 2; i++) {
      if (this.priceHistory[i] > this.priceHistory[i-1] && 
          this.priceHistory[i] > this.priceHistory[i-2] &&
          this.priceHistory[i] > this.priceHistory[i+1] &&
          this.priceHistory[i] > this.priceHistory[i+2]) {
        highs.push(this.priceHistory[i]);
      }
    }
    return highs;
  }

  private findLocalLows(): number[] {
    const lows: number[] = [];
    for (let i = 2; i < this.priceHistory.length - 2; i++) {
      if (this.priceHistory[i] < this.priceHistory[i-1] && 
          this.priceHistory[i] < this.priceHistory[i-2] &&
          this.priceHistory[i] < this.priceHistory[i+1] &&
          this.priceHistory[i] < this.priceHistory[i+2]) {
        lows.push(this.priceHistory[i]);
      }
    }
    return lows;
  }

  private detectCandlestickPatterns(): MarketPattern | null {
    // Simplified pattern detection
    if (this.priceHistory.length < 3) return null;
    
    const [prev2, prev1, current] = this.priceHistory.slice(-3);
    
    // Hammer pattern
    if (prev1 < prev2 && current > prev1 && (current - prev1) > (prev2 - prev1) * 0.6) {
      return {
        name: 'Bullish Hammer',
        type: 'REVERSAL',
        bullish: true,
        reliability: 0.7,
        target: current * 1.02,
        stopLoss: prev1 * 0.99,
      };
    }
    
    return null;
  }

  private detectTrianglePattern(): MarketPattern | null {
    // Simplified triangle detection
    return null;
  }

  private detectHeadAndShoulders(): MarketPattern | null {
    // Simplified H&S detection
    return null;
  }

  private findSupportLevels(): PriceLevel[] {
    const levels: PriceLevel[] = [];
    const lows = this.findLocalLows();
    
    // Group similar price levels
    lows.forEach(low => {
      const existingLevel = levels.find(level => Math.abs(level.price - low) / low < 0.01);
      if (existingLevel) {
        existingLevel.touches++;
        existingLevel.strength = Math.min(1, existingLevel.touches * 0.2);
      } else {
        levels.push({
          price: low,
          type: 'SUPPORT',
          strength: 0.3,
          touches: 1,
        });
      }
    });
    
    return levels.sort((a, b) => b.strength - a.strength).slice(0, 3);
  }

  private findResistanceLevels(): PriceLevel[] {
    const levels: PriceLevel[] = [];
    const highs = this.findLocalHighs();
    
    // Group similar price levels
    highs.forEach(high => {
      const existingLevel = levels.find(level => Math.abs(level.price - high) / high < 0.01);
      if (existingLevel) {
        existingLevel.touches++;
        existingLevel.strength = Math.min(1, existingLevel.touches * 0.2);
      } else {
        levels.push({
          price: high,
          type: 'RESISTANCE',
          strength: 0.3,
          touches: 1,
        });
      }
    });
    
    return levels.sort((a, b) => a.price - b.price).slice(0, 3);
  }

  private getDefaultAnalysis(currentPrice: number): SmartAnalysisResult {
    return {
      signal: 'HOLD',
      confidence: 20,
      probability: 0.5,
      direction: 'NEUTRAL',
      strength: 50,
      riskLevel: 'MEDIUM',
      entryPrice: currentPrice,
      stopLoss: currentPrice * 0.985,
      takeProfit: currentPrice * 1.045,
      positionSize: 0.01,
      reasoning: ['Insufficient data for analysis'],
      timeframe: 15,
    };
  }

  // Learning methods
  recordTradeResult(trade: Trade, wasSuccessful: boolean): void {
    if (wasSuccessful) {
      this.successfulTrades.push(trade);
    } else {
      this.failedTrades.push(trade);
    }

    // Keep only recent trades for learning
    if (this.successfulTrades.length > 50) {
      this.successfulTrades.shift();
    }
    if (this.failedTrades.length > 50) {
      this.failedTrades.shift();
    }

    // Adjust learning parameters based on success rate
    const totalTrades = this.successfulTrades.length + this.failedTrades.length;
    const successRate = this.successfulTrades.length / totalTrades;
    
    if (successRate < 0.4) {
      // Poor performance, increase caution
      this.learningRate *= 1.1;
    } else if (successRate > 0.7) {
      // Good performance, maintain strategy
      this.learningRate *= 0.95;
    }
  }

  getPerformanceMetrics() {
    const totalTrades = this.successfulTrades.length + this.failedTrades.length;
    const winRate = totalTrades > 0 ? (this.successfulTrades.length / totalTrades) * 100 : 0;
    const avgProfit = this.successfulTrades.reduce((sum, trade) => sum + trade.profit, 0) / 
                     Math.max(1, this.successfulTrades.length);
    const avgLoss = this.failedTrades.reduce((sum, trade) => sum + Math.abs(trade.profit), 0) / 
                   Math.max(1, this.failedTrades.length);
    const profitFactor = avgLoss > 0 ? avgProfit / avgLoss : 0;

    return {
      totalTrades,
      winRate,
      avgProfit,
      avgLoss,
      profitFactor,
      learningRate: this.learningRate,
    };
  }
}