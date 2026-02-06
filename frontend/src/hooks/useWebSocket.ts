import { useState, useEffect, useCallback, useRef } from 'react';
import { PriceData } from '../lib/types';

interface WSMessage {
  type: string;
  data: any;
}

// Mock price data for demo mode
const MOCK_PRICES: Record<string, { base: number; volatility: number }> = {
  'BTC/USDT': { base: 67543.21, volatility: 0.002 },
  'ETH/USDT': { base: 3456.78, volatility: 0.003 },
  'BNB/USDT': { base: 567.89, volatility: 0.002 },
  'XRP/USDT': { base: 0.5234, volatility: 0.004 },
  'SOL/USDT': { base: 145.67, volatility: 0.005 },
  'ADA/USDT': { base: 0.4567, volatility: 0.003 },
  'DOGE/USDT': { base: 0.1234, volatility: 0.006 },
  'DOT/USDT': { base: 7.89, volatility: 0.004 },
  'EUR/USD': { base: 1.0876, volatility: 0.001 },
  'GBP/USD': { base: 1.2654, volatility: 0.001 },
  'USD/JPY': { base: 154.32, volatility: 0.001 },
  'AUD/USD': { base: 0.6543, volatility: 0.001 },
  'XAU/USD': { base: 2345.67, volatility: 0.002 },
  'XAG/USD': { base: 28.45, volatility: 0.003 },
  'AAPL': { base: 189.45, volatility: 0.002 },
  'GOOGL': { base: 141.23, volatility: 0.002 },
  'MSFT': { base: 378.91, volatility: 0.002 },
  'TSLA': { base: 245.67, volatility: 0.004 },
};

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const mockIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const subscribedSymbols = useRef<Set<string>>(new Set());
  const currentPrices = useRef<Record<string, number>>({});

  // Initialize mock prices
  useEffect(() => {
    Object.entries(MOCK_PRICES).forEach(([symbol, { base }]) => {
      currentPrices.current[symbol] = base;
    });
  }, []);

  // Generate mock price updates
  const startMockPrices = useCallback(() => {
    if (mockIntervalRef.current) return;

    mockIntervalRef.current = setInterval(() => {
      subscribedSymbols.current.forEach(symbol => {
        const config = MOCK_PRICES[symbol];
        if (!config) return;

        const currentPrice = currentPrices.current[symbol] || config.base;
        const change = (Math.random() - 0.48) * currentPrice * config.volatility;
        const newPrice = Math.max(currentPrice * 0.9, Math.min(currentPrice * 1.1, currentPrice + change));
        
        currentPrices.current[symbol] = newPrice;
        
        const change24h = ((newPrice - config.base) / config.base) * 100;

        setPrices(prev => ({
          ...prev,
          [symbol]: {
            symbol,
            price: newPrice,
            change_24h: change24h,
            high_24h: config.base * 1.02,
            low_24h: config.base * 0.98,
            volume_24h: Math.random() * 1000000000,
            timestamp: new Date().toISOString()
          }
        }));
      });
    }, 500);
  }, []);

  const stopMockPrices = useCallback(() => {
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = undefined;
    }
  }, []);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        stopMockPrices();
      };

      ws.onmessage = (event) => {
        const messages = event.data.split('\n');
        messages.forEach((msg: string) => {
          if (msg.trim()) {
            try {
              const data: WSMessage = JSON.parse(msg);
              handleMessage(data);
            } catch (e) {
              console.error('Error parsing WS message:', e);
            }
          }
        });
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected, using mock data');
        setConnected(true); // Show as connected for demo
        startMockPrices();
        reconnectTimeoutRef.current = setTimeout(connect, 10000);
      };

      ws.onerror = () => {
        console.log('WebSocket error, using mock data');
        setConnected(true); // Show as connected for demo
        startMockPrices();
      };

      wsRef.current = ws;
    } catch {
      console.log('WebSocket not available, using mock data');
      setConnected(true);
      startMockPrices();
    }
  }, [startMockPrices, stopMockPrices]);

  const handleMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case 'price_update':
        setPrices(prev => ({
          ...prev,
          [message.data.symbol]: message.data
        }));
        break;
      case 'trade_result':
        window.dispatchEvent(new CustomEvent('tradeResult', { detail: message.data }));
        break;
      case 'heartbeat':
        break;
    }
  }, []);

  const subscribe = useCallback((symbol: string) => {
    subscribedSymbols.current.add(symbol);
    
    // Initialize price immediately
    const config = MOCK_PRICES[symbol];
    if (config && !prices[symbol]) {
      const price = currentPrices.current[symbol] || config.base;
      setPrices(prev => ({
        ...prev,
        [symbol]: {
          symbol,
          price,
          change_24h: 0,
          high_24h: config.base * 1.02,
          low_24h: config.base * 0.98,
          volume_24h: Math.random() * 1000000000,
          timestamp: new Date().toISOString()
        }
      }));
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'subscribe', symbol }));
    }
  }, [prices]);

  const unsubscribe = useCallback((symbol: string) => {
    subscribedSymbols.current.delete(symbol);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'unsubscribe', symbol }));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      stopMockPrices();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, stopMockPrices]);

  return {
    connected,
    prices,
    subscribe,
    unsubscribe
  };
}
