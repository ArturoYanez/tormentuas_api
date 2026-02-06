import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";

interface WithdrawSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

const WithdrawSuccessModal = ({ isOpen, onClose, amount }: WithdrawSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-[#1A1C2E] to-[#12141D] border border-gray-700/50 text-white text-center shadow-2xl">
        <div className="py-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-orange-400">¡Retiro Procesado!</h2>
            <p className="text-gray-300">Tu solicitud de retiro ha sido enviada correctamente</p>
            
            <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/50 rounded-xl p-4 mt-6">
              <div className="text-sm text-gray-300 mb-1">Cantidad Retirada</div>
              <div className="text-3xl font-bold text-orange-400">€{amount.toFixed(2)}</div>
            </div>

            {/* Processing info */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 flex items-center gap-3 mt-4">
              <Clock className="text-blue-400" size={16} />
              <div className="text-sm text-blue-300">
                Recibirás los fondos en 5-30 minutos
              </div>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 shadow-lg hover:shadow-orange-500/40 transition-shadow duration-300"
          >
            Continuar Trading
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawSuccessModal;