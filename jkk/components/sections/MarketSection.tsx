
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Briefcase, Bitcoin, Globe, Leaf, Apple, Ship, Gem } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MarketSelector from '../market/MarketSelector';
import MarketAssetList from '../market/MarketAssetList';
import { toast } from '@/hooks/use-toast';

export interface MarketAsset {
  id: string;
  pair?: string;
  name?: string;
  price: string;
  change: string;
  trend: 'up' | 'down';
  inWatchlist: boolean;
  Icon: React.ElementType;
}

export type MarketCategory = 'forex' | 'commodities' | 'crypto' | 'stocks';

export interface MarketData {
  forex: MarketAsset[];
  commodities: MarketAsset[];
  crypto: MarketAsset[];
  stocks: MarketAsset[];
}

const initialMarketData: MarketData = {
  forex: [
    { id: "eur-usd", pair: "EUR/USD", price: "1.08742", change: "+0.12%", trend: "up", inWatchlist: true, Icon: Globe },
    { id: "gbp-usd", pair: "GBP/USD", price: "1.26845", change: "-0.08%", trend: "down", inWatchlist: false, Icon: Globe },
    { id: "usd-jpy", pair: "USD/JPY", price: "148.523", change: "+0.34%", trend: "up", inWatchlist: false, Icon: Globe },
  ],
  commodities: [
    { id: "gold", name: "Gold", price: "$2,048.50", change: "+1.2%", trend: "up", inWatchlist: true, Icon: Gem },
    { id: "silver", name: "Silver", price: "$24.73", change: "-0.5%", trend: "down", inWatchlist: false, Icon: Gem },
    { id: "oil", name: "Oil (WTI)", price: "$78.45", change: "+2.1%", trend: "up", inWatchlist: true, Icon: Ship },
    { id: "gas", name: "Natural Gas", price: "$2.87", change: "-1.8%", trend: "down", inWatchlist: false, Icon: Leaf },
  ],
  crypto: [
    { id: "btc", name: "Bitcoin", price: "$43,123.50", change: "+5.8%", trend: "up", inWatchlist: true, Icon: Bitcoin },
    { id: "eth", name: "Ethereum", price: "$2,289.10", change: "+4.1%", trend: "up", inWatchlist: false, Icon: Bitcoin },
    { id: "sol", name: "Solana", price: "$99.45", change: "-2.3%", trend: "down", inWatchlist: false, Icon: Bitcoin },
  ],
  stocks: [
    { id: "aapl", name: "Apple", price: "$192.53", change: "+1.5%", trend: "up", inWatchlist: true, Icon: Apple },
    { id: "tsla", name: "Tesla", price: "$238.45", change: "-0.9%", trend: "down", inWatchlist: false, Icon: Briefcase },
    { id: "amzn", name: "Amazon", price: "$153.73", change: "+2.2%", trend: "up", inWatchlist: false, Icon: Briefcase },
  ],
};


const MarketSection = () => {
  const [marketData, setMarketData] = useState<MarketData>(initialMarketData);
  const [activeMarket, setActiveMarket] = useState<MarketCategory>('forex');

  const markets = [
    { id: 'forex', label: 'Forex' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'stocks', label: 'Stocks' },
  ];

  const handleToggleWatchlist = (id: string) => {
    const newMarketData = { ...marketData };
    let assetName = '';
    let assetUpdated = false;

    for (const category in newMarketData) {
      const typedCategory = category as MarketCategory;
      const assets = newMarketData[typedCategory];
      const assetIndex = assets.findIndex(asset => asset.id === id);

      if (assetIndex !== -1) {
        const asset = assets[assetIndex];
        asset.inWatchlist = !asset.inWatchlist;
        assetName = asset.name || asset.pair || '';
        assetUpdated = true;
        toast({
          title: asset.inWatchlist ? "Added to Watchlist" : "Removed from Watchlist",
          description: `${assetName} has been ${asset.inWatchlist ? 'added to' : 'removed from'} your watchlist.`,
        });
        break;
      }
    }

    if (assetUpdated) {
      setMarketData(newMarketData);
    }
  };

  const currentAssets = marketData[activeMarket];
  
  return (
    <div className="flex-1 p-4 md:p-8 bg-gradient-to-br from-[#131722] to-[#1a1e2e] min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
            Market Overview
          </h1>
          <p className="text-gray-300 text-lg">Real-time market data and trading opportunities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Market Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">Bullish</div>
              <div className="text-sm text-gray-300">67% positive</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-blue-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-blue-400" />
                Volatility Index
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">23.4</div>
              <div className="text-sm text-gray-300">Moderate</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-yellow-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                Volume 24h
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">$6.2T</div>
              <div className="text-sm text-gray-300">+12% vs yesterday</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Active Traders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">24.8K</div>
              <div className="text-sm text-gray-300">Online now</div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-gradient-to-br from-[#2C2F42]/80 to-[#23263A]/80 border-gray-700/50 backdrop-blur-lg">
          <CardHeader>
            <MarketSelector 
              markets={markets}
              activeMarket={activeMarket}
              onSelectMarket={(id) => setActiveMarket(id as MarketCategory)}
            />
          </CardHeader>
          <CardContent>
            <MarketAssetList assets={currentAssets} onToggleWatchlist={handleToggleWatchlist} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketSection;
