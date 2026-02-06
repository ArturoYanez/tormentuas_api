
import React from "react";

interface CurrencyPairProps {
  name: string;
  type: string;
  percentage: number;
}

const CurrencyPair: React.FC<CurrencyPairProps> = ({ name, type, percentage }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-red-500 relative -mr-1 border border-[#131722]">
          <span className="text-xs">CA</span>
        </div>
        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-blue-500 border border-[#131722]">
          <span className="text-xs">AU</span>
        </div>
      </div>
      <div className="text-base font-medium flex items-center gap-1">
        {name} <span className="text-gray-400">({type})</span> 
        <span className="text-yellow-500">{percentage}%</span>
      </div>
    </div>
  );
};

export default CurrencyPair;
