import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Clock, Zap, Shield, CheckCircle } from "lucide-react";
import { PaymentMethod } from "./PaymentMethodsModal";
import { toast } from "@/hooks/use-toast";

interface PaymentProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  selectedMethod: PaymentMethod | null;
  onPaymentSuccess: (amount: number) => void;
}

const PaymentProcessModal = ({ isOpen, onClose, onBack, selectedMethod, onPaymentSuccess }: PaymentProcessModalProps) => {
  const [amount, setAmount] = useState(100);
  const [selectedBonus, setSelectedBonus] = useState<string | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const bonuses = [
    { id: "20", percentage: "20%", minDeposit: 52.75, bonus: 10.55 },
    { id: "25", percentage: "25%", minDeposit: 87.92, bonus: 21.98 },
    { id: "30", percentage: "30%", minDeposit: 131.88, bonus: 39.56 },
    { id: "35", percentage: "35%", minDeposit: 263.75, bonus: 92.31 }
  ];

  const presetAmounts = [150, 200, 300, 500];

  const handlePay = () => {
    setShowPaymentDetails(true);
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);
    
    // Simular proceso de pago
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(amount);
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

  if (showPaymentDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] border border-purple-500/30 text-white shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Depositar €{amount.toFixed(2)} via {selectedMethod?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col lg:flex-row gap-8 p-6">
            {/* Left side - Selected method */}
            <div className="lg:w-1/3 space-y-6">
              <Button
                onClick={() => setShowPaymentDetails(false)}
                variant="ghost"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cambiar cantidad
              </Button>
              
              <div className="bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-indigo-900/40 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl drop-shadow-lg">{selectedMethod?.icon}</div>
                  <div>
                    <div className="font-bold text-xl text-white">{selectedMethod?.name}</div>
                    <div className="text-purple-300 text-sm">Método seleccionado</div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Mínimo: €10.00</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Máximo: €43,958.00</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Zap className="w-4 h-4" />
                    <span>Transacción instantánea</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <Shield className="w-4 h-4" />
                    <span>100% Seguro</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Payment details */}
            <div className="lg:w-2/3">
              {!isProcessing ? (
                <div className="bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-700 rounded-2xl p-6 lg:p-8 space-y-8 backdrop-blur-sm">
                  {/* Instructions */}
                  <div className="bg-orange-900/30 border border-orange-500/50 rounded-lg p-4 flex items-start gap-4">
                    <div className="text-orange-400 mt-1 flex-shrink-0">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-orange-200">Instrucciones Importantes</h3>
                      <p className="text-sm text-orange-300 mt-1">
                        Transfiere la cantidad EXACTA a la dirección proporcionada. Cualquier discrepancia puede resultar en la pérdida de fondos.
                      </p>
                    </div>
                  </div>
    
                  {/* Main Payment Area */}
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* QR Code */}
                    <div className="flex-shrink-0 flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 bg-white rounded-xl border-4 border-purple-400/50 shadow-2xl shadow-purple-500/20">
                        <div className="w-36 h-36 bg-gray-200 flex items-center justify-center">
                          <div className="text-xs text-black text-center font-bold">
                            QR CODE<br/>
                            <div className="text-[8px] mt-1 opacity-60">Escanear para pagar</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">Escanear con tu wallet</p>
                    </div>
    
                    {/* Payment Details */}
                    <div className="flex-1 space-y-6">
                      {/* Amount */}
                      <div>
                        <label className="text-sm font-medium text-gray-400">Cantidad a enviar</label>
                        <div className="flex items-center gap-2 mt-1 bg-black/30 rounded-lg p-3 border border-gray-700">
                          <span className="text-xl font-bold text-yellow-400">{(amount * 1.1772).toFixed(2)}</span>
                          <span className="text-gray-400 text-sm">USD</span>
                          <Button onClick={() => copyToClipboard((amount * 1.1772).toFixed(2), "Cantidad")} variant="ghost" size="sm" className="ml-auto text-blue-400 hover:text-blue-300">
                            <Copy size={14} /> <span className="ml-2 hidden sm:inline">Copiar</span>
                          </Button>
                        </div>
                      </div>
    
                      {/* Address */}
                      <div>
                        <label className="text-sm font-medium text-gray-400">A la dirección {selectedMethod?.symbol}</label>
                        <div className="flex items-center gap-2 mt-1 bg-black/30 rounded-lg p-3 border border-gray-700 font-mono text-sm break-all">
                          <span className="text-green-400">TS2xTRG1cEKRaEzm2abhc1UCFFgAByVH8T</span>
                          <Button onClick={() => copyToClipboard("TS2xTRG1cEKRaEzm2abhc1UCFFgAByVH8T", "Dirección")} variant="ghost" size="sm" className="ml-auto text-blue-400 hover:text-blue-300">
                            <Copy size={14} />
                          </Button>
                        </div>
                      </div>
    
                      {/* Timer */}
                      <div className="flex items-center gap-3 text-orange-400 bg-orange-900/20 rounded-lg p-3 border border-orange-500/30">
                        <Clock className="w-5 h-5 animate-pulse" />
                        <span className="font-medium">La cotización expira en:</span>
                        <span className="font-bold text-xl ml-auto">23:59:35</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="pt-6 border-t border-gray-700/50 space-y-4">
                    <Button
                      onClick={handleProcessPayment}
                      className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    >
                      <CheckCircle className="mr-3" />
                      He realizado el pago
                    </Button>
                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 text-blue-400 text-sm bg-blue-900/20 px-4 py-2 rounded-full border border-blue-500/30">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          Esperando confirmación...
                        </div>
                      </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Procesando pago...
                  </h3>
                  <p className="text-gray-300 text-center max-w-md">
                    Estamos verificando tu transacción en la blockchain. Esto puede tomar unos momentos.
                  </p>
                  <div className="flex items-center gap-2 text-yellow-400 text-sm">
                    <Zap className="w-4 h-4" />
                    <span>Confirmando en la red...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] border border-purple-500/30 text-white max-h-[95vh] overflow-y-auto shadow-2xl backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-6">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Elegir otro método
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
          {/* Left - Chosen payment method */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
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
                  <span>Mínimo: €10.00</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Máximo: €43,958.00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>Procesamiento instantáneo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Payment data */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Datos del pago
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm text-gray-300 font-medium block">Cantidad a depositar</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-gradient-to-r from-gray-900 to-black border border-purple-500/30 rounded-xl px-6 py-4 text-white text-right text-xl font-bold pr-16 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  />
                  <span className="absolute right-4 top-4 text-gray-300 font-bold">EUR</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    variant="ghost"
                    className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 hover:from-purple-600/40 hover:to-blue-600/40 text-white border border-gray-600/50 rounded-xl py-3 font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    {preset} €
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-900/20 rounded-xl border border-purple-500/30">
                <input type="checkbox" id="useBonus" className="rounded scale-125" />
                <label htmlFor="useBonus" className="text-sm text-purple-200">
                  Usar bonus - Términos y Condiciones
                </label>
              </div>

              <Button className="text-yellow-400 hover:text-yellow-300 text-sm bg-yellow-900/20 hover:bg-yellow-800/30 border border-yellow-500/30 rounded-xl py-3 transition-all duration-300" variant="ghost">
                🎁 Tengo un código promocional
              </Button>
            </div>
          </div>

          {/* Right - Choose bonus */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Elige tu bonus:
            </h3>
            
            <div className="space-y-4">
              {bonuses.map((bonus) => (
                <div
                  key={bonus.id}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedBonus === bonus.id
                      ? 'border-green-400 bg-gradient-to-r from-green-900/40 to-emerald-900/40 shadow-lg shadow-green-500/20'
                      : 'border-gray-600/50 hover:border-gray-500/70 bg-gradient-to-r from-gray-800/40 to-gray-700/40'
                  }`}
                  onClick={() => setSelectedBonus(bonus.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="radio"
                      name="bonus"
                      checked={selectedBonus === bonus.id}
                      onChange={() => setSelectedBonus(bonus.id)}
                      className="scale-125"
                    />
                    <span className="text-green-400 font-bold text-lg">{bonus.percentage} bonus</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400 mb-1">+{bonus.bonus.toFixed(2)}€</div>
                  <div className="text-xs text-gray-400">
                    Si depositas más de {bonus.minDeposit.toFixed(2)}€
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <Button
            onClick={handlePay}
            className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold py-6 text-xl rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
            💳 Pagar €{amount.toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentProcessModal;
