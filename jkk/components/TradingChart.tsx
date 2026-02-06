import React, { useState, useEffect } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";
import { Indicator } from "./IndicatorsModal";

// Enhanced BTC/USDT simulation data with more realistic market behavior
const generateBTCUSDTData = () => {
  const basePrice = 43500; // Starting BTC price in USDT
  const data = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < 30; i++) {
    const time = new Date();
    time.setMinutes(time.getMinutes() - (30 - i) * 2);
    const timeStr = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    // Enhanced realistic price movement with trend simulation
    const trendDirection = Math.sin(i * 0.2) * 0.3; // Slower trend waves
    const volatility = 0.0008 + Math.random() * 0.0005; // Reduced volatility
    const marketNoise = (Math.random() - 0.5) * 1.5; // Reduced market noise
    const change = (trendDirection + marketNoise) * volatility * currentPrice;
    
    currentPrice = Math.max(41000, Math.min(46000, currentPrice + change));
    
    // Enhanced candlestick data
    const open = currentPrice - change;
    const close = currentPrice;
    const high = Math.max(open, close) + Math.random() * 80 + 15;
    const low = Math.min(open, close) - Math.random() * 80 - 15;
    const volume = Math.floor(Math.random() * 600) + 150;
    
    data.push({
      time: timeStr,
      price: currentPrice,
      open,
      close,
      high,
      low,
      volume,
      trend: trendDirection > 0 ? 'bullish' : 'bearish'
    });
  }
  
  return data;
};

interface TradingChartProps {
  chartType: "line" | "candlestick" | "area";
  activeTool?: string;
  indicators?: Indicator[]; // NEW
}

const CustomCandlestick = ({ payload, x, y, width, height }: any) => {
  if (!payload) return null;
  
  const { open, close, high, low } = payload;
  const isGreen = close > open;
  const candleColor = isGreen ? "#26de81" : "#fc5c65";
  
  // Recharts provides x, y, width, height relative to the bar's value (open in this case)
  // We need to calculate positions for high, low, and close relative to this
  const openY = y;
  const closeY = y + (open - close) * height / (payload.high - payload.low); // Approximate scaling
  const highY = y + (open - high) * height / (payload.high - payload.low);
  const lowY = y + (open - low) * height / (payload.high - payload.low);
  const wickX = x + width / 2;
  const candleY = isGreen ? closeY : openY;
  const candleHeight = Math.max(1, Math.abs(openY - closeY));

  return (
    <g>
      {/* Wick */}
      <line
        x1={wickX}
        y1={highY}
        x2={wickX}
        y2={lowY}
        stroke={candleColor}
        strokeWidth={1.5}
      />
      {/* Candle body */}
      <rect
        x={x}
        y={candleY}
        width={width}
        height={candleHeight}
        fill={candleColor}
        stroke={isGreen ? "#6ee7b7" : "#ff8c90"}
        strokeWidth={0.5}
        rx={0.5}
      />
    </g>
  );
};

const TradingChart = ({ chartType, activeTool, indicators = [] }: TradingChartProps) => {
  const [data, setData] = useState(generateBTCUSDTData());
  const [currentPrice, setCurrentPrice] = useState(43500);
  const [priceChange, setPriceChange] = useState(0);
  const [statistics, setStatistics] = useState({
    high24h: 0,
    low24h: 0,
    volume: 0,
    change24h: 0
  });

  // Slower real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateBTCUSDTData();
      const latestPrice = newData[newData.length - 1].price;
      const previousPrice = currentPrice;
      
      // Calculate statistics
      const prices = newData.map(d => d.price);
      const volumes = newData.map(d => d.volume);
      const high24h = Math.max(...prices);
      const low24h = Math.min(...prices);
      const totalVolume = volumes.reduce((acc, vol) => acc + vol, 0);
      const change24h = ((latestPrice - newData[0].price) / newData[0].price) * 100;
      
      setData(newData);
      setCurrentPrice(latestPrice);
      setPriceChange(latestPrice - previousPrice);
      setStatistics({
        high24h,
        low24h,
        volume: totalVolume,
        change24h
      });
    }, 4000); // Slower updates for smoother movement

    return () => clearInterval(interval);
  }, [currentPrice]);

  const chartConfig = {
    green: { color: "#26de81" },
    red: { color: "#fc5c65" },
    orange: { color: "#ff9500" },
    blue: { color: "#4299e1" },
    purple: { color: "#9f7aea" },
    referenceLine: { color: "#ffffff55" },
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  const formatPriceChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(0)}`;
  };

  // Simple dummy logic to draw overlays of indicators (visual only, no real trading signals)
  // These functions could be much more advanced with real indicator calculations

  // --- Helper to render overlays ---
  const renderIndicators = () => {
    if (!indicators.length) return null;
    
    const getYPosition = (factor: number) => statistics.low24h + (statistics.high24h - statistics.low24h) * factor;

    return indicators.map((ind) => {
      switch (ind) {
        case "ema":
          return (
            <Line
              key="ema" type="monotone" dataKey="price" stroke="#6ee7b7"
              strokeWidth={2} dot={false} strokeDasharray="7 6" opacity={0.8}
            />
          );
        case "sma":
          return (
            <Line
              key="sma" type="monotone" dataKey="price" stroke="#38bdf8"
              strokeWidth={2} dot={false} strokeDasharray="3 3" opacity={0.7}
            />
          );
        case "rsi":
          return (
            <ReferenceLine
              key="rsi" y={getYPosition(0.3)} stroke="#facc15" strokeDasharray="4 8"
              strokeWidth={2} label={{ value: "RSI", fill: "#facc15", fontSize: 11 }}
            />
          );
        case "bbands":
          return (
            <ReferenceLine
              key="bbands" y={getYPosition(0.8)} stroke="#f472b6" strokeDasharray="15 5"
              strokeWidth={2} label={{ value: "BBand", fill: "#f472b6", fontSize: 11 }}
            />
          );
        case "macd":
          return (
            <ReferenceLine key="macd" y={getYPosition(0.5)} stroke="#34d399" strokeDasharray="3 3" 
            label={{ value: "MACD", fill: "#34d399", fontSize: 11 }} />
          );
        case "stoch":
           return (
            <ReferenceLine key="stoch" y={getYPosition(0.2)} stroke="#a78bfa" strokeDasharray="8 3" 
            label={{ value: "Stoch", fill: "#a78bfa", fontSize: 11 }} />
          );
        case "atr":
           return (
            <ReferenceLine key="atr" y={getYPosition(0.9)} stroke="#fb923c" strokeDasharray="1 5" 
            label={{ value: "ATR", fill: "#fb923c", fontSize: 11 }} />
          );
        case "ichimoku":
            return (
              <Area key="ichimoku" type="monotone" dataKey="price" stroke="#60a5fa" fill="#60a5fa" 
              fillOpacity={0.1} yAxisId={0} />
            );
        case "vwap":
            return <ReferenceLine key="vwap" y={getYPosition(0.6)} stroke="#22d3ee" strokeDasharray="1 1" label={{ value: "VWAP", fill: "#22d3ee" }} />;
        case "sar":
            return <Line key="sar" type="natural" dataKey="low" stroke="#f87171" strokeWidth={0} dot={{ r: 1.5, fill: '#f87171' }} />;
        case "williams":
            return <ReferenceLine key="williams" y={getYPosition(0.1)} stroke="#c084fc" strokeDasharray="10 2" label={{ value: "W%R", fill: "#c084fc" }} />;
        case "momentum":
            return <ReferenceLine key="momentum" y={getYPosition(0.7)} stroke="#a3e635" strokeDasharray="6 2" label={{ value: "Mtm", fill: "#a3e635" }} />;
        default:
          return null;
      }
    });
  };

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 70, left: 10, bottom: 20 }
    };

    const commonElements = (
      <>
        <CartesianGrid 
          strokeDasharray="1 1" 
          vertical={false}
          horizontal={true}
          stroke="#ffffff"
          strokeOpacity={0.05}
        />
        
        <XAxis 
          dataKey="time" 
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#4a5568', fontSize: 11 }}
          tickMargin={10}
          interval="preserveStartEnd"
        />
        
        <YAxis 
          domain={['dataMin - 100', 'dataMax + 100']}
          axisLine={false}
          tickLine={false}
          orientation="right"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickFormatter={formatPrice}
          tickMargin={10}
          width={60}
        />
        
        <ReferenceLine 
          y={currentPrice} 
          stroke="#ff9500" 
          strokeDasharray="4 4" 
          strokeWidth={1.5}
          label={{ 
            position: 'right',
            value: formatPrice(currentPrice),
            fill: '#ff9500',
            fontSize: 12,
            fontWeight: 'bold',
            offset: 15,
            className: 'bg-gray-900/50 px-2 py-1 rounded'
          }}
        />
      </>
    );

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <defs>
              <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff9500" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ff9500" stopOpacity={0} />
              </linearGradient>
            </defs>
            {commonElements}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#ff9500"
              strokeWidth={3}
              dot={false}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
            />
            {renderIndicators()}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9f7aea" stopOpacity={0.7} />
                <stop offset="50%" stopColor="#9f7aea" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9f7aea" stopOpacity={0} />
              </linearGradient>
            </defs>
            {commonElements}
            <Area
              type="monotone"
              dataKey="price"
              stroke="#9f7aea"
              strokeWidth={3}
              fill="url(#areaGradient)"
              dot={false}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {renderIndicators()}
          </AreaChart>
        );

      default: // candlestick
        return (
          <BarChart {...commonProps}>
            {commonElements}
            <Bar 
              dataKey="open" 
              shape={(props) => <CustomCandlestick {...props} />}
            />
            {renderIndicators()}
          </BarChart>
        );
    }
  };

  return (
    <div className="h-full w-full">
      <ChartContainer
        className="h-full bg-transparent"
        config={chartConfig}
      >
        <div className="h-full w-full relative">
          {/* Enhanced tool indicator */}
          {activeTool && activeTool !== "select" && (
            <div className="absolute top-4 right-4 bg-gray-900/50 backdrop-blur-lg rounded-lg px-4 py-2 border border-blue-400/30 z-10 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">{activeTool} Tool Active</span>
              </div>
            </div>
          )}
          
          {/* Enhanced price info overlay */}
          <div className="absolute top-4 left-4 bg-gray-900/50 backdrop-blur-lg rounded-lg p-3 border border-orange-400/30 z-10 shadow-lg">
            <div className="flex items-center gap-3 mb-1">
              <div className="text-orange-400 text-2xl font-black tracking-tighter">{formatPrice(currentPrice)}</div>
              <div className={`text-sm font-bold px-2 py-1 rounded-md ${priceChange >= 0 ? 'text-green-300 bg-green-500/20' : 'text-red-300 bg-red-500/20'}`}>
                {formatPriceChange(priceChange)}
              </div>
            </div>
            <div className="text-gray-400 text-xs">BTC/USDT • 95% Payout</div>
          </div>

          {/* Statistics Panel */}
          <div className="absolute bottom-4 left-4 bg-gray-900/50 backdrop-blur-lg rounded-lg p-3 border border-blue-400/30 z-10 shadow-lg">
            <div className="text-blue-300 text-xs font-bold mb-2 uppercase tracking-wider">24H Stats</div>
            <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-xs">
              <div className="text-gray-400">High</div>
              <div className="text-green-400 font-bold text-right">{formatPrice(statistics.high24h)}</div>
              <div className="text-gray-400">Low</div>
              <div className="text-red-400 font-bold text-right">{formatPrice(statistics.low24h)}</div>
              <div className="text-gray-400">Volume</div>
              <div className="text-purple-400 font-bold text-right">{statistics.volume.toLocaleString()}</div>
              <div className="text-gray-400">Change</div>
              <div className={`font-bold text-right ${statistics.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {statistics.change24h.toFixed(2)}%
              </div>
            </div>
          </div>
          
          {/* Main chart area with improved positioning */}
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      </ChartContainer>
    </div>
  );
};

export default TradingChart;
