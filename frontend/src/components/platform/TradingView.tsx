import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Plus, TrendingUp, TrendingDown, Clock, Zap, BarChart2, Activity, Volume2, 
  ZoomIn, ZoomOut, Maximize2, ChevronUp, ChevronDown, Flame, Star, Menu, Trophy, 
  Settings, Minus, MousePointer, Pencil, Camera, Bell, Columns, GitCompare, 
  Play, Pause, SkipBack, SkipForward, Target
} from 'lucide-react';
import { Trade, Market, PriceData } from '../../lib/types';
import { chartAPI, tradingAPI } from '../../lib/api';

interface Candle { time: number; open: number; high: number; low: number; close: number; volume: number; }
interface DrawingLine { id: number; type: 'horizontal' | 'trend' | 'alert'; y1: number; y2?: number; x1?: number; x2?: number; price: number; color: string; }
interface PriceAlert { id: number; price: number; direction: 'above' | 'below'; triggered: boolean; symbol: string; }
interface TradeMarker { id: number; time: number; price: number; direction: 'up' | 'down'; amount: number; candleIndex: number; }

export interface TournamentInfo { id: number; title: string; balance: number; initialBalance: number; rank: number; profit: number; endsAt?: Date; }

interface TradingViewProps {
  currentSymbol: string; activePairs: string[]; prices: Record<string, PriceData>; markets: Market[];
  activeTrades: Trade[]; onSelectSymbol: (symbol: string) => void; onRemovePair: (symbol: string) => void;
  onPlaceTrade: (direction: 'up' | 'down', amount: number, duration: number) => void;
  accountType?: 'live' | 'demo' | 'tournament'; tournamentInfo?: TournamentInfo;
}

// Indicator calculations
const calculateSMA = (data: number[], period: number): (number | null)[] => {
  return data.map((_, i) => i < period - 1 ? null : data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
};

const calculateEMA = (data: number[], period: number): (number | null)[] => {
  const result: (number | null)[] = [];
  const k = 2 / (period + 1);
  let ema: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) result.push(null);
    else if (i === period - 1) { ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period; result.push(ema); }
    else { ema = (data[i] - ema!) * k + ema!; result.push(ema); }
  }
  return result;
};

const calculateRSI = (data: number[], period: number = 14): (number | null)[] => {
  const result: (number | null)[] = [];
  const gains: number[] = [], losses: number[] = [];
  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }
  for (let i = 0; i < data.length; i++) {
    if (i < period) { result.push(null); continue; }
    const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - (100 / (1 + rs)));
  }
  return result;
};

const calculateBollingerBands = (data: number[], period: number = 20, stdDev: number = 2): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } => {
  const middle = calculateSMA(data, period);
  const upper: (number | null)[] = [], lower: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { upper.push(null); lower.push(null); continue; }
    const slice = data.slice(i - period + 1, i + 1);
    const mean = middle[i]!;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    upper.push(mean + stdDev * std);
    lower.push(mean - stdDev * std);
  }
  return { upper, middle, lower };
};

export default function TradingView({
  currentSymbol, activePairs, prices, markets, activeTrades,
  onSelectSymbol, onRemovePair, onPlaceTrade, accountType = 'demo', tournamentInfo
}: TradingViewProps) {
  const [selectedMarket, setSelectedMarket] = useState('crypto');
  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState(60);
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [timeframe, setTimeframe] = useState('1m');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [showVolume, setShowVolume] = useState(true);
  const [showAssetSidebar, setShowAssetSidebar] = useState(false);
  const [showTradesSidebar, setShowTradesSidebar] = useState(false);
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Zoom/Pan
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, offset: 0 });
  
  // Crosshair
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [crosshairData, setCrosshairData] = useState<{ price: number; time: string; candle?: Candle } | null>(null);
  
  // Drawing tools
  const [drawingMode, setDrawingMode] = useState<'none' | 'horizontal' | 'trend' | 'alert'>('none');
  const [drawings, setDrawings] = useState<DrawingLine[]>([]);
  const [tempDrawing, setTempDrawing] = useState<{ startX: number; startY: number; startPrice: number } | null>(null);
  const [drawingsLoaded, setDrawingsLoaded] = useState(false);
  
  // Price Alerts
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertDirection, setAlertDirection] = useState<'above' | 'below'>('above');
  
  // Trade Markers (puntos de entrada)
  const [tradeMarkers, setTradeMarkers] = useState<TradeMarker[]>([]);
  
  // Multi-chart / Split screen
  const [splitMode, setSplitMode] = useState<'single' | 'horizontal' | 'vertical'>('single');
  const [secondSymbol, setSecondSymbol] = useState<string | null>(null);
  const [_secondCandles, setSecondCandles] = useState<Candle[]>([]);
  
  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [compareSymbol, setCompareSymbol] = useState<string | null>(null);
  const [compareCandles, setCompareCandles] = useState<Candle[]>([]);
  
  // Replay/Backtesting
  const [replayMode, setReplayMode] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [isReplayPlaying, setIsReplayPlaying] = useState(false);
  const [historicalCandles, setHistoricalCandles] = useState<Candle[]>([]);
  
  // Indicators
  const [indicators, setIndicators] = useState({
    sma7: false, sma25: false, ema7: true, ema25: false, rsi: false, bollinger: false, showTrades: true
  });
  const [indicatorsLoaded, setIndicatorsLoaded] = useState(false);
  
  // Layouts
  const [layouts, setLayouts] = useState<{ id: number; name: string; symbol: string; timeframe: string; settings: object; is_default: boolean }[]>([]);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [layoutName, setLayoutName] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const secondCanvasRef = useRef<HTMLCanvasElement>(null);
  const volumeCanvasRef = useRef<HTMLCanvasElement>(null);
  const rsiCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartDataRef = useRef<{ adjustedMax: number; priceRange: number; chartHeight: number; padding: { top: number; right: number; bottom: number; left: number }; candleWidth: number; gap: number } | null>(null);

  const currentPrice = prices[currentSymbol];
  const payout = 85;
  const timeframes = [
    { value: '1s', label: '1s', ms: 1000 }, { value: '5s', label: '5s', ms: 5000 },
    { value: '1m', label: '1m', ms: 60000 }, { value: '5m', label: '5m', ms: 300000 },
    { value: '15m', label: '15m', ms: 900000 }, { value: '1h', label: '1H', ms: 3600000 },
    { value: '4h', label: '4H', ms: 14400000 }, { value: '1d', label: '1D', ms: 86400000 },
  ];
  const currentTfMs = timeframes.find(t => t.value === timeframe)?.ms || 60000;

  // Generate candles
  const generateCandles = useCallback((basePrice: number, count: number): Candle[] => {
    const data: Candle[] = [];
    let price = basePrice * 0.98;
    const now = Date.now();
    for (let i = count; i >= 0; i--) {
      const volatility = basePrice * 0.003;
      const trend = Math.sin(i / 10) * volatility * 0.5;
      const change = (Math.random() - 0.48) * volatility + trend;
      const open = price, close = price + change;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      data.push({ time: now - i * currentTfMs, open, high, low, close, volume: Math.random() * 1000000 + 500000 });
      price = close;
    }
    return data;
  }, [currentTfMs]);

  // Load candles from API
  useEffect(() => {
    const loadCandles = async () => {
      try {
        const res = await tradingAPI.getCandles(currentSymbol, timeframe, 100);
        const apiCandles = res.data.candles || [];
        if (apiCandles.length > 0) {
          setCandles(apiCandles);
        } else {
          // Fallback to generated candles if API returns empty
          const basePrice = currentPrice?.price || 67500;
          setCandles(generateCandles(basePrice, 100));
        }
        // Load more for replay
        const replayRes = await tradingAPI.getCandles(currentSymbol, timeframe, 500);
        setHistoricalCandles(replayRes.data.candles || generateCandles(currentPrice?.price || 67500, 500));
      } catch (err) {
        console.error('Error loading candles:', err);
        // Fallback to generated candles
        const basePrice = currentPrice?.price || 67500;
        setCandles(generateCandles(basePrice, 100));
        setHistoricalCandles(generateCandles(basePrice, 500));
      }
      setPanOffset(0);
      setZoom(1);
    };
    loadCandles();
  }, [currentSymbol, timeframe]);

  // Load drawings from API when symbol changes
  useEffect(() => {
    const loadDrawings = async () => {
      try {
        const res = await chartAPI.getDrawings(currentSymbol);
        const apiDrawings = res.data.drawings || [];
        const mappedDrawings: DrawingLine[] = apiDrawings.map((d: { id: number; type: string; data: { y1?: number; y2?: number; x1?: number; x2?: number; price?: number }; color: string }) => ({
          id: d.id,
          type: d.type as 'horizontal' | 'trend' | 'alert',
          y1: d.data.y1 || 0,
          y2: d.data.y2,
          x1: d.data.x1,
          x2: d.data.x2,
          price: d.data.price || 0,
          color: d.color
        }));
        setDrawings(mappedDrawings);
        setDrawingsLoaded(true);
      } catch (err) {
        console.error('Error loading drawings:', err);
        setDrawingsLoaded(true);
      }
    };
    loadDrawings();
  }, [currentSymbol]);

  // Load indicators from API
  useEffect(() => {
    const loadIndicators = async () => {
      try {
        const res = await chartAPI.getIndicators(currentSymbol);
        const apiIndicators = res.data.indicators || [];
        const newIndicators = { ...indicators };
        apiIndicators.forEach((ind: { name: string; enabled: boolean }) => {
          const key = ind.name.toLowerCase().replace(/[^a-z0-9]/g, '') as keyof typeof indicators;
          if (key in newIndicators) {
            newIndicators[key] = ind.enabled;
          }
        });
        setIndicators(newIndicators);
        setIndicatorsLoaded(true);
      } catch (err) {
        console.error('Error loading indicators:', err);
        setIndicatorsLoaded(true);
      }
    };
    if (!indicatorsLoaded) loadIndicators();
  }, [currentSymbol]);

  // Load layouts from API
  useEffect(() => {
    const loadLayouts = async () => {
      try {
        const res = await chartAPI.getLayouts();
        setLayouts(res.data.layouts || []);
        // Apply default layout if exists
        const defaultLayout = (res.data.layouts || []).find((l: { is_default: boolean }) => l.is_default);
        if (defaultLayout && defaultLayout.settings) {
          const settings = defaultLayout.settings as { indicators?: typeof indicators; chartType?: 'candles' | 'line'; showVolume?: boolean };
          if (settings.indicators) setIndicators(settings.indicators);
          if (settings.chartType) setChartType(settings.chartType);
          if (settings.showVolume !== undefined) setShowVolume(settings.showVolume);
        }
      } catch (err) {
        console.error('Error loading layouts:', err);
      }
    };
    loadLayouts();
  }, []);

  // Generate second chart candles
  useEffect(() => {
    if (secondSymbol && splitMode !== 'single') {
      const basePrice = prices[secondSymbol]?.price || 3500;
      setSecondCandles(generateCandles(basePrice, 100));
    }
  }, [secondSymbol, splitMode, timeframe, generateCandles, prices]);

  // Generate compare candles
  useEffect(() => {
    if (compareSymbol && compareMode) {
      const basePrice = prices[compareSymbol]?.price || 3500;
      setCompareCandles(generateCandles(basePrice, 100));
    }
  }, [compareSymbol, compareMode, timeframe, generateCandles, prices]);

  useEffect(() => {
    if (currentPrice && candles.length > 0 && !replayMode) {
      setCandles(prev => {
        const newCandles = [...prev];
        const last = newCandles[newCandles.length - 1];
        const now = Date.now();
        if (now - last.time < currentTfMs) {
          last.close = currentPrice.price;
          last.high = Math.max(last.high, currentPrice.price);
          last.low = Math.min(last.low, currentPrice.price);
        } else {
          newCandles.shift();
          newCandles.push({ time: now, open: last.close, high: currentPrice.price, low: currentPrice.price, close: currentPrice.price, volume: Math.random() * 500000 });
        }
        return newCandles;
      });
    }
  }, [currentPrice, currentTfMs, replayMode]);

  // Check price alerts
  useEffect(() => {
    if (!currentPrice) return;
    setPriceAlerts(prev => prev.map(alert => {
      if (alert.triggered || alert.symbol !== currentSymbol) return alert;
      const shouldTrigger = alert.direction === 'above' 
        ? currentPrice.price >= alert.price 
        : currentPrice.price <= alert.price;
      if (shouldTrigger) {
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Alerta de Precio - ${currentSymbol}`, {
            body: `El precio ${alert.direction === 'above' ? 'superó' : 'cayó por debajo de'} $${alert.price.toFixed(2)}`,
            icon: '/favicon.ico'
          });
        }
        return { ...alert, triggered: true };
      }
      return alert;
    }));
  }, [currentPrice, currentSymbol]);

  // Replay mode timer
  useEffect(() => {
    if (!replayMode || !isReplayPlaying) return;
    const interval = setInterval(() => {
      setReplayIndex(prev => {
        if (prev >= historicalCandles.length - 50) {
          setIsReplayPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / replaySpeed);
    return () => clearInterval(interval);
  }, [replayMode, isReplayPlaying, replaySpeed, historicalCandles.length]);

  const getVisibleCandles = useCallback(() => {
    if (replayMode) {
      return historicalCandles.slice(replayIndex, replayIndex + 50);
    }
    const visibleCount = Math.floor(50 / zoom);
    const startIdx = Math.max(0, candles.length - visibleCount - Math.floor(panOffset));
    return candles.slice(startIdx, Math.min(candles.length, startIdx + visibleCount));
  }, [candles, zoom, panOffset, replayMode, replayIndex, historicalCandles]);

  // Screenshot function
  const takeScreenshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create a temporary canvas with white background for better export
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    // Draw the original canvas
    tempCtx.drawImage(canvas, 0, 0);
    
    // Add watermark
    tempCtx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    tempCtx.font = '24px Inter';
    tempCtx.fillText(`${currentSymbol} - ${new Date().toLocaleString()}`, 20, canvas.height - 20);
    
    // Download
    const link = document.createElement('a');
    link.download = `${currentSymbol}_${timeframe}_${Date.now()}.png`;
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  }, [currentSymbol, timeframe]);

  // Add price alert
  const addPriceAlert = useCallback(() => {
    const price = parseFloat(alertPrice);
    if (isNaN(price)) return;
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    setPriceAlerts(prev => [...prev, {
      id: Date.now(),
      price,
      direction: alertDirection,
      triggered: false,
      symbol: currentSymbol
    }]);
    setShowAlertModal(false);
    setAlertPrice('');
  }, [alertPrice, alertDirection, currentSymbol]);

  // Handle trade placement with marker
  const handlePlaceTrade = useCallback((direction: 'up' | 'down', amt: number, dur: number) => {
    const visibleCandles = getVisibleCandles();
    const lastCandle = visibleCandles[visibleCandles.length - 1];
    const price = currentPrice?.price || lastCandle?.close || 0;
    
    // Add trade marker
    setTradeMarkers(prev => [...prev, {
      id: Date.now(),
      time: Date.now(),
      price,
      direction,
      amount: amt,
      candleIndex: candles.length - 1
    }]);
    
    onPlaceTrade(direction, amt, dur);
  }, [currentPrice, candles.length, getVisibleCandles, onPlaceTrade]);


  // Main chart drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2; canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    const width = rect.width, height = rect.height;
    const padding = { top: 10, right: 55, bottom: 25, left: 5 };

    ctx.fillStyle = '#0d0b14';
    ctx.fillRect(0, 0, width, height);

    const visibleCandles = getVisibleCandles();
    if (visibleCandles.length === 0) return;

    const pricesList = visibleCandles.flatMap(c => [c.high, c.low]);
    let minPrice = Math.min(...pricesList), maxPrice = Math.max(...pricesList);
    
    // Include compare data in price range
    if (compareMode && compareCandles.length > 0) {
      const comparePrices = compareCandles.flatMap(c => [c.high, c.low]);
      const compareMin = Math.min(...comparePrices);
      const compareMax = Math.max(...comparePrices);
      // Normalize compare prices to main chart range
      const mainRange = maxPrice - minPrice;
      const compareRange = compareMax - compareMin;
      if (compareRange > mainRange) {
        const diff = (compareRange - mainRange) / 2;
        minPrice -= diff;
        maxPrice += diff;
      }
    }
    
    if (indicators.bollinger) {
      const bb = calculateBollingerBands(visibleCandles.map(c => c.close));
      const upperVals = bb.upper.filter(v => v !== null) as number[];
      const lowerVals = bb.lower.filter(v => v !== null) as number[];
      if (upperVals.length) maxPrice = Math.max(maxPrice, ...upperVals);
      if (lowerVals.length) minPrice = Math.min(minPrice, ...lowerVals);
    }

    const priceRange = (maxPrice - minPrice) * 1.1 || 1;
    const adjustedMax = maxPrice + priceRange * 0.05;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const candleWidth = Math.max(3, (chartWidth / visibleCandles.length) * 0.75);
    const gap = (chartWidth / visibleCandles.length) * 0.25;

    chartDataRef.current = { adjustedMax, priceRange, chartHeight, padding, candleWidth, gap };

    // Grid
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.06)'; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 6; i++) {
      const y = padding.top + (chartHeight / 6) * i;
      ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(width - padding.right, y); ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const x = padding.left + (chartWidth / 6) * i;
      ctx.beginPath(); ctx.moveTo(x, padding.top); ctx.lineTo(x, height - padding.bottom); ctx.stroke();
    }

    // Bollinger Bands
    if (indicators.bollinger) {
      const bb = calculateBollingerBands(visibleCandles.map(c => c.close));
      const drawBBLine = (values: (number | null)[], color: string) => {
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 1;
        let started = false;
        values.forEach((val, i) => {
          if (val === null) return;
          const x = padding.left + i * (candleWidth + gap) + candleWidth / 2;
          const y = padding.top + ((adjustedMax - val) / priceRange) * chartHeight;
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        });
        ctx.stroke();
      };
      ctx.beginPath();
      let started = false;
      bb.upper.forEach((val, i) => {
        if (val === null) return;
        const x = padding.left + i * (candleWidth + gap) + candleWidth / 2;
        const y = padding.top + ((adjustedMax - val) / priceRange) * chartHeight;
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      });
      for (let i = bb.lower.length - 1; i >= 0; i--) {
        const val = bb.lower[i];
        if (val === null) continue;
        const x = padding.left + i * (candleWidth + gap) + candleWidth / 2;
        const y = padding.top + ((adjustedMax - val) / priceRange) * chartHeight;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(139, 92, 246, 0.1)'; ctx.fill();
      drawBBLine(bb.upper, '#8b5cf6');
      drawBBLine(bb.middle, '#a78bfa');
      drawBBLine(bb.lower, '#8b5cf6');
    }

    // Compare overlay
    if (compareMode && compareCandles.length > 0) {
      const visibleCompare = compareCandles.slice(0, visibleCandles.length);
      const compareMin = Math.min(...visibleCompare.map(c => c.low));
      const compareMax = Math.max(...visibleCompare.map(c => c.high));
      const compareRange = compareMax - compareMin;
      
      ctx.beginPath(); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      visibleCompare.forEach((candle, i) => {
        const x = padding.left + i * (candleWidth + gap) + candleWidth / 2;
        // Normalize to main chart scale
        const normalizedPrice = minPrice + ((candle.close - compareMin) / compareRange) * (maxPrice - minPrice);
        const y = padding.top + ((adjustedMax - normalizedPrice) / priceRange) * chartHeight;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Compare label
      ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 10px Inter';
      ctx.fillText(compareSymbol || '', padding.left + 5, padding.top + 20);
    }

    // Candles or Line
    if (chartType === 'candles') {
      visibleCandles.forEach((candle, i) => {
        const x = padding.left + i * (candleWidth + gap) + candleWidth / 2;
        const isGreen = candle.close >= candle.open;
        const yHigh = padding.top + ((adjustedMax - candle.high) / priceRange) * chartHeight;
        const yLow = padding.top + ((adjustedMax - candle.low) / priceRange) * chartHeight;
        const yOpen = padding.top + ((adjustedMax - candle.open) / priceRange) * chartHeight;
        const yClose = padding.top + ((adjustedMax - candle.close) / priceRange) * chartHeight;

        ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, yHigh); ctx.lineTo(x, yLow); ctx.stroke();

        const bodyTop = Math.min(yOpen, yClose), bodyHeight = Math.max(1, Math.abs(yClose - yOpen));
        ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        
        if (i === visibleCandles.length - 1 && !replayMode) {
          ctx.shadowColor = isGreen ? '#10b981' : '#ef4444'; ctx.shadowBlur = 10;
          ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
          ctx.shadowBlur = 0;
        }
      });
    } else {
      ctx.beginPath(); ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 2;
      visibleCandles.forEach((candle, i) => {
        const x = padding.left + i * (candleWidth + gap) + candleWidth / 2;
        const y = padding.top + ((adjustedMax - candle.close) / priceRange) * chartHeight;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      const lastX = padding.left + (visibleCandles.length - 1) * (candleWidth + gap) + candleWidth / 2;
      ctx.lineTo(lastX, height - padding.bottom);
      ctx.lineTo(padding.left + candleWidth / 2, height - padding.bottom);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)'); gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
      ctx.fillStyle = gradient; ctx.fill();
    }

    // EMA/SMA indicators
    const closePrices = visibleCandles.map(c => c.close);
    const drawLine = (values: (number | null)[], color: string) => {
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      let started = false;
      values.forEach((val, i) => {
        if (val === null) return;
        const x = padding.left + i * (candleWidth + gap) + candleWidth / 2;
        const y = padding.top + ((adjustedMax - val) / priceRange) * chartHeight;
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };
    if (indicators.sma7) drawLine(calculateSMA(closePrices, 7), '#f59e0b');
    if (indicators.sma25) drawLine(calculateSMA(closePrices, 25), '#3b82f6');
    if (indicators.ema7) drawLine(calculateEMA(closePrices, 7), '#ec4899');
    if (indicators.ema25) drawLine(calculateEMA(closePrices, 25), '#06b6d4');

    // Draw trade markers (puntos de entrada)
    tradeMarkers.forEach(marker => {
      if (marker.time < visibleCandles[0]?.time || marker.time > visibleCandles[visibleCandles.length - 1]?.time) return;
      
      const candleIdx = visibleCandles.findIndex(c => c.time >= marker.time);
      if (candleIdx === -1) return;
      
      const x = padding.left + candleIdx * (candleWidth + gap) + candleWidth / 2;
      const y = padding.top + ((adjustedMax - marker.price) / priceRange) * chartHeight;
      
      // Draw entry point circle
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = marker.direction === 'up' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      ctx.fill();
      ctx.strokeStyle = marker.direction === 'up' ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Inner circle
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = marker.direction === 'up' ? '#10b981' : '#ef4444';
      ctx.fill();
      
      // Arrow
      ctx.beginPath();
      if (marker.direction === 'up') {
        ctx.moveTo(x, y - 15); ctx.lineTo(x - 5, y - 10); ctx.lineTo(x + 5, y - 10);
      } else {
        ctx.moveTo(x, y + 15); ctx.lineTo(x - 5, y + 10); ctx.lineTo(x + 5, y + 10);
      }
      ctx.closePath();
      ctx.fillStyle = marker.direction === 'up' ? '#10b981' : '#ef4444';
      ctx.fill();
      
      // Amount label
      ctx.fillStyle = '#1a1625';
      ctx.fillRect(x - 20, y + (marker.direction === 'up' ? -35 : 20), 40, 14);
      ctx.strokeStyle = marker.direction === 'up' ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 20, y + (marker.direction === 'up' ? -35 : 20), 40, 14);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'center';
      ctx.fillText(`$${marker.amount}`, x, y + (marker.direction === 'up' ? -26 : 31));
    });

    // Draw active trade markers
    if (indicators.showTrades && activeTrades.length > 0) {
      activeTrades.forEach(trade => {
        if (trade.symbol !== currentSymbol) return;
        const yEntry = padding.top + ((adjustedMax - trade.entry_price) / priceRange) * chartHeight;
        
        ctx.strokeStyle = trade.direction === 'up' ? '#10b981' : '#ef4444';
        ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(padding.left, yEntry); ctx.lineTo(width - padding.right, yEntry); ctx.stroke();
        ctx.setLineDash([]);
        
        const markerX = width - padding.right - 60;
        ctx.fillStyle = trade.direction === 'up' ? '#10b981' : '#ef4444';
        ctx.beginPath();
        if (trade.direction === 'up') {
          ctx.moveTo(markerX, yEntry + 8); ctx.lineTo(markerX - 6, yEntry + 16); ctx.lineTo(markerX + 6, yEntry + 16);
        } else {
          ctx.moveTo(markerX, yEntry - 8); ctx.lineTo(markerX - 6, yEntry - 16); ctx.lineTo(markerX + 6, yEntry - 16);
        }
        ctx.closePath(); ctx.fill();
        
        ctx.fillStyle = '#1a1625';
        ctx.fillRect(markerX - 25, yEntry - 8, 50, 16);
        ctx.strokeStyle = trade.direction === 'up' ? '#10b981' : '#ef4444';
        ctx.strokeRect(markerX - 25, yEntry - 8, 50, 16);
        ctx.fillStyle = '#fff'; ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${trade.amount}`, markerX, yEntry + 3);
      });
    }

    // Price alerts lines
    priceAlerts.filter(a => a.symbol === currentSymbol && !a.triggered).forEach(alert => {
      const yAlert = padding.top + ((adjustedMax - alert.price) / priceRange) * chartHeight;
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(padding.left, yAlert); ctx.lineTo(width - padding.right, yAlert); ctx.stroke();
      ctx.setLineDash([]);
      
      // Bell icon area
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(width - padding.right, yAlert - 8, 52, 16);
      ctx.fillStyle = '#000'; ctx.font = '9px Inter'; ctx.textAlign = 'left';
      ctx.fillText(`🔔 ${alert.price.toFixed(2)}`, width - padding.right + 3, yAlert + 3);
    });

    // Drawing lines
    drawings.forEach(line => {
      const yLine = padding.top + ((adjustedMax - line.price) / priceRange) * chartHeight;
      ctx.strokeStyle = line.color; ctx.lineWidth = 1.5;
      if (line.type === 'horizontal' || line.type === 'alert') {
        ctx.setLineDash([8, 4]);
        ctx.beginPath(); ctx.moveTo(padding.left, yLine); ctx.lineTo(width - padding.right, yLine); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = line.color;
        ctx.fillRect(width - padding.right, yLine - 8, 52, 16);
        ctx.fillStyle = '#fff'; ctx.font = '9px Inter'; ctx.textAlign = 'left';
        ctx.fillText(line.price.toFixed(2), width - padding.right + 3, yLine + 3);
      }
    });

    // Price labels
    ctx.fillStyle = '#71717a'; ctx.font = '9px Inter'; ctx.textAlign = 'left';
    for (let i = 0; i <= 5; i++) {
      const price = adjustedMax - (priceRange / 5) * i;
      const y = padding.top + (chartHeight / 5) * i;
      ctx.fillText(price.toFixed(price < 10 ? 4 : 2), width - padding.right + 3, y + 3);
    }

    // Time labels
    ctx.textAlign = 'center';
    const timeStep = Math.floor(visibleCandles.length / 5);
    for (let i = 0; i < visibleCandles.length; i += timeStep) {
      const candle = visibleCandles[i];
      const x = padding.left + i * (candleWidth + gap) + candleWidth / 2;
      const date = new Date(candle.time);
      const label = timeframe.includes('d') || timeframe.includes('h') 
        ? `${date.getDate()}/${date.getMonth() + 1}` : `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      ctx.fillText(label, x, height - 5);
    }

    // Current price line
    if (currentPrice && !replayMode) {
      const yPrice = padding.top + ((adjustedMax - currentPrice.price) / priceRange) * chartHeight;
      ctx.strokeStyle = currentPrice.change_24h >= 0 ? '#10b981' : '#ef4444';
      ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(padding.left, yPrice); ctx.lineTo(width - padding.right, yPrice); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = currentPrice.change_24h >= 0 ? '#10b981' : '#ef4444';
      ctx.fillRect(width - padding.right, yPrice - 8, 52, 16);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Inter'; ctx.textAlign = 'left';
      ctx.fillText(currentPrice.price.toFixed(currentPrice.price < 10 ? 4 : 2), width - padding.right + 3, yPrice + 3);
    }

    // Crosshair
    if (mousePos && mousePos.x > padding.left && mousePos.x < width - padding.right && drawingMode === 'none') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(mousePos.x, padding.top); ctx.lineTo(mousePos.x, height - padding.bottom); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padding.left, mousePos.y); ctx.lineTo(width - padding.right, mousePos.y); ctx.stroke();
      ctx.setLineDash([]);
      const cursorPrice = adjustedMax - ((mousePos.y - padding.top) / chartHeight) * priceRange;
      ctx.fillStyle = '#6366f1'; ctx.fillRect(width - padding.right, mousePos.y - 8, 52, 16);
      ctx.fillStyle = '#fff'; ctx.font = '9px Inter';
      ctx.fillText(cursorPrice.toFixed(cursorPrice < 10 ? 4 : 2), width - padding.right + 3, mousePos.y + 3);
      const candleIdx = Math.floor((mousePos.x - padding.left) / (candleWidth + gap));
      if (candleIdx >= 0 && candleIdx < visibleCandles.length) {
        const candle = visibleCandles[candleIdx];
        const date = new Date(candle.time);
        setCrosshairData({ price: cursorPrice, time: `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`, candle });
      }
    }

    // Replay mode indicator
    if (replayMode) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(0, 0, width, 25);
      ctx.fillStyle = '#ef4444'; ctx.font = 'bold 11px Inter'; ctx.textAlign = 'center';
      ctx.fillText(`⏪ MODO REPLAY - ${Math.round((replayIndex / historicalCandles.length) * 100)}%`, width / 2, 16);
    }

    // Volume
    const volumeCanvas = volumeCanvasRef.current;
    if (volumeCanvas && showVolume) {
      const vCtx = volumeCanvas.getContext('2d');
      if (vCtx) {
        const vRect = volumeCanvas.getBoundingClientRect();
        volumeCanvas.width = vRect.width * 2; volumeCanvas.height = vRect.height * 2;
        vCtx.scale(2, 2);
        vCtx.fillStyle = '#0d0b14'; vCtx.fillRect(0, 0, vRect.width, vRect.height);
        const maxVol = Math.max(...visibleCandles.map(c => c.volume));
        visibleCandles.forEach((candle, i) => {
          const x = padding.left + i * (candleWidth + gap);
          const h = (candle.volume / maxVol) * (vRect.height - 4);
          vCtx.fillStyle = candle.close >= candle.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)';
          vCtx.fillRect(x, vRect.height - h, candleWidth, h);
        });
      }
    }

    // RSI
    const rsiCanvas = rsiCanvasRef.current;
    if (rsiCanvas && indicators.rsi) {
      const rCtx = rsiCanvas.getContext('2d');
      if (rCtx) {
        const rRect = rsiCanvas.getBoundingClientRect();
        rsiCanvas.width = rRect.width * 2; rsiCanvas.height = rRect.height * 2;
        rCtx.scale(2, 2);
        rCtx.fillStyle = '#0d0b14'; rCtx.fillRect(0, 0, rRect.width, rRect.height);
        
        const h70 = rRect.height * 0.3, h30 = rRect.height * 0.7;
        rCtx.fillStyle = 'rgba(239, 68, 68, 0.1)'; rCtx.fillRect(padding.left, 0, rRect.width - padding.left - padding.right, h70);
        rCtx.fillStyle = 'rgba(16, 185, 129, 0.1)'; rCtx.fillRect(padding.left, h30, rRect.width - padding.left - padding.right, rRect.height - h30);
        
        rCtx.strokeStyle = 'rgba(255,255,255,0.1)'; rCtx.lineWidth = 0.5;
        [h70, rRect.height * 0.5, h30].forEach(y => {
          rCtx.beginPath(); rCtx.moveTo(padding.left, y); rCtx.lineTo(rRect.width - padding.right, y); rCtx.stroke();
        });
        
        const rsiValues = calculateRSI(closePrices);
        rCtx.beginPath(); rCtx.strokeStyle = '#f59e0b'; rCtx.lineWidth = 1.5;
        let started = false;
        rsiValues.forEach((val, i) => {
          if (val === null) return;
          const x = padding.left + i * (candleWidth + gap) + candleWidth / 2;
          const y = rRect.height - (val / 100) * rRect.height;
          if (!started) { rCtx.moveTo(x, y); started = true; } else rCtx.lineTo(x, y);
        });
        rCtx.stroke();
        
        rCtx.fillStyle = '#71717a'; rCtx.font = '8px Inter'; rCtx.textAlign = 'left';
        rCtx.fillText('70', rRect.width - padding.right + 3, h70 + 3);
        rCtx.fillText('30', rRect.width - padding.right + 3, h30 + 3);
        rCtx.fillText('RSI', 8, 12);
      }
    }
  }, [candles, currentPrice, showVolume, chartType, indicators, mousePos, zoom, panOffset, getVisibleCandles, timeframe, drawings, activeTrades, currentSymbol, drawingMode, priceAlerts, tradeMarkers, replayMode, replayIndex, historicalCandles.length, compareMode, compareCandles, compareSymbol]);


  // Mouse handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    setMousePos({ x, y });
    if (isDragging && drawingMode === 'none') {
      const dx = e.clientX - dragStart.x;
      setPanOffset(Math.max(0, Math.min(candles.length - 20, dragStart.offset + dx / 10)));
    }
  }, [isDragging, dragStart, candles.length, drawingMode]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !chartDataRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const { adjustedMax, priceRange, chartHeight, padding } = chartDataRef.current;
    
    if (drawingMode === 'horizontal') {
      const price = adjustedMax - ((y - padding.top) / chartHeight) * priceRange;
      const newDrawing: DrawingLine = { id: Date.now(), type: 'horizontal', y1: y, price, color: '#f59e0b' };
      setDrawings(prev => [...prev, newDrawing]);
      saveDrawing(newDrawing);
      setDrawingMode('none');
    } else if (drawingMode === 'alert') {
      const price = adjustedMax - ((y - padding.top) / chartHeight) * priceRange;
      setAlertPrice(price.toFixed(2));
      setShowAlertModal(true);
      setDrawingMode('none');
    } else if (drawingMode === 'trend') {
      const price = adjustedMax - ((y - padding.top) / chartHeight) * priceRange;
      setTempDrawing({ startX: e.clientX - rect.left, startY: y, startPrice: price });
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX, offset: panOffset });
    }
  }, [panOffset, drawingMode, currentSymbol]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (tempDrawing) setTempDrawing(null);
  }, [tempDrawing]);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null); setCrosshairData(null); setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(3, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const clearDrawings = async () => {
    try {
      await chartAPI.clearDrawings(currentSymbol);
      setDrawings([]);
    } catch (err) {
      console.error('Error clearing drawings:', err);
      setDrawings([]);
    }
  };

  // Save drawing to API
  const saveDrawing = async (drawing: DrawingLine) => {
    try {
      const res = await chartAPI.createDrawing({
        symbol: currentSymbol,
        type: drawing.type,
        data: { y1: drawing.y1, y2: drawing.y2, x1: drawing.x1, x2: drawing.x2, price: drawing.price },
        color: drawing.color
      });
      return res.data.drawing?.id || drawing.id;
    } catch (err) {
      console.error('Error saving drawing:', err);
      return drawing.id;
    }
  };

  // Save indicator to API
  const saveIndicatorToAPI = async (name: string, enabled: boolean) => {
    try {
      await chartAPI.saveIndicator({
        symbol: currentSymbol,
        name,
        settings: {},
        enabled
      });
    } catch (err) {
      console.error('Error saving indicator:', err);
    }
  };

  // Save layout
  const saveLayout = async () => {
    if (!layoutName.trim()) return;
    try {
      await chartAPI.saveLayout({
        name: layoutName,
        symbol: currentSymbol,
        timeframe,
        settings: { indicators, chartType, showVolume, zoom },
        is_default: false
      });
      const res = await chartAPI.getLayouts();
      setLayouts(res.data.layouts || []);
      setLayoutName('');
      setShowLayoutMenu(false);
    } catch (err) {
      console.error('Error saving layout:', err);
    }
  };

  // Load layout
  const loadLayout = async (layout: { id: number; name: string; symbol: string; timeframe: string; settings: object; is_default: boolean }) => {
    const settings = layout.settings as { indicators?: typeof indicators; chartType?: 'candles' | 'line'; showVolume?: boolean; zoom?: number };
    if (settings.indicators) setIndicators(settings.indicators);
    if (settings.chartType) setChartType(settings.chartType);
    if (settings.showVolume !== undefined) setShowVolume(settings.showVolume);
    if (settings.zoom) setZoom(settings.zoom);
    if (layout.timeframe) setTimeframe(layout.timeframe);
    setShowLayoutMenu(false);
  };

  // Delete layout
  const deleteLayout = async (id: number) => {
    try {
      await chartAPI.deleteLayout(id);
      setLayouts(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Error deleting layout:', err);
    }
  };

  const toggleIndicator = (key: keyof typeof indicators) => {
    const newValue = !indicators[key];
    setIndicators(prev => ({ ...prev, [key]: newValue }));
    saveIndicatorToAPI(key, newValue);
  };

  const marketAssets = markets.find(m => m.id === selectedMarket)?.pairs || ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT', 'DOGE/USDT', 'DOT/USDT'];
  const priceChange = currentPrice?.change_24h || 0;
  const isPositive = priceChange >= 0;

  // Toggle split mode
  const toggleSplitMode = () => {
    if (splitMode === 'single') {
      setSplitMode('horizontal');
      if (!secondSymbol) setSecondSymbol(marketAssets.find(s => s !== currentSymbol) || 'ETH/USDT');
    } else if (splitMode === 'horizontal') {
      setSplitMode('vertical');
    } else {
      setSplitMode('single');
      setSecondSymbol(null);
    }
  };

  // Toggle compare mode
  const toggleCompareMode = () => {
    if (compareMode) {
      setCompareMode(false);
      setCompareSymbol(null);
    } else {
      setCompareMode(true);
      setCompareSymbol(marketAssets.find(s => s !== currentSymbol) || 'ETH/USDT');
    }
  };

  // Toggle replay mode
  const toggleReplayMode = () => {
    if (replayMode) {
      setReplayMode(false);
      setIsReplayPlaying(false);
      setReplayIndex(0);
    } else {
      setReplayMode(true);
      setReplayIndex(0);
    }
  };

  return (
    <div ref={containerRef} className={`flex flex-col md:flex-row h-full bg-[#0d0b14] relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setShowAlertModal(false)}>
          <div className="bg-[#1a1625] rounded-xl p-4 w-80 border border-purple-900/30" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-yellow-400" />Nueva Alerta de Precio</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Precio</label>
                <input type="number" value={alertPrice} onChange={e => setAlertPrice(e.target.value)} className="w-full bg-[#0d0b14] border border-purple-900/30 rounded px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Condición</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setAlertDirection('above')} className={`py-2 rounded text-xs font-medium ${alertDirection === 'above' ? 'bg-emerald-600 text-white' : 'bg-[#0d0b14] text-gray-400'}`}>↑ Por encima</button>
                  <button onClick={() => setAlertDirection('below')} className={`py-2 rounded text-xs font-medium ${alertDirection === 'below' ? 'bg-red-600 text-white' : 'bg-[#0d0b14] text-gray-400'}`}>↓ Por debajo</button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowAlertModal(false)} className="flex-1 py-2 bg-[#0d0b14] rounded text-sm text-gray-400">Cancelar</button>
                <button onClick={addPriceAlert} className="flex-1 py-2 bg-purple-600 rounded text-sm font-medium">Crear Alerta</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Symbol Selector */}
      {compareMode && (
        <div className="absolute top-20 left-4 bg-[#1a1625] border border-purple-900/30 rounded-lg p-2 z-40">
          <div className="text-[10px] text-gray-500 mb-1">Comparar con:</div>
          <select value={compareSymbol || ''} onChange={e => setCompareSymbol(e.target.value)} className="bg-[#0d0b14] border border-purple-900/30 rounded px-2 py-1 text-xs">
            {marketAssets.filter(s => s !== currentSymbol).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {/* Mobile Drawers */}
      {showAssetSidebar && (
        <div className="md:hidden fixed inset-0 bg-black/80 z-50" onClick={() => setShowAssetSidebar(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#13111c]" onClick={e => e.stopPropagation()}>
            <div className="p-3 border-b border-purple-900/20 flex justify-between items-center">
              <span className="font-bold text-sm">Activos</span>
              <button onClick={() => setShowAssetSidebar(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-2 gap-1 mb-2">
                {[{ id: 'crypto', label: '₿ Cripto' }, { id: 'forex', label: '💱 Forex' }].map(m => (
                  <button key={m.id} onClick={() => setSelectedMarket(m.id)} className={`px-2 py-1.5 rounded text-[10px] font-medium ${selectedMarket === m.id ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}>{m.label}</button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-100px)]">
              {marketAssets.map(symbol => {
                const price = prices[symbol]; const change = price?.change_24h || 0;
                return (
                  <div key={symbol} onClick={() => { onSelectSymbol(symbol); setShowAssetSidebar(false); }} className={`flex justify-between items-center px-3 py-2.5 border-b border-purple-900/10 ${currentSymbol === symbol ? 'bg-purple-600/15' : ''}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-[#1a1625] flex items-center justify-center text-xs font-bold">{symbol.charAt(0)}</div>
                      <div><div className="font-medium text-sm">{symbol}</div><div className="text-[10px] text-purple-400">{payout}%</div></div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">${price?.price?.toFixed(2) || '0.00'}</div>
                      <div className={`text-[10px] ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{change >= 0 ? '+' : ''}{change.toFixed(2)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showTradesSidebar && (
        <div className="md:hidden fixed inset-0 bg-black/80 z-50" onClick={() => setShowTradesSidebar(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-[#13111c]" onClick={e => e.stopPropagation()}>
            <div className="p-3 border-b border-purple-900/20 flex justify-between items-center">
              <span className="font-bold text-sm flex items-center gap-2"><Zap className="w-4 h-4 text-purple-400" />Operaciones ({activeTrades.length})</span>
              <button onClick={() => setShowTradesSidebar(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-2 overflow-y-auto h-[calc(100%-60px)]">
              {activeTrades.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40"><Activity className="w-10 h-10 text-gray-600 mb-2" /><p className="text-gray-500 text-sm">No hay operaciones</p></div>
              ) : (
                <div className="space-y-2">{activeTrades.map(t => <TradeCard key={t.id} trade={t} currentPrice={currentPrice?.price} />)}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Asset Sidebar */}
      {!isFullscreen && (
        <div className="hidden md:flex w-48 lg:w-52 bg-[#13111c] border-r border-purple-900/20 flex-col flex-shrink-0">
          <div className="p-1.5 border-b border-purple-900/20">
            <div className="grid grid-cols-2 gap-1">
              {[{ id: 'crypto', label: '₿ Cripto' }, { id: 'forex', label: '💱 Forex' }, { id: 'commodities', label: '🥇 Materias' }, { id: 'stocks', label: '📈 Acciones' }].map(m => (
                <button key={m.id} onClick={() => setSelectedMarket(m.id)} className={`px-2 py-1.5 rounded text-[10px] font-medium ${selectedMarket === m.id ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' : 'bg-[#1a1625] text-gray-400 hover:text-white'}`}>{m.label}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {marketAssets.map((symbol, idx) => {
              const price = prices[symbol]; const change = price?.change_24h || (Math.random() - 0.5) * 10;
              const isSelected = currentSymbol === symbol;
              return (
                <div key={symbol} onClick={() => onSelectSymbol(symbol)} className={`flex justify-between items-center px-2 py-2 cursor-pointer border-b border-purple-900/10 ${isSelected ? 'bg-purple-600/15 border-l-2 border-l-purple-500' : 'hover:bg-[#1a1625]'}`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${isSelected ? 'bg-purple-600/30 text-purple-300' : 'bg-[#1a1625] text-gray-400'}`}>{symbol.charAt(0)}</div>
                    <div>
                      <div className="font-medium text-[11px] flex items-center gap-1">{symbol}{idx < 3 && <Flame className="w-2.5 h-2.5 text-orange-400" />}</div>
                      <div className="text-[9px] text-purple-400">{payout}%</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[11px]">${price?.price?.toFixed(price?.price < 1 ? 4 : 2) || '0.00'}</div>
                    <div className={`text-[9px] flex items-center justify-end ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{change >= 0 ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}{Math.abs(change).toFixed(2)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-2 py-1.5 bg-[#13111c] border-b border-purple-900/20">
          <button onClick={() => setShowAssetSidebar(true)} className="p-1.5 bg-[#1a1625] rounded"><Menu className="w-4 h-4" /></button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{currentSymbol}</span>
            <span className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>${currentPrice?.price?.toFixed(2) || '0'}</span>
          </div>
          <button onClick={() => setShowTradesSidebar(true)} className="p-1.5 bg-[#1a1625] rounded relative">
            <Zap className="w-4 h-4 text-purple-400" />
            {activeTrades.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center">{activeTrades.length}</span>}
          </button>
        </div>

        {/* Desktop Tabs */}
        {!isFullscreen && (
          <div className="hidden md:flex items-center gap-1 px-2 py-1.5 bg-[#13111c] border-b border-purple-900/20 overflow-x-auto">
            {activePairs.map(symbol => {
              const price = prices[symbol]; const isActive = currentSymbol === symbol;
              return (
                <div key={symbol} onClick={() => onSelectSymbol(symbol)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded cursor-pointer text-[11px] ${isActive ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400 hover:text-white'}`}>
                  <span className="font-medium">{symbol}</span>
                  <span className="opacity-70">${price?.price?.toFixed(2) || '0'}</span>
                  {activePairs.length > 1 && <button onClick={e => { e.stopPropagation(); onRemovePair(symbol); }} className="hover:text-red-400"><X className="w-2.5 h-2.5" /></button>}
                </div>
              );
            })}
            <button className="p-1 bg-[#1a1625] rounded hover:bg-purple-600/20"><Plus className="w-3 h-3 text-gray-400" /></button>
          </div>
        )}

        {/* Chart Header */}
        <div className="flex flex-wrap justify-between items-center px-2 md:px-3 py-1.5 bg-[#13111c]/80 border-b border-purple-900/20 gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            {accountType === 'tournament' && tournamentInfo && (
              <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <Trophy className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="text-[10px] font-bold text-purple-400">{tournamentInfo.title}</div>
                  <div className="text-[8px] text-gray-400">Rank #{tournamentInfo.rank} • ${tournamentInfo.balance.toFixed(0)}</div>
                </div>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center border bg-purple-600/20 border-purple-500/30">
                <span className="text-xs md:text-sm font-bold text-purple-400">{currentSymbol.charAt(0)}</span>
              </div>
              <div>
                <div className="flex items-center gap-1"><span className="text-xs md:text-sm font-bold">{currentSymbol}</span><Star className="w-3 h-3 text-yellow-400" /></div>
                <div className="text-[9px] md:text-[10px] text-purple-400">{payout}% payout</div>
              </div>
            </div>
            <div>
              <div className="text-lg md:text-xl font-bold">${currentPrice?.price?.toFixed(currentPrice?.price < 1 ? 4 : 2) || '67,543.21'}</div>
              <div className={`flex items-center gap-0.5 text-[10px] md:text-[11px] ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{isPositive ? '+' : ''}{priceChange.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Chart Type */}
            <div className="hidden sm:flex bg-[#1a1625] rounded p-0.5">
              {[{ type: 'candles' as const, icon: BarChart2 }, { type: 'line' as const, icon: Activity }].map(({ type, icon: Icon }) => (
                <button key={type} onClick={() => setChartType(type)} className={`p-1 rounded ${chartType === type ? 'bg-purple-600 text-white' : 'text-gray-400'}`}><Icon className="w-3.5 h-3.5" /></button>
              ))}
            </div>

            {/* Timeframes */}
            <div className="flex bg-[#1a1625] rounded p-0.5 overflow-x-auto">
              {timeframes.map(tf => (
                <button key={tf.value} onClick={() => setTimeframe(tf.value)} className={`px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-medium ${timeframe === tf.value ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>{tf.label}</button>
              ))}
            </div>

            {/* Drawing Tools */}
            <div className="hidden sm:flex bg-[#1a1625] rounded p-0.5 gap-0.5">
              <button onClick={() => setDrawingMode('none')} className={`p-1 rounded ${drawingMode === 'none' ? 'bg-purple-600 text-white' : 'text-gray-400'}`} title="Seleccionar"><MousePointer className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDrawingMode('horizontal')} className={`p-1 rounded ${drawingMode === 'horizontal' ? 'bg-purple-600 text-white' : 'text-gray-400'}`} title="Línea horizontal"><Minus className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDrawingMode('trend')} className={`p-1 rounded ${drawingMode === 'trend' ? 'bg-purple-600 text-white' : 'text-gray-400'}`} title="Línea de tendencia"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => setDrawingMode('alert')} className={`p-1 rounded ${drawingMode === 'alert' ? 'bg-yellow-600 text-white' : 'text-gray-400'}`} title="Alerta de precio"><Bell className="w-3.5 h-3.5" /></button>
              {drawings.length > 0 && <button onClick={clearDrawings} className="p-1 rounded text-red-400 hover:bg-red-500/20" title="Borrar líneas"><X className="w-3.5 h-3.5" /></button>}
            </div>

            {/* Advanced Tools */}
            <div className="hidden md:flex bg-[#1a1625] rounded p-0.5 gap-0.5">
              <button onClick={takeScreenshot} className="p-1 rounded text-gray-400 hover:text-white" title="Captura de pantalla"><Camera className="w-3.5 h-3.5" /></button>
              <button onClick={toggleSplitMode} className={`p-1 rounded ${splitMode !== 'single' ? 'bg-purple-600 text-white' : 'text-gray-400'}`} title="Multi-gráfico"><Columns className="w-3.5 h-3.5" /></button>
              <button onClick={toggleCompareMode} className={`p-1 rounded ${compareMode ? 'bg-orange-600 text-white' : 'text-gray-400'}`} title="Comparar activos"><GitCompare className="w-3.5 h-3.5" /></button>
              <button onClick={toggleReplayMode} className={`p-1 rounded ${replayMode ? 'bg-red-600 text-white' : 'text-gray-400'}`} title="Modo Replay"><Play className="w-3.5 h-3.5" /></button>
            </div>

            {/* Replay Controls */}
            {replayMode && (
              <div className="hidden md:flex items-center gap-1 bg-[#1a1625] rounded p-0.5">
                <button onClick={() => setReplayIndex(Math.max(0, replayIndex - 10))} className="p-1 rounded text-gray-400 hover:text-white"><SkipBack className="w-3.5 h-3.5" /></button>
                <button onClick={() => setIsReplayPlaying(!isReplayPlaying)} className={`p-1 rounded ${isReplayPlaying ? 'bg-red-600 text-white' : 'text-gray-400'}`}>
                  {isReplayPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setReplayIndex(Math.min(historicalCandles.length - 50, replayIndex + 10))} className="p-1 rounded text-gray-400 hover:text-white"><SkipForward className="w-3.5 h-3.5" /></button>
                <select value={replaySpeed} onChange={e => setReplaySpeed(Number(e.target.value))} className="bg-[#0d0b14] text-[9px] rounded px-1 py-0.5">
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={5}>5x</option>
                </select>
              </div>
            )}

            {/* Indicators */}
            <div className="relative">
              <button onClick={() => setShowIndicatorMenu(!showIndicatorMenu)} className={`p-1 rounded ${Object.values(indicators).some(v => v) ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400'}`}>
                <Settings className="w-3.5 h-3.5" />
              </button>
              {showIndicatorMenu && (
                <div className="absolute right-0 top-full mt-1 bg-[#1a1625] border border-purple-900/30 rounded-lg p-2 z-50 min-w-[160px]" onClick={e => e.stopPropagation()}>
                  <div className="text-[10px] text-gray-500 mb-2">Indicadores</div>
                  {[
                    { key: 'ema7' as const, label: 'EMA 7', color: '#ec4899' },
                    { key: 'ema25' as const, label: 'EMA 25', color: '#06b6d4' },
                    { key: 'sma7' as const, label: 'SMA 7', color: '#f59e0b' },
                    { key: 'sma25' as const, label: 'SMA 25', color: '#3b82f6' },
                    { key: 'bollinger' as const, label: 'Bollinger', color: '#8b5cf6' },
                    { key: 'rsi' as const, label: 'RSI (14)', color: '#f59e0b' },
                    { key: 'showTrades' as const, label: 'Mostrar Trades', color: '#10b981' },
                  ].map(ind => (
                    <button key={ind.key} onClick={() => toggleIndicator(ind.key)} className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-[#252040] text-left">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: indicators[ind.key] ? ind.color : '#374151' }} />
                      <span className={`text-[11px] ${indicators[ind.key] ? 'text-white' : 'text-gray-400'}`}>{ind.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Layouts */}
            <div className="relative hidden sm:block">
              <button onClick={() => setShowLayoutMenu(!showLayoutMenu)} className="p-1 rounded text-gray-400 hover:text-white" title="Layouts">
                <Columns className="w-3.5 h-3.5" />
              </button>
              {showLayoutMenu && (
                <div className="absolute right-0 top-full mt-1 bg-[#1a1625] border border-purple-900/30 rounded-lg p-2 z-50 min-w-[180px]" onClick={e => e.stopPropagation()}>
                  <div className="text-[10px] text-gray-500 mb-2">Layouts Guardados</div>
                  {layouts.length === 0 ? (
                    <div className="text-[10px] text-gray-500 py-2 text-center">No hay layouts</div>
                  ) : (
                    <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                      {layouts.map(layout => (
                        <div key={layout.id} className="flex items-center justify-between px-2 py-1 rounded hover:bg-[#252040] group">
                          <button onClick={() => loadLayout(layout)} className="text-[11px] text-white flex-1 text-left">{layout.name}</button>
                          <button onClick={() => deleteLayout(layout.id)} className="text-red-400 opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-purple-900/20 pt-2 mt-2">
                    <div className="text-[10px] text-gray-500 mb-1">Guardar actual</div>
                    <div className="flex gap-1">
                      <input type="text" value={layoutName} onChange={e => setLayoutName(e.target.value)} placeholder="Nombre..." className="flex-1 bg-[#0d0b14] border border-purple-900/30 rounded px-2 py-1 text-[10px]" />
                      <button onClick={saveLayout} disabled={!layoutName.trim()} className="px-2 py-1 bg-purple-600 rounded text-[10px] disabled:opacity-50">Guardar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Zoom */}
            <div className="hidden sm:flex items-center gap-0.5 bg-[#1a1625] rounded p-0.5">
              <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))} className="p-1 rounded text-gray-400 hover:text-white"><ZoomOut className="w-3.5 h-3.5" /></button>
              <span className="text-[9px] text-gray-500 px-1">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(prev => Math.min(3, prev + 0.25))} className="p-1 rounded text-gray-400 hover:text-white"><ZoomIn className="w-3.5 h-3.5" /></button>
            </div>

            <button onClick={() => setShowVolume(!showVolume)} className={`hidden sm:block p-1 rounded ${showVolume ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400'}`}><Volume2 className="w-3.5 h-3.5" /></button>
            <button onClick={toggleFullscreen} className="p-1 rounded text-gray-400 hover:text-white"><Maximize2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* OHLC Info */}
        {crosshairData?.candle && (
          <div className="absolute top-24 left-4 bg-[#1a1625]/95 border border-purple-900/30 rounded-lg p-2 z-40 text-[10px]">
            <div className="text-gray-400 mb-1">{crosshairData.time}</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              <span className="text-gray-500">O:</span><span className="text-white">{crosshairData.candle.open.toFixed(2)}</span>
              <span className="text-gray-500">H:</span><span className="text-emerald-400">{crosshairData.candle.high.toFixed(2)}</span>
              <span className="text-gray-500">L:</span><span className="text-red-400">{crosshairData.candle.low.toFixed(2)}</span>
              <span className="text-gray-500">C:</span><span className="text-white">{crosshairData.candle.close.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Indicator Legend */}
        {(indicators.ema7 || indicators.ema25 || indicators.sma7 || indicators.sma25 || indicators.bollinger) && (
          <div className="absolute top-24 right-16 flex gap-2 z-40 flex-wrap">
            {indicators.ema7 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a1625]/90" style={{ color: '#ec4899' }}>EMA 7</span>}
            {indicators.ema25 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a1625]/90" style={{ color: '#06b6d4' }}>EMA 25</span>}
            {indicators.sma7 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a1625]/90" style={{ color: '#f59e0b' }}>SMA 7</span>}
            {indicators.sma25 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a1625]/90" style={{ color: '#3b82f6' }}>SMA 25</span>}
            {indicators.bollinger && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a1625]/90" style={{ color: '#8b5cf6' }}>BB(20,2)</span>}
          </div>
        )}

        {/* Drawing Mode Indicator */}
        {drawingMode !== 'none' && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-xs z-40 flex items-center gap-2">
            {drawingMode === 'horizontal' && <><Minus className="w-3 h-3" />Click para línea horizontal</>}
            {drawingMode === 'trend' && <><Pencil className="w-3 h-3" />Click y arrastra para tendencia</>}
            {drawingMode === 'alert' && <><Bell className="w-3 h-3" />Click para crear alerta</>}
          </div>
        )}

        {/* Price Alerts List */}
        {priceAlerts.filter(a => a.symbol === currentSymbol).length > 0 && (
          <div className="absolute top-24 right-4 bg-[#1a1625]/95 border border-purple-900/30 rounded-lg p-2 z-40 max-w-[150px]">
            <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1"><Bell className="w-3 h-3" />Alertas</div>
            {priceAlerts.filter(a => a.symbol === currentSymbol).map(alert => (
              <div key={alert.id} className={`flex items-center justify-between text-[9px] py-0.5 ${alert.triggered ? 'text-gray-500 line-through' : 'text-white'}`}>
                <span>{alert.direction === 'above' ? '↑' : '↓'} ${alert.price.toFixed(2)}</span>
                <button onClick={() => setPriceAlerts(prev => prev.filter(a => a.id !== alert.id))} className="text-red-400 hover:text-red-300"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}

        {/* Chart Area */}
        <div className={`flex-1 relative ${splitMode === 'horizontal' ? 'flex' : splitMode === 'vertical' ? 'flex flex-col' : ''}`} style={{ minHeight: '200px' }}>
          {/* Main Chart */}
          <div className={`${splitMode !== 'single' ? (splitMode === 'horizontal' ? 'w-1/2' : 'h-1/2') : 'w-full h-full'} relative`}>
            <div className={`absolute inset-0 p-1 md:p-2 ${showVolume && splitMode === 'single' ? 'pb-10 md:pb-14' : ''} ${indicators.rsi && splitMode === 'single' ? 'pb-20 md:pb-28' : ''}`}>
              <div className="h-full bg-[#0d0b14] rounded-lg border border-purple-900/20 overflow-hidden relative">
                <canvas ref={canvasRef} className={`w-full h-full ${drawingMode !== 'none' ? 'cursor-crosshair' : 'cursor-crosshair'}`}
                  onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave} onWheel={handleWheel} />
                <div className="absolute top-1 right-1 md:top-2 md:right-2 flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${replayMode ? 'bg-red-400' : 'bg-emerald-400'}`} />
                  <span className="text-[8px] md:text-[9px] text-gray-500">{replayMode ? 'Replay' : 'En vivo'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Second Chart (Split Mode) */}
          {splitMode !== 'single' && secondSymbol && (
            <div className={`${splitMode === 'horizontal' ? 'w-1/2 border-l' : 'h-1/2 border-t'} border-purple-900/20 relative`}>
              <div className="absolute inset-0 p-1 md:p-2">
                <div className="h-full bg-[#0d0b14] rounded-lg border border-purple-900/20 overflow-hidden relative">
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                    <select value={secondSymbol} onChange={e => setSecondSymbol(e.target.value)} className="bg-[#1a1625] text-[10px] rounded px-2 py-1 border border-purple-900/30">
                      {marketAssets.filter(s => s !== currentSymbol).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="text-[10px] text-gray-400">${prices[secondSymbol]?.price?.toFixed(2) || '0'}</span>
                  </div>
                  <canvas ref={secondCanvasRef} className="w-full h-full" />
                </div>
              </div>
            </div>
          )}
          
          {/* Volume Panel */}
          {showVolume && splitMode === 'single' && (
            <div className={`absolute ${indicators.rsi ? 'bottom-12 md:bottom-16' : 'bottom-0'} left-0 right-0 h-8 md:h-12 px-1 md:px-2 pb-1 md:pb-2`}>
              <div className="h-full bg-[#0d0b14] rounded border border-purple-900/20 overflow-hidden">
                <canvas ref={volumeCanvasRef} className="w-full h-full" />
              </div>
            </div>
          )}
          
          {/* RSI Panel */}
          {indicators.rsi && splitMode === 'single' && (
            <div className="absolute bottom-0 left-0 right-0 h-10 md:h-14 px-1 md:px-2 pb-1 md:pb-2">
              <div className="h-full bg-[#0d0b14] rounded border border-purple-900/20 overflow-hidden">
                <canvas ref={rsiCanvasRef} className="w-full h-full" />
              </div>
            </div>
          )}
        </div>


        {/* Trading Panel */}
        {!isFullscreen && !replayMode && (
          <div className="bg-[#13111c] border-t border-purple-900/20 p-2 md:p-2.5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <label className="text-[8px] md:text-[9px] text-gray-500 mb-0.5 block">Inversión</label>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setAmount(Math.max(1, amount - 10))} className="w-6 h-6 md:w-7 md:h-7 bg-[#1a1625] rounded flex items-center justify-center hover:bg-red-500/20 text-sm font-bold">−</button>
                    <div className="relative flex-1">
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-500 text-[9px]">$</span>
                      <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded px-1.5 py-1 text-center text-xs md:text-sm font-bold pl-4" />
                    </div>
                    <button onClick={() => setAmount(amount + 10)} className="w-6 h-6 md:w-7 md:h-7 bg-[#1a1625] rounded flex items-center justify-center hover:bg-emerald-500/20 text-sm font-bold">+</button>
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[10, 50, 100, 500].map(val => (
                      <button key={val} onClick={() => setAmount(val)} className={`flex-1 py-0.5 text-[8px] md:text-[9px] rounded ${amount === val ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}>${val}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <label className="text-[8px] md:text-[9px] text-gray-500 mb-0.5 block">Duración</label>
                  <div className="flex gap-0.5">
                    {[{ value: 30, label: '30s' }, { value: 60, label: '1m' }, { value: 300, label: '5m' }].map(d => (
                      <button key={d.value} onClick={() => setDuration(d.value)} className={`px-2 py-1.5 rounded text-[10px] md:text-[11px] font-medium ${duration === d.value ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}>{d.label}</button>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:block text-center px-2 md:px-3 py-1.5 bg-[#1a1625] rounded-lg border border-purple-900/30">
                  <div className="text-[8px] md:text-[9px] text-gray-500">Payout</div>
                  <div className="text-base md:text-lg font-bold text-emerald-400">{payout}%</div>
                  <div className="text-[8px] md:text-[9px] text-gray-500">+<span className="text-emerald-400">${(amount * payout / 100).toFixed(0)}</span></div>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                <button onClick={() => handlePlaceTrade('up', amount, duration)} className="flex-1 sm:flex-none flex flex-col items-center px-4 sm:px-6 py-2 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 transition-all">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-bold text-xs md:text-sm">COMPRAR</span>
                  <span className="text-[8px] md:text-[9px] opacity-80">Subir</span>
                </button>
                <button onClick={() => handlePlaceTrade('down', amount, duration)} className="flex-1 sm:flex-none flex flex-col items-center px-4 sm:px-6 py-2 bg-gradient-to-b from-red-500 to-red-700 rounded-lg hover:shadow-lg hover:shadow-red-500/30 active:scale-95 transition-all">
                  <TrendingDown className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-bold text-xs md:text-sm">VENDER</span>
                  <span className="text-[8px] md:text-[9px] opacity-80">Bajar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Replay Mode Panel */}
        {replayMode && (
          <div className="bg-[#13111c] border-t border-purple-900/20 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5">
                  <Target className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">Modo Backtesting</span>
                </div>
                <div className="text-xs text-gray-400">
                  Vela {replayIndex + 1} de {historicalCandles.length - 49}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={historicalCandles.length - 50} value={replayIndex} onChange={e => setReplayIndex(Number(e.target.value))} className="w-48 accent-purple-600" />
                <button onClick={toggleReplayMode} className="px-3 py-1.5 bg-red-600 rounded text-xs font-medium">Salir</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Trades Sidebar */}
      {!isFullscreen && (
        <div className="hidden lg:flex w-48 xl:w-52 bg-[#13111c] border-l border-purple-900/20 flex-col flex-shrink-0">
          <div className="p-2 border-b border-purple-900/20">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[11px] flex items-center gap-1"><Zap className="w-3 h-3 text-purple-400" />Operaciones</h3>
              <span className="px-1.5 py-0.5 bg-purple-600/20 text-purple-400 text-[10px] font-bold rounded">{activeTrades.length}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {activeTrades.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 bg-[#1a1625] rounded-full flex items-center justify-center mb-2"><Activity className="w-6 h-6 text-gray-600" /></div>
                <p className="text-gray-500 text-[10px]">No hay operaciones</p>
              </div>
            ) : (
              <div className="space-y-1.5">{activeTrades.map(t => <TradeCard key={t.id} trade={t} currentPrice={currentPrice?.price} />)}</div>
            )}
          </div>
          
          {/* Trade Markers History */}
          {tradeMarkers.length > 0 && (
            <div className="p-2 border-t border-purple-900/20">
              <div className="text-[9px] text-gray-500 mb-1">Puntos de entrada</div>
              <div className="space-y-1 max-h-20 overflow-y-auto">
                {tradeMarkers.slice(-5).map(m => (
                  <div key={m.id} className={`flex items-center justify-between text-[9px] px-1.5 py-0.5 rounded ${m.direction === 'up' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                    <span className={m.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}>{m.direction === 'up' ? '↑' : '↓'} ${m.amount}</span>
                    <span className="text-gray-500">@{m.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-2 border-t border-purple-900/20 bg-[#1a1625]/50">
            <div className="grid grid-cols-3 gap-1 text-center">
              <div><div className="text-[9px] text-gray-500">Ganadas</div><div className="font-bold text-[11px] text-emerald-400">12</div></div>
              <div><div className="text-[9px] text-gray-500">Perdidas</div><div className="font-bold text-[11px] text-red-400">8</div></div>
              <div><div className="text-[9px] text-gray-500">Win Rate</div><div className="font-bold text-[11px] text-purple-400">60%</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TradeCard({ trade, currentPrice }: { trade: Trade; currentPrice?: number }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const totalDuration = new Date(trade.expires_at).getTime() - new Date(trade.created_at).getTime();
    const update = () => {
      const remaining = Math.max(0, Math.floor((new Date(trade.expires_at).getTime() - Date.now()) / 1000));
      const elapsed = Date.now() - new Date(trade.created_at).getTime();
      setTimeLeft(remaining);
      setProgress(Math.max(0, 100 - (elapsed / totalDuration) * 100));
    };
    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [trade.expires_at, trade.created_at]);

  const priceDiff = currentPrice ? currentPrice - trade.entry_price : 0;
  const isWinning = trade.direction === 'up' ? priceDiff > 0 : priceDiff < 0;

  return (
    <div className={`relative bg-[#1a1625] rounded-lg p-2 border ${trade.direction === 'up' ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#0d0b14] rounded-t-lg overflow-hidden">
        <div className={`h-full transition-all ${trade.direction === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between items-start mb-1.5 pt-0.5">
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-5 rounded flex items-center justify-center ${trade.direction === 'up' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
            {trade.direction === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
          </div>
          <div>
            <div className="font-medium text-[10px]">{trade.symbol}</div>
            <div className={`text-[8px] ${trade.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>{trade.direction === 'up' ? '▲ COMPRA' : '▼ VENTA'}</div>
          </div>
        </div>
        <div className={`px-1 py-0.5 rounded text-[8px] font-bold ${isWinning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {isWinning ? '+' : '-'}${Math.abs(priceDiff * 10).toFixed(2)}
        </div>
      </div>
      <div className="flex justify-between text-[9px] text-gray-500 mb-1">
        <span>${trade.amount}</span>
        <span>@{trade.entry_price.toFixed(2)}</span>
      </div>
      <div className={`flex items-center justify-center gap-0.5 text-[11px] font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-purple-400'}`}>
        <Clock className="w-3 h-3" />{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
}
