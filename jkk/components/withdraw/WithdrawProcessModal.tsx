import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Clock, Shield, CheckCircle, AlertTriangle, Wallet } from "lucide-react";
import { WithdrawMethod } from "./WithdrawMethodsModal";
import { toast } from "@/hooks/use-toast";

interface WithdrawProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedMethod: WithdrawMethod | null;
  onWithdrawSuccess: (amount: number) => void;
  currentBalance: number;
}

const WithdrawProcessModal = ({ isOpen, onClose, onBack, selectedMethod, onWithdrawSuccess, currentBalance }: WithdrawProcessModalProps) => {
  const [amount, setAmount] = useState(50);
  const [walletAddress, setWalletAddress] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const presetAmounts = [50, 100, 250, 500];
  const minWithdraw = 20;
  const maxWithdraw = Math.min(currentBalance, 5000);

  const handleWithdraw = () => {
    if (!walletAddress) {
      toast({
        title: "Error",
        description: "Por favor, ingresa una dirección de wallet válida",
        variant: "destructive"
      });
      return;
    }
    
    if (amount < minWithdraw) {
      toast({
        title: "Error",
        description: `El monto mínimo de retiro es €${minWithdraw}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > currentBalance) {
      toast({
        title: "Error",
        description: "Saldo insuficiente",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmWithdraw = () => {
    setIsProcessing(true);
    
    // Simular proceso de retiro
    setTimeout(() => {
      setIsProcessing(false);
      onWithdrawSuccess(amount);
      onClose();
    }, 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "¡Copiado!",
      description: `${label} copiado al portapapeles`,
    });
  };

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] border border-orange-500/30 text-white shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              Confirmar Retiro
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-8">
            {!isProcessing ? (
              <>
                {/* Warning */}
                <div className="bg-orange-900/30 border border-orange-500/50 rounded-lg p-4 flex items-start gap-4">
                  <AlertTriangle className="text-orange-400 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-bold text-orange-200">Importante</h3>
                    <p className="text-sm text-orange-300 mt-1">
                      Verifica cuidadosamente los datos del retiro. Las transacciones no se pueden revertir.
                    </p>
                  </div>
                </div>

                {/* Withdrawal Summary */}
                <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">Resumen del Retiro</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Método</div>
                      <div className="font-bold text-white">{selectedMethod?.name}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Cantidad</div>
                      <div className="font-bold text-green-400 text-xl">€{amount.toFixed(2)}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Comisión</div>
                      <div className="font-bold text-red-400">{selectedMethod?.fee}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Tiempo estimado</div>
                      <div className="font-bold text-blue-400">{selectedMethod?.processingTime}</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-sm text-gray-400 mb-2">Dirección de destino</div>
                    <div className="bg-black/30 rounded-lg p-3 font-mono text-sm break-all text-green-400 border border-gray-700">
                      {walletAddress}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => setShowConfirmation(false)}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirmWithdraw}
                    className="flex-1 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white font-bold"
                  >
                    Confirmar Retiro
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-red-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Procesando retiro...
                </h3>
                <p className="text-gray-300 text-center max-w-md">
                  Estamos procesando tu solicitud de retiro. Recibirás una confirmación en breve.
                </p>
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <Clock className="w-4 h-4 animate-pulse" />
                  <span>Enviando a la blockchain...</span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] border border-orange-500/30 text-white max-h-[95vh] overflow-y-auto shadow-2xl backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-6">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Elegir otro método
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Left - Method info & balance */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Método elegido:
            </h3>
            
            <div className={`bg-gradient-to-br ${selectedMethod?.color} rounded-2xl p-6 border border-white/20 shadow-xl transform hover:scale-105 transition-all duration-300`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl drop-shadow-lg">{selectedMethod?.icon}</div>
                <div>
                  <div className="font-bold text-lg">{selectedMethod?.name}</div>
                  <div className="text-sm opacity-90">{selectedMethod?.symbol}</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Mínimo: €{minWithdraw}.00</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Máximo: €{maxWithdraw.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>Procesamiento: {selectedMethod?.processingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-purple-400" />
                  <span>Comisión: {selectedMethod?.fee}</span>
                </div>
              </div>
            </div>

            {/* Balance info */}
            <div className="bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-purple-900/40 rounded-2xl p-6 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Wallet className="text-blue-400" size={24} />
                <span className="font-bold text-lg text-white">Saldo Disponible</span>
              </div>
              <div className="text-3xl font-bold text-blue-400">€{currentBalance.toFixed(2)}</div>
              <div className="text-sm text-gray-300 mt-2">Disponible para retiro</div>
            </div>
          </div>

          {/* Right - Withdraw form */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Datos del retiro
            </h3>
            
            <div className="space-y-6">
              {/* Amount */}
              <div className="space-y-3">
                <label className="text-sm text-gray-300 font-medium block">Cantidad a retirar</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={minWithdraw}
                    max={maxWithdraw}
                    className="w-full bg-gradient-to-r from-gray-900 to-black border border-orange-500/30 rounded-xl px-6 py-4 text-white text-right text-xl font-bold pr-16 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                  />
                  <span className="absolute right-4 top-4 text-gray-300 font-bold">EUR</span>
                </div>
              </div>

              {/* Preset amounts */}
              <div className="grid grid-cols-2 gap-3">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    variant="ghost"
                    className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 hover:from-orange-600/40 hover:to-red-600/40 text-white border border-gray-600/50 rounded-xl py-3 font-bold transition-all duration-300 transform hover:scale-105"
                    disabled={preset > currentBalance}
                  >
                    {preset} €
                  </Button>
                ))}
              </div>

              {/* Wallet address */}
              <div className="space-y-3">
                <label className="text-sm text-gray-300 font-medium block">
                  Dirección de wallet {selectedMethod?.symbol}
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={`Ingresa tu dirección ${selectedMethod?.symbol}`}
                  className="w-full bg-gradient-to-r from-gray-900 to-black border border-orange-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 font-mono text-sm"
                />
              </div>

              {/* Warning */}
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-red-400 mt-1 flex-shrink-0" size={16} />
                <div className="text-sm text-red-300">
                  <div className="font-bold mb-1">¡Importante!</div>
                  <div>Verifica que la dirección sea correcta. Los retiros no se pueden cancelar una vez procesados.</div>
                </div>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleWithdraw}
                disabled={!walletAddress || amount < minWithdraw || amount > currentBalance}
                className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white font-bold py-6 text-xl rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                💸 Retirar €{amount.toFixed(2)}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawProcessModal;