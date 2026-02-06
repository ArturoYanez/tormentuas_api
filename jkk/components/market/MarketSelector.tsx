
import React from 'react';
import { cn } from "@/lib/utils";

interface MarketSelectorProps {
  markets: { id: string, label: string }[];
  activeMarket: string;
  onSelectMarket: (marketId: string) => void;
}

const MarketSelector = ({ markets, activeMarket, onSelectMarket }: MarketSelectorProps) => {
  return (
    <div className="flex items-center justify-center p-1 bg-gray-800/50 rounded-xl gap-2 backdrop-blur-sm border border-gray-700/50 mb-8">
      {markets.map((market) => (
        <button
          key={market.id}
          onClick={() => onSelectMarket(market.id)}
          className={cn(
            "w-full px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ease-in-out",
            "outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900",
            activeMarket === market.id
              ? "bg-blue-600 text-white shadow-lg"
              : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
          )}
        >
          {market.label}
        </button>
      ))}
    </div>
  );
};

export default MarketSelector;
