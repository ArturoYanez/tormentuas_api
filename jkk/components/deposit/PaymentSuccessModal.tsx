import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

const PaymentSuccessModal = ({ isOpen, onClose, amount }: PaymentSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-[#1A1C2E] to-[#12141D] border border-gray-700/50 text-white text-center shadow-2xl">
        <div className="py-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-green-400">Payment Successful!</h2>
            <p className="text-gray-300">Your deposit has been processed successfully</p>
            
            <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-xl p-4 mt-6">
              <div className="text-sm text-gray-300 mb-1">Amount Deposited</div>
              <div className="text-3xl font-bold text-green-400">€{amount.toFixed(2)}</div>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 shadow-lg hover:shadow-indigo-500/40 transition-shadow duration-300"
          >
            Continue Trading
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessModal;
