
import React from 'react';
import { TrendingUp, TrendingDown, PlusCircle, CheckCircle } from 'lucide-react';
import { MarketAsset } from '@/components/sections/MarketSection';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MarketAssetListProps {
  assets: MarketAsset[];
  onToggleWatchlist: (id: string) => void;
}

const MarketAssetList = ({ assets, onToggleWatchlist }: MarketAssetListProps) => {
  if (!assets.length) {
    return <div className="text-center text-gray-400 py-10">No assets found in this market.</div>;
  }

  return (
    <div className="space-y-3">
      {assets.map((item) => (
        <div 
          key={item.id} 
          className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 hover:bg-gray-700/60 border border-gray-700/50 transition-all duration-300 ease-in-out cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                item.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400',
                'group-hover:scale-110 group-hover:bg-opacity-20'
              )}>
              <item.Icon className="w-5 h-5" />
            </div>
            <span className="text-white font-semibold text-base">{item.name || item.pair}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-white font-mono text-base">{item.price}</div>
              <div className={cn(
                  "text-sm font-semibold flex items-center justify-end gap-1",
                  item.trend === 'up' ? 'text-green-400' : 'text-red-400'
                )}>
                {item.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {item.change}
              </div>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "rounded-full w-10 h-10 transition-all duration-300",
                item.inWatchlist 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-blue-600/30 hover:text-white'
              )}
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onToggleWatchlist(item.id);
              }}
            >
              {item.inWatchlist ? <CheckCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketAssetList;
