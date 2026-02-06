import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

interface WithdrawMethod {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  fee: string;
  processingTime: string;
}

const withdrawMethods: WithdrawMethod[] = [
  {
    id: "usdt-trc20",
    name: "USD Tether (TRC-20)",
    symbol: "USDT",
    icon: "💰",
    color: "from-green-500 to-green-600",
    fee: "1 USDT",
    processingTime: "5-10 min"
  },
  {
    id: "ethereum",
    name: "Ethereum (ETH)",
    symbol: "ETH",
    icon: "💎",
    color: "from-blue-500 to-purple-600",
    fee: "0.01 ETH",
    processingTime: "10-30 min"
  },
  {
    id: "litecoin",
    name: "Litecoin (LTC)",
    symbol: "LTC",
    icon: "⚡",
    color: "from-gray-400 to-gray-600",
    fee: "0.01 LTC",
    processingTime: "15-45 min"
  },
  {
    id: "usdt-erc20",
    name: "USD Tether (ERC-20)",
    symbol: "USDT",
    icon: "💰",
    color: "from-green-500 to-emerald-600",
    fee: "5 USDT",
    processingTime: "10-30 min"
  },
  {
    id: "usdt-polygon",
    name: "USD Tether (Polygon)",
    symbol: "USDT",
    icon: "🔷",
    color: "from-purple-500 to-purple-600",
    fee: "1 USDT",
    processingTime: "5-15 min"
  },
  {
    id: "usdc-erc20",
    name: "USD Coin (ERC-20)",
    symbol: "USDC",
    icon: "💙",
    color: "from-blue-400 to-blue-600",
    fee: "5 USDC",
    processingTime: "10-30 min"
  },
  {
    id: "usdc-polygon",
    name: "USD Coin (Polygon)",
    symbol: "USDC",
    icon: "🔷",
    color: "from-purple-400 to-blue-600",
    fee: "1 USDC",
    processingTime: "5-15 min"
  },
  {
    id: "usdt-bep20",
    name: "USD Tether (BEP-20)",
    symbol: "USDT",
    icon: "💰",
    color: "from-yellow-500 to-green-600",
    fee: "1 USDT",
    processingTime: "5-10 min"
  },
  {
    id: "bitcoin",
    name: "Bitcoin (BTC)",
    symbol: "BTC",
    icon: "₿",
    color: "from-orange-500 to-orange-600",
    fee: "0.0005 BTC",
    processingTime: "30-60 min"
  }
];

interface WithdrawMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: WithdrawMethod) => void;
}

const WithdrawMethodsModal = ({ isOpen, onClose, onSelectMethod }: WithdrawMethodsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#151520] border border-gray-700/50 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            <Coins className="inline-block w-6 h-6 mr-2 text-orange-500" />
            Métodos de Retiro
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {withdrawMethods.map((method) => (
            <Button
              key={method.id}
              onClick={() => onSelectMethod(method)}
              className={`h-20 bg-gradient-to-r ${method.color} hover:opacity-90 text-white border border-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl backdrop-blur-sm`}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="text-2xl">{method.icon}</div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-sm">{method.name}</span>
                  <span className="text-xs opacity-80">{method.symbol}</span>
                  <div className="text-xs opacity-70 mt-1">
                    <div>Fee: {method.fee}</div>
                    <div>{method.processingTime}</div>
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawMethodsModal;
export type { WithdrawMethod };