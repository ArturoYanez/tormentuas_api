import React from "react";
import { Shield, AlertTriangle, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface KYCAlertProps {
  isVisible: boolean;
  onStartKYC: () => void;
  onDismiss: () => void;
}

const KYCAlert: React.FC<KYCAlertProps> = ({ isVisible, onStartKYC, onDismiss }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-md mx-4">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl animate-pulse"></div>
        <Alert className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-orange-500/30 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Verificación Requerida
                </h3>
                <AlertDescription className="text-gray-300 mt-2 leading-relaxed">
                  Para garantizar la seguridad de tu cuenta y cumplir con las regulaciones, 
                  necesitas completar el proceso de verificación de identidad (KYC).
                </AlertDescription>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm text-gray-400">
                  <strong className="text-white">¿Qué necesitas?</strong>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>• Documento de identidad válido</li>
                    <li>• Buena iluminación para las fotos</li>
                    <li>• 5 minutos de tu tiempo</li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={onStartKYC}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verificar Ahora
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button
                    onClick={onDismiss}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50 rounded-xl"
                  >
                    Más Tarde
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default KYCAlert;