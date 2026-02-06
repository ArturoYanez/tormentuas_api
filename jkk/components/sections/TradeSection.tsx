import React from 'react';
import { ArrowDown, ArrowUp, Info, MousePointer, PlusCircle, MinusCircle, TrendingUp, Move, ZoomIn, BarChart3, LineChart, CandlestickChart } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TradingChart from "@/components/TradingChart";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import IndicatorsModal, { Indicator } from "../IndicatorsModal";
import { SlidersHorizontal } from "lucide-react";

const TradeSection = () => {
  const [investment, setInvestment] = useState(50);
  const [timer, setTimer] = useState(5);
  const [balance, setBalance] = useState(0.35);
  const [pendingTrade, setPendingTrade] = useState(true);
  const [chartType, setChartType] = useState<"line" | "candlestick" | "area">("candlestick");
  const [activeTool, setActiveTool] = useState<"select" | "zoom" | "trend" | "move">("select");
  const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  const handleTrade = (direction: "up" | "down") => {
    toast({
      title: `${direction.toUpperCase()} trade placed`,
      description: `Investment: ${investment}% - Expiry: ${timer} seconds`,
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleChartTypeChange = (type: typeof chartType) => {
    setChartType(type);
    toast({
      title: "Chart Type Changed",
      description: `Switched to ${type} chart`,
    });
  };

  const handleToolSelect = (tool: typeof activeTool) => {
    setActiveTool(tool);
    toast({
      title: "Tool Selected",
      description: `${tool.charAt(0).toUpperCase() + tool.slice(1)} tool activated`,
    });
  };

  const tools = [
    { id: "select", icon: MousePointer, label: "SELECT", description: "Selection Tool" },
    { id: "zoom", icon: ZoomIn, label: "ZOOM", description: "Zoom Tool" },
    { id: "trend", icon: TrendingUp, label: "TREND", description: "Trend Lines" },
    { id: "move", icon: Move, label: "MOVE", description: "Pan Chart" }
  ];

  const chartTypes = [
    { id: "line", icon: LineChart, label: "LINE", description: "Line Chart" },
    { id: "candlestick", icon: CandlestickChart, label: "CANDLE", description: "Candlestick Chart" },
    { id: "area", icon: BarChart3, label: "AREA", description: "Area Chart" }
  ];

  const ControlButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className="bg-gray-700/50 hover:bg-gray-600/50 rounded-md p-2 transition-all shadow-md border border-gray-600/50 backdrop-blur-sm transform hover:scale-110"
    >
      {children}
    </button>
  );

  const TradingControls = () => (
    <div className="p-4 space-y-5">
      {/* Pending Trade */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
          <div className="text-white font-semibold text-xs">PENDING TRADE</div>
        </div>
        <Switch 
          checked={pendingTrade} 
          onCheckedChange={setPendingTrade}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>

      {/* Time Control */}
      <div>
        <div className="text-gray-400 font-semibold text-xs mb-2">Time</div>
        <div className="flex items-center gap-2">
          <ControlButton onClick={() => setTimer(Math.max(1, timer - 1))}>
            <MinusCircle size={18} className="text-gray-300" />
          </ControlButton>
          <div className="flex-1 bg-black/30 rounded-md p-3 text-center border border-gray-700/50 shadow-inner">
            <span className="text-white font-mono text-lg font-bold">{formatTime(timer)}</span>
          </div>
          <ControlButton onClick={() => setTimer(timer + 1)}>
            <PlusCircle size={18} className="text-gray-300" />
          </ControlButton>
        </div>
      </div>

      {/* Investment Control */}
      <div>
        <div className="text-gray-400 font-semibold text-xs mb-2">Investment</div>
        <div className="flex items-center gap-2">
          <ControlButton onClick={() => setInvestment(Math.max(1, investment - 5))}>
            <MinusCircle size={18} className="text-gray-300" />
          </ControlButton>
          <div className="flex-1 bg-black/30 rounded-md p-3 text-center border border-gray-700/50 shadow-inner">
            <span className="text-white font-mono text-lg font-bold">{investment} %</span>
          </div>
          <ControlButton onClick={() => setInvestment(Math.min(100, investment + 5))}>
            <PlusCircle size={18} className="text-gray-300" />
          </ControlButton>
        </div>
      </div>
      
      {/* UP/DOWN buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Button 
          className="bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white h-14 text-base font-bold shadow-2xl transform hover:scale-105 transition-all border border-emerald-500/50 rounded-lg flex items-center justify-center gap-2"
          onClick={() => handleTrade("up")}
          disabled={!pendingTrade}
        >
          <ArrowUp size={22} />
          <span>UP</span>
        </Button>
        
        <Button 
          className="bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white h-14 text-base font-bold shadow-2xl transform hover:scale-105 transition-all border border-red-500/50 rounded-lg flex items-center justify-center gap-2"
          onClick={() => handleTrade("down")}
          disabled={!pendingTrade}
        >
          <ArrowDown size={22} />
          <span>DOWN</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row flex-1 relative overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0d0d14] to-[#151520]">
      {/* Indicators Button */}
      <div className="absolute right-4 top-4 z-30 lg:right-[21.5rem]">
        <button 
          className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 backdrop-blur-lg rounded-lg shadow-lg border border-gray-700 text-white font-semibold text-xs hover:bg-blue-600/30 hover:border-blue-500 transition-all transform hover:scale-105"
          onClick={() => setShowIndicatorsModal(true)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Indicadores
        </button>
      </div>

      <IndicatorsModal 
        isOpen={showIndicatorsModal}
        selected={indicators}
        onClose={() => setShowIndicatorsModal(false)}
        onChange={setIndicators}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with currency pairs */}
        <div className="flex-shrink-0 bg-gray-900/30 backdrop-blur-xl border-b border-gray-800/80">
          <ScrollArea className="w-full">
            <div className="flex min-w-max p-2">
              <Button variant="ghost" className="bg-orange-600/50 rounded-lg border border-orange-500/50 text-xs px-3 py-2 shadow-xl min-w-max mx-1">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    <div className="w-4 h-4 rounded-full bg-orange-500 relative -mr-1 border border-orange-400/50"></div>
                    <div className="w-4 h-4 rounded-full bg-green-500 border border-green-400/50"></div>
                  </div>
                  <span className="text-white font-semibold">BTC/USDT</span>
                  <span className="text-emerald-400 font-bold">95%</span>
                </div>
              </Button>
              <Button variant="ghost" className="rounded-lg text-xs px-3 py-2 hover:bg-white/5 transition-all min-w-max mx-1">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    <div className="w-4 h-4 rounded-full bg-blue-500 relative -mr-1 border border-blue-400/50"></div>
                    <div className="w-4 h-4 rounded-full bg-green-500 border border-green-400/50"></div>
                  </div>
                  <span className="text-gray-300 font-medium">ETH/USDT</span>
                  <span className="text-yellow-400 font-bold">89%</span>
                </div>
              </Button>
            </div>
          </ScrollArea>
        </div>

        {/* Chart Area */}
        <div className="flex-1 relative bg-gradient-to-br from-[#050508] via-[#0a0a12] to-[#0f0f18] overflow-hidden">
          <TradingChart
            chartType={chartType}
            activeTool={activeTool}
            indicators={indicators}
          />
        </div>

        {/* Bottom controls */}
        <div className="flex-shrink-0 flex items-center justify-center gap-4 bg-gray-900/30 backdrop-blur-xl border-t border-gray-800/80 p-3">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-1.5">
            {chartTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleChartTypeChange(type.id as typeof chartType)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-300 ${
                    chartType === type.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              ))}
          </div>

          <div className="h-8 w-px bg-gray-700/50 hidden sm:block"></div>
          
          {/* Tools Menu */}
          <div className="flex items-center gap-1.5">
            {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id as typeof activeTool)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-300 ${
                    activeTool === tool.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <tool.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tool.label}</span>
                </button>
              ))}
          </div>
        </div>
      </div>
      
      {/* Right Trading Panel (Desktop) / Bottom Sheet (Mobile) */}
      <div className="w-full h-[45vh] lg:h-auto lg:w-80 flex-shrink-0 bg-gray-900/50 backdrop-blur-xl border-t-2 lg:border-t-0 lg:border-l-2 border-gray-800/80 shadow-2xl flex flex-col">
        {/* Desktop Header */}
        <div className="hidden lg:flex p-4 border-b border-gray-800/80 items-center gap-3">
            <div className="flex">
              <div className="w-6 h-6 rounded-full bg-orange-500 relative -mr-2 border-2 border-gray-900"></div>
              <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-gray-900"></div>
            </div>
            <div>
              <div className="text-white font-bold text-lg">BTC/USDT</div>
              <div className="text-green-400 text-sm font-semibold">95% Payout</div>
            </div>
        </div>
        
        <ScrollArea className="flex-1">
          <TradingControls />
        </ScrollArea>
      </div>
    </div>
  );
};

export default TradeSection;
